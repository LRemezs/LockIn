import { computed, observable } from "@legendapp/state";
import * as Notifications from "expo-notifications";
import { supabase } from "../state/supabaseClient";
import { calculateTimeUntilLeave } from "../utils/helperUtils";

/**
 * => Notification State
 *          nextEvent$
 *          filteredEvents$
 *          notificationQueue$
 *          displayedEvents$
 * => Notification logic
 *          requestNotificationPermissions
 *          notifyPendingEvents
 * => Event scheduling and support functions
 *          notificationQueue$.onChange
 *          events$.onChange
 *          scheduleEventNotifications
 *          handleUrgencyNotification
 *          getNextNotificationTime
 *          scheduleNextCheck
 *          updateEventStatus
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
  console.log("🔄 Fetching latest events to ensure accurate scheduling...");

  // 🔄 Always refresh the event queue from Supabase before scheduling
  const { data: updatedEvents, error } = await supabase
    .from("events")
    .select("*")
    .neq("event_status", "complete"); // Get only active events

  if (error) {
    console.error("❌ Error fetching updated events:", error.message);
    return;
  }

  // ✅ Update local state
  events$.set(updatedEvents);

  // 🔄 Fetch the latest queue after state update
  const events = notificationQueue$.get();

  if (!events.length) {
    console.log("✅ No upcoming events. Stopping notifications.");
    return;
  }

  const nextEvent = events[0]; // Always focus on the next event
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

// 🔔 Schedules the next notification based on urgency level
const scheduleNextNotification = async (event, departureTime) => {
  let notificationInterval = getNextNotificationTime(departureTime);

  console.log(
    `🔔 Notification Sent: ⏳ Leave in ${departureTime} min for "${
      event.title
    }" (ETA: ${
      event.estimated_travel_time
    } min) at ${new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`
  );

  // 🔄 If departure time is reached, restart notification scheduling
  if (notificationInterval === null) {
    scheduleEventNotifications();
    return;
  }

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
const scheduleNextCheck = (minutes) => {
  if (notificationTimeoutId) clearTimeout(notificationTimeoutId);

  console.log(`🔄 Next notification scheduled in ${minutes} min.`);
  notificationTimeoutId = setTimeout(
    scheduleEventNotifications,
    minutes * 60 * 1000
  );
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
