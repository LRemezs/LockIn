import { GOOGLE_MAPS_API_KEY } from "@env";
import { computed, observable } from "@legendapp/state";
import * as Notifications from "expo-notifications";
import { supabase } from "../state/supabaseClient";
import { calculateTimeUntilLeave } from "../utils/helperUtils";

/**
 * => Notification State
 *          events$
 *          nextEvent$
 *          notificationQueue$
 *          displayedEvents$
 * => Notification logic
 *          sendNotification
 *          requestNotificationPermissions
 *          notifyPendingEvents
 * => Event scheduling and support functions
 *          notificationQueue$.onChange
 *          handleUrgencyNotification
 *          processDepartureNotification
 *          confirmEventPendingStatus
 *          scheduleEventNotifications
 *          getNextNotificationTime
 *          scheduleNextCheck
 *          updateEventStatus
 * getTravelinfo
 * getCachedUserLocation
 * setCachedUserLocation
 */

let notificationTimeoutId = null;

export const events$ = observable([]);
export const nextEvent$ = observable(null);
export const notificationQueue$ = computed(() => {
  return events$
    .get()
    .filter(
      (event) =>
        event.event_status === "today" ||
        (event.event_status === "pending" && !event.notified)
    )
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.start_time}`) -
        new Date(`${b.date}T${b.start_time}`)
    );
});
export const displayedEvents$ = computed(() => {
  return events$
    .get()
    .filter((event) => event.event_status !== "complete")
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.start_time}`) -
        new Date(`${b.date}T${b.start_time}`)
    );
});

// Send an instant notification
export const sendNotification = async (message) => {
  console.log(`🔔 Notification: ${message}`);

  await Notifications.scheduleNotificationAsync({
    content: { title: "Event Reminder", body: message },
    trigger: null,
  });
};

// Request notification permissions
export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.warn("⚠️ Notification permissions not granted.");
  }
};

// Notify about pending events on log-in
export const notifyPendingEvents = async () => {
  const pendingEvents = events$
    .get()
    .filter((event) => event.event_status === "pending" && !event.notified);

  if (!pendingEvents.length) return;

  for (const event of pendingEvents) {
    const message = `❗ Departure time for "${event.title}" has been missed.`;
    await sendNotification(message);
    console.log(`🔔 Notification Sent: ${message}`);

    events$.set(
      events$
        .get()
        .map((e) => (e.id === event.id ? { ...e, notified: true } : e))
    );

    await supabase.from("events").update({ notified: true }).eq("id", event.id);
  }
};

// Start notifications when queue is updated
notificationQueue$.onChange((newQueue) => {
  if (newQueue.length) {
    console.log("🔄 Queue updated! Processing notifications...");
    scheduleEventNotifications();
  }
});

// Notification Scheduler
export const scheduleEventNotifications = async () => {
  console.log("👍 Starting notification services...");

  // Always refresh the event queue from Supabase before scheduling
  const { data: updatedEvents, error } = await supabase
    .from("events")
    .select("*")
    .neq("event_status", "complete"); // Get only active events

  if (error) {
    console.error("❌ Error fetching updated events:", error.message);
    return;
  }

  // Update local state
  events$.set(updatedEvents);

  // Fetch the latest queue after state update
  const events = notificationQueue$.get();

  if (!events.length) {
    console.log("✅ No upcoming events. Stopping notifications.");
    return;
  }

  // Validate and calculate departure time
  const nextEvent = events[0];
  if (nextEvent.estimated_travel_time == null) {
    console.warn(
      `⚠️ Missing travel time for event "${nextEvent.title}". Fetching now...`
    );

    const travelInfo = await getTravelInfo(nextEvent);
    if (travelInfo) {
      nextEvent.estimated_travel_time = travelInfo.estimated_travel_time;
      nextEvent.distance = travelInfo.distance;
      nextEvent.time_until_departure = travelInfo.time_until_departure;

      // Update event in Supabase
      await supabase
        .from("events")
        .update({
          estimated_travel_time: travelInfo.estimated_travel_time,
          distance: travelInfo.distance,
        })
        .eq("id", nextEvent.id);
    } else {
      console.error(`❌ Failed to fetch travel info for "${nextEvent.title}".`);
      return;
    }
  }

  const departureTime = calculateTimeUntilLeave(
    nextEvent,
    nextEvent.estimated_travel_time
  );

  console.log(
    `🔄 Scheduling notifications for "${nextEvent.title}" - Departure in ${departureTime} min (ETA: ${nextEvent.estimated_travel_time} min)`
  );

  await handleUrgencyNotification(nextEvent, departureTime);
};

