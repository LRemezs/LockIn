import { observable } from "@legendapp/state";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { debounce } from "lodash";
import { getTravelInfo, getUserLocation } from "../app/utils/locationUtils";
import { supabase } from "./supabaseClient";

export const loading$ = observable(true);
// 🔹 Store user information
export const user$ = observable({
  id: "",
  name: "",
  email: "",
  loggedIn: false,
});

// 🔹 Store events for the logged-in user
export const events$ = observable([]);
let lastFetched = null; // Track last fetch time
let trackingInterval = null; // Track current interval

// 🔹 Fetch Events & Add Travel Info
export const fetchEvents = async () => {
  try {
    loading$.set(true); // ✅ Set loading before fetching

    if (!user$.loggedIn.get()) return;

    const userId = user$.id.get();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    console.log("✅ Events fetched successfully:", data);

    const userLocation = await getUserLocation();
    const updatedEvents = await Promise.all(
      data.map(async (event) => {
        if (event.latitude && event.longitude) {
          const travelData = await getTravelInfo(
            event.latitude,
            event.longitude
          );
          return {
            ...event,
            distance: travelData?.distance || 0,
            travelTime: travelData?.travelTime || "N/A",
          };
        }
        return { ...event, distance: 0, travelTime: "N/A" };
      })
    );

    events$.set(updatedEvents); // ✅ Update state
  } catch (error) {
    console.error("❌ Error fetching events:", error.message);
  } finally {
    loading$.set(false); // ✅ Ensure loading is false when done
  }
};

// 🔹 Send Push Notification when interval changes
const sendIntervalNotification = async (message) => {
  await Notifications.scheduleNotificationAsync({
    content: { title: "Travel Update", body: message },
    trigger: null,
  });
};

// 🔹 Determine correct travel update interval
const getUpdateInterval = (event) => {
  const now = new Date();
  const eventTime = new Date(`${event.date}T${event.start_time}`);
  const travelTimeMinutes = event.travelTime ? parseInt(event.travelTime) : 0;

  const timeUntilEvent = (eventTime - now) / 1000 / 60; // Convert to minutes

  if (timeUntilEvent <= 10 + travelTimeMinutes) {
    return 60 * 1000; // Every 1 minute
  } else if (timeUntilEvent <= 60 + travelTimeMinutes) {
    return 5 * 60 * 1000; // Every 5 minutes
  } else {
    return 30 * 60 * 1000; // Default: Every 30 minutes
  }
};

// 🔹 Update Travel Info Based on Time
const updateTravelInfoBasedOnTime = async () => {
  const now = Date.now();
  let minInterval = Infinity;

  const updatedEvents = await Promise.all(
    events$.get().map(async (event) => {
      if (event.track_location && event.latitude && event.longitude) {
        const travelData = await getTravelInfo(event.latitude, event.longitude);
        const interval = getUpdateInterval(event);
        minInterval = Math.min(minInterval, interval);

        return {
          ...event,
          distance: travelData?.distance || 0,
          travelTime: travelData?.travelTime || "N/A",
        };
      }
      return event;
    })
  );

  events$.set(updatedEvents);

  if (minInterval !== trackingInterval) {
    trackingInterval = minInterval;
    sendIntervalNotification(
      `Travel updates will now occur every ${trackingInterval / 60000} minutes.`
    );
  }

  setTimeout(updateTravelInfoBasedOnTime, minInterval);
};

// 🔹 Handle user movement & detect stop
const handleUserMovement = debounce(async () => {
  console.log("📍 User stopped moving, recalculating travel info...");
  await updateTravelInfoBasedOnTime();
}, 15000); // 15 seconds after stopping

// 🔹 Start Location Tracking
export const startLocationTracking = async () => {
  try {
    await getUserLocation(); // ✅ Ensure permission is granted

    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5 * 60 * 1000, // Default 5 minutes
        distanceInterval: 50, // 🛣️ Update only if moved 50m
      },
      handleUserMovement
    );
  } catch (error) {
    console.error("❌ Error starting location tracking:", error.message);
  }
};

// 🔹 Ensure user login state updates correctly
export const watchUserLogin = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    if (error.message.includes("Auth session missing")) {
      console.warn("⚠️ No active user session. Waiting for login...");
    } else {
      console.error("❌ Unexpected error fetching user:", error.message);
    }
    return;
  }

  if (data?.user) {
    console.log("✅ User detected:", data.user);

    user$.set({
      id: data.user.id || "MISSING_USER_ID",
      name: data.user.user_metadata?.name || "Unknown",
      email: data.user.email || "No email",
      loggedIn: true,
    });

    console.log("🟢 Updated user state:", user$.get());
  } else {
    console.warn("⚠️ No user session found.");
  }
};

// 🔹 Listen for real-time authentication changes
let initialized = false;

supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    if (!initialized) {
      initialized = true; // ✅ Prevent duplicate state updates
      console.log("🟢 User logged in, updating state...");

      user$.set({
        id: session.user.id,
        name: session.user.user_metadata?.name || "Unknown",
        email: session.user.email || "No email",
        loggedIn: true,
      });

      fetchEvents(); // ✅ Fetch events when user logs in
      startLocationTracking(); // ✅ Start tracking after login
      updateTravelInfoBasedOnTime(); // ✅ Start dynamic travel updates
    }
  } else {
    console.log("🚪 User logged out, clearing state.");

    user$.set({ id: "", name: "", email: "", loggedIn: false });
    events$.set([]); // ✅ Clear events when logging out
    initialized = false;
  }
});

// ✅ Ensure user state initializes on app start
watchUserLogin();
