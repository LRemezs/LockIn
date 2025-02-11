import {
  startLocationTracking,
  updateTravelInfoBasedOnTime,
} from "../utils/calendarUtils";
import { calculateTimeUntilLeave } from "../utils/helperUtils";
import {
  events$,
  scheduleEventNotifications,
} from "../utils/notificationUtils";
import { fetchAndProcessEvents, user$ } from "./stateObservables";
import { supabase } from "./supabaseClient";

let initialized = false;
let travelUpdateInterval = null;

// Handle Auth Changes
supabase.auth.onAuthStateChange(async (event, session) => {
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

      console.log("📍 Starting location tracking...");
      await startLocationTracking(); // Wait for location tracking to finish first

      console.log("📍 Location received. Now fetching events...");
      await fetchAndProcessEvents();

      startTravelUpdateChecker();
      scheduleEventNotifications(); // Only starts AFTER location tracking & event fetch
    }
  }
});

// Start Travel Update Checker Every 5 Minutes
export const startTravelUpdateChecker = () => {
  if (!travelUpdateInterval) {
    console.log("🚀 Starting travel update checker...");

    travelUpdateInterval = setInterval(() => {
      const nextEvent = events$
        .get()
        .find((event) => event.event_status === "today");

      const minutesUntilDeparture = nextEvent
        ? calculateTimeUntilLeave(nextEvent)
        : Infinity;

      let updateFrequency = 5 * 60 * 1000; // Default: 5 minutes
      if (minutesUntilDeparture < 30) updateFrequency = 2 * 60 * 1000;
      if (minutesUntilDeparture < 10) updateFrequency = 1 * 60 * 1000;

      console.log(
        `🔄 Adjusting travel updates to every ${updateFrequency / 60000} min.`
      );
      clearInterval(travelUpdateInterval);
      travelUpdateInterval = setInterval(
        updateTravelInfoBasedOnTime,
        updateFrequency
      );
    }, 5 * 60 * 1000);
  }
};

// Stop Travel Update Checker on Logout
export const stopTravelUpdateChecker = () => {
  if (travelUpdateInterval) {
    clearInterval(travelUpdateInterval);
    travelUpdateInterval = null;
    console.log("🛑 Stopped travel update checker.");
  }
};