//  Handle Urgency & Departure Notifications (Now Adjusts for Delays)
const handleUrgencyNotification = async (event, departureTime) => {
  if (departureTime === 0) {
    await processDepartureNotification(event);
    return;
  }

  await scheduleNextNotification(event, departureTime);
};

// Handles the "Time to Leave" notification and event status update
const processDepartureNotification = async (event) => {
  console.log(`🚗 Time to leave for ${event.title}!`);
  await sendNotification(`🚗 Time to leave for ${event.title}!`);

  const { error } = await supabase
    .from("events")
    .update({ event_status: "pending", notified: true })
    .eq("id", event.id);

  if (error) {
    console.error(
      `❌ Failed to update "${event.title}" in Supabase:`,
      error.message
    );
    return;
  }

  const confirmed = await confirmEventPendingStatus(event);
  if (!confirmed) {
    console.error(
      `❌ Supabase did not confirm status update for "${event.title}". Skipping event.`
    );
    return;
  }

  console.log(`🔄 Removing processed event "${event.title}" from local queue.`);

  console.log(
    `🔄 Fetching updated events to ensure correct next event is scheduled...`
  );
  await scheduleEventNotifications();
};

// Waits for Supabase to confirm event update
const confirmEventPendingStatus = async (event) => {
  console.log(
    `🔄 Waiting for Supabase confirmation of "${event.title}" update...`
  );

  let a = 1,
    b = 1,
    attempts = 0;

  while (attempts < 10) {
    // Limit to 10 retries (adjust as needed)
    await new Promise((resolve) => setTimeout(resolve, a * 1000));

    const { data, error } = await supabase
      .from("events")
      .select("event_status, notified")
      .eq("id", event.id)
      .single();

    if (error) {
      console.error(`❌ Error fetching event "${event.title}":`, error.message);
    } else if (data?.event_status === "pending" && data?.notified === true) {
      console.log(
        `✅ Supabase confirmed "${event.title}" is "pending" and notified: true.`
      );
      return true;
    }

    // Increase wait time using Fibonacci sequence
    [a, b] = [b, a + b];
    attempts++;
  }

  console.error(
    `❌ Supabase update for "${event.title}" failed after ${attempts} retries.`
  );
  return false;
};

// Schedules the next notification based on urgency level
const scheduleNextNotification = async (event, departureTime) => {
  // Determine the interval for the next notification
  let notificationInterval = getNextNotificationTime(departureTime);
  const timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (notificationInterval === null) {
    console.log(`🔄 Notification scheduling ended for "${event.title}".`);
    scheduleEventNotifications();
    return;
  }

  // Check if departure time is within the next 60 minutes
  if (departureTime <= 60) {
    sendNotification(
      `⏳ Time to leave in ${departureTime} min for "${event.title}"!`
    );
    console.log(
      `🔄 [${timestamp}] Next notification Scheduled: Event "${event.title}" - Departure in ${departureTime} min (ETA: ${event.estimated_travel_time} min). Next check in ${notificationInterval} min.`
    );
  } else {
    console.log(
      `🔄 [${timestamp}] Notification Scheduled: Event "${event.title}" - Departure in ${departureTime} min (ETA: ${event.estimated_travel_time} min). Next check in ${notificationInterval} min.`
    );
  }

  // Schedule the next notification check
  scheduleNextCheck(notificationInterval);
};

