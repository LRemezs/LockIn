// Dependencies
import { observable } from "@legendapp/state";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { debounce } from "lodash";
import {
  formatEventsData,
  getUserEvents,
  sortEventsByStartTime,
} from "../app/utils/eventUtils";
import { getTravelInfo, getUserLocation } from "../app/utils/locationUtils";
import { supabase } from "./supabaseClient";

// Observables for Global State
export const loading$ = observable(true);
export const user$ = observable({
  id: "",
  name: "",
  email: "",
  loggedIn: false,
});
export const events$ = observable([]);

// State Variable Tracking
let trackingInterval = null;
let trackingSubscription = null;
let initialized = false;

// Fetch Events & Add Travel Info
export const fetchEvents = async () => {
  try {
    console.log("🚀 Fetching events from Supabase...");
    if (!user$.loggedIn.get()) return;
    if (events$.get().length === 0) loading$.set(true);

    const userId = user$.id.get();
    const events = await getUserEvents(userId);
    if (!events) return;

    events$.set(formatEventsData(sortEventsByStartTime(events)));
    await updateTravelInfoBasedOnTime(true);
  } catch (error) {
    console.error("❌ Error fetching events:", error.message);
  } finally {
    loading$.set(false);
  }
};

// Time Conversion Helpers:
// Convert "X hours Y mins" → total minutes
const convertTravelTimeToMinutes = (travelTimeStr) => {
  const hoursMatch = travelTimeStr.match(/(\d+)\s*hour/);
  const minutesMatch = travelTimeStr.match(/(\d+)\s*min/);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) * 60 : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
  return hours + minutes;
};

// Handle user movement & detect stop
const handleUserMovement = debounce(async () => {
  console.log("📍 User stopped moving, recalculating travel info...");
  await updateTravelInfoBasedOnTime("dataRefresh");
}, 15000);

// Send Push Notification
const sendIntervalNotification = async (event, timeUntilLeave) => {
  let message = "";
  if (timeUntilLeave < 0) {
    message = `⏰ You are now late for ${event.title} at ${event.location}. Consider rescheduling or canceling.`;
  } else {
    message = `⏳ To reach your next destination (${event.title} at ${event.location}), you should leave in ${timeUntilLeave} minutes. Estimated travel time: ${event.travelTime}.`;
  }
  console.log(`🔔 [Notification] ${message}`);
  await Notifications.scheduleNotificationAsync({
    content: { title: "Travel Update", body: message },
    trigger: null,
  });
};

// Update Travel Info & Check Notifications
const updateTravelInfoBasedOnTime = async (triggeredBy = "interval") => {
  console.log(
    `🔄 Running travel info update... (Triggered by: ${
      triggeredBy === true ? "fetchEvents" : triggeredBy
    })`
  );

  const now = new Date();
  let minInterval = 30 * 60 * 1000; // Default: 30 minutes

  let eventsToUpdate = events$.get();
  if (eventsToUpdate.length === 0) return;

  // ✅ Find the event that is closest for notifications
  const nextEvent = [...eventsToUpdate].sort(
    (a, b) =>
      new Date(`${a.date}T${a.start_time}`) -
      new Date(`${b.date}T${b.start_time}`)
  )[0];

  const updatedEvents = await Promise.all(
    eventsToUpdate.map(async (event) => {
      if (event.track_location && event.latitude && event.longitude) {
        const travelData = await getTravelInfo(event.latitude, event.longitude);
        const travelTimeFromDB = event.estimated_travel_time || "0 mins"; // 🔹 Use DB value as fallback

        const eventTime = new Date(`${event.date}T${event.start_time}`);
        const travelTimeMinutes = convertTravelTimeToMinutes(
          travelData?.travelTime || travelTimeFromDB
        );

        const leaveTime = new Date(
          eventTime.getTime() - travelTimeMinutes * 60000
        );
        const timeUntilLeave = Math.round((leaveTime - now) / 1000 / 60);

        return {
          ...event,
          distance: travelData?.distance || event.distance || 0, // 🔹 Use previous distance if missing
          travelTime: travelData?.travelTime || travelTimeFromDB, // 🔹 Default to DB value
          timeUntilLeave,
        };
      }
      return event;
    })
  );

  // ✅ Store updated events back into `events$`
  events$.set(updatedEvents);

  // ✅ Ensure notifications only focus on the next event
  // ✅ Adjust the update interval dynamically
  if (nextEvent) {
    const timeUntilLeave = updatedEvents.find(
      (e) => e.id === nextEvent.id
    )?.timeUntilLeave;

    if (timeUntilLeave !== undefined) {
      await sendIntervalNotification(nextEvent, timeUntilLeave); // 🔔 Send notification
    }

    if (timeUntilLeave <= 10) {
      minInterval = 60 * 1000; // ✅ Update every 1 min in the last 10 min
    } else if (timeUntilLeave <= 60) {
      minInterval = 5 * 60 * 1000; // ✅ Update every 5 min in the last 60 min
    } else {
      minInterval = 30 * 60 * 1000; // ✅ Default: Every 30 min
    }
  }

  console.log(
    `🔄 Next travel update in ${
      minInterval / 60000
    } minutes. (Triggered by: ${triggeredBy})`
  );
  setTimeout(() => updateTravelInfoBasedOnTime("interval"), minInterval);
};

// Start Travel Update Checker
const startTravelUpdateChecker = () => {
  console.log("🚀 Starting travel update checker...");
  updateTravelInfoBasedOnTime("initial");
};

// Handle Auth Changes
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    if (!initialized) {
      initialized = true;
      console.log("🟢 User logged in, updating state...");

      user$.set({
        id: session.user.id,
        name: session.user.user_metadata?.name || "Unknown",
        email: session.user.email,
        loggedIn: true,
      });

      fetchEvents();
      startLocationTracking();
      startTravelUpdateChecker();
    }
  } else {
    console.log("🚪 User logged out, clearing state.");
    user$.set({ id: "", name: "", email: "", loggedIn: false });
    events$.set([]);
    initialized = false;

    if (trackingInterval) {
      clearInterval(trackingInterval);
      trackingInterval = null;
      console.log("🛑 Stopped travel update checker.");
    }
    stopLocationTracking();
  }
});

// Start Location Tracking
export const startLocationTracking = async () => {
  try {
    await getUserLocation();

    if (trackingSubscription) trackingSubscription.remove();
    trackingSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5 * 60 * 1000,
        distanceInterval: 50,
      },
      handleUserMovement
    );
  } catch (error) {
    console.error("❌ Error starting location tracking:", error.message);
  }
};

// Stop Location Tracking
export const stopLocationTracking = () => {
  if (trackingSubscription) {
    trackingSubscription.remove();
    trackingSubscription = null;
    console.log("🛑 Stopped location tracking.");
  }
};
