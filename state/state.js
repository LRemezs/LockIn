import {
  getUserLocation,
  startLocationTracking,
  updateTravelInfoBasedOnTime,
} from "../utils/calendarUtils";
import { refreshAllChallenges } from "../utils/challengesUtils";
import { calculateTimeUntilLeave } from "../utils/helperUtils";
import { events$ } from "../utils/notificationUtils";
import { refreshAllQuests } from "../utils/questsUtils";
import { fetchAndProcessEvents, user$ } from "./stateObservables";
import { supabase } from "./supabaseClient";

let initialized = false;
let travelUpdateInterval = null;

// Handle Auth State Changes
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session?.user && !initialized) {
    initialized = true;
    console.log("🟢 User logged in, updating state...");

    // Set user info
    user$.set({
      id: session.user.id,
      name: session.user.user_metadata?.name || "Unknown",
      email: session.user.email,
      loggedIn: true,
    });

    // Fetch initial location
    let initialLocation = await getUserLocation();
    if (!initialLocation) {
      console.warn("⚠️ Failed to get location. Retrying...");
      initialLocation = await getUserLocation();
    }

    // Proceed only if location is available
    if (initialLocation) {
      await startLocationTracking(); // Start tracking

      // Fetch events and start travel/notifications
      await fetchAndProcessEvents();

      startTravelUpdateChecker();
      await refreshAllChallenges();
      await refreshAllQuests();
    } else {
      console.error("❌ Failed to retrieve location. Can't proceed.");
    }
  } else if (!session?.user && initialized) {
    console.log("🚪 User logged out, resetting state...");
    initialized = false;
    user$.set({ id: "", name: "", email: "", loggedIn: false });
  }
});

// Start Travel Update Checker Every 5 Minutes
export const startTravelUpdateChecker = () => {
  if (!travelUpdateInterval) {
    console.log("👍 Starting travel update checker...");

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