// Improved function to calculate next notification timing
const getNextNotificationTime = (departureTime) => {
  if (departureTime > 60) return departureTime - 60; // Notify 60 min before
  if (departureTime > 10) return Math.min(10, departureTime - 10); // Every 10 min or sooner
  if (departureTime > 0) return Math.min(5, departureTime);
  return null; // Departure time reached, process immediately
};

// Schedule Next Notification (Prevents Overlaps)
// Schedule Next Notification (Prevents Overlaps)
const scheduleNextCheck = (minutes) => {
  if (notificationTimeoutId) clearTimeout(notificationTimeoutId);

  notificationTimeoutId = setTimeout(() => {
    console.log(`🔄 Restarting notification scheduler in ${minutes} min...`);
    scheduleEventNotifications();
  }, minutes * 60 * 1000);
};

// Update event status in Supabase
export const updateEventStatus = async (eventId, status) => {
  console.log(`🔄 Updating event ID ${eventId} to status: ${status}`);

  try {
    const { error } = await supabase
      .from("events")
      .update({ event_status: status })
      .eq("id", eventId);

    if (error) throw error;

    console.log(`✅ Event ID ${eventId} updated to "${status}".`);

    // Fetch fresh events from Supabase to ensure UI updates
    const { data: updatedEvents, error: fetchError } = await supabase
      .from("events")
      .select("*");

    if (fetchError) throw fetchError;

    events$.set(updatedEvents); // retriggers computed states as a side product

    return true;
  } catch (error) {
    console.error("❌ Error updating event status:", error.message);
    return false;
  }
};

// Fetch travel info from Google Maps API
export const getTravelInfo = async (event) => {
  try {
    if (!event?.latitude || !event?.longitude) {
      console.error(
        `❌ Error: Missing coordinates for event "${
          event?.title || "Unknown"
        }".`
      );
      return null;
    }

    let userLocation = getCachedUserLocation();
    if (!userLocation) {
      console.warn("⚠️ Cannot fetch travel info: No location available.");
      return null;
    }

    const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation}&destination=${event.latitude},${event.longitude}&mode=driving&departure_time=now&traffic_model=best_guess&key=${GOOGLE_MAPS_API_KEY}`;

    console.log(
      `🚀 Fetching travel info for event "${event.title}" from Google Maps...`
    );
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== "OK") {
      console.error(
        `❌ Google API Error for "${event.title}":`,
        data.error_message || data.status
      );
      return null;
    }

    const route = data.routes[0]?.legs[0];
    if (!route) {
      console.error(
        `❌ Error: No valid route found for event "${event.title}".`
      );
      return null;
    }

    // Convert meters to miles (1 mile = 1609.34 meters)
    const distanceMiles = route?.distance?.value
      ? route.distance.value / 1609.34
      : 0;
    const estimatedTravelTime = route?.duration?.value
      ? Math.round(route.duration.value / 60)
      : 0;

    // Calculate time left until departure
    const eventStartTime = new Date(`${event.date}T${event.start_time}`);
    const currentTime = new Date();
    const timeUntilDeparture =
      Math.round((eventStartTime - currentTime) / (1000 * 60)) -
      estimatedTravelTime;

    console.log(
      `📡 Travel info received for "${event.title}": ` +
        `Distance - ${distanceMiles.toFixed(1)} miles, ` +
        `ETA - ${estimatedTravelTime} min, ` +
        `Time until departure - ${timeUntilDeparture} min`
    );

    return {
      distance: distanceMiles,
      estimated_travel_time: estimatedTravelTime,
      time_until_departure: timeUntilDeparture,
    };
  } catch (error) {
    console.error(
      `❌ Error fetching travel info for "${event?.title || "Unknown"}":`,
      error
    );
    return null;
  }
};

// Get cached location
let cachedUserLocation = null;

export const getCachedUserLocation = () => cachedUserLocation;

//  Set cached location
export const setCachedUserLocation = (location) => {
  cachedUserLocation = location;
};
