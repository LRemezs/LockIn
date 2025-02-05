import { observable } from "@legendapp/state";
import * as Location from "expo-location";
import { getTravelInfo, getUserLocation } from "../app/utils/locationUtils";
import { supabase } from "./supabaseClient";

// 🔹 Store user information
export const user$ = observable({
  id: "",
  name: "",
  email: "",
  loggedIn: false,
});

// 🔹 Store events for the logged-in user
export const events$ = observable([]);

// 🔹 Fetch Events & Add Travel Info
export const fetchEvents = async () => {
  try {
    if (!user$.loggedIn.get()) return; // ✅ Only fetch if logged in

    const userId = user$.id.get();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    console.log("✅ Events fetched successfully:", data);

    // ✅ Fetch travel info for each event
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

    events$.set(updatedEvents); // ✅ Update state in Legend-State
  } catch (error) {
    console.error("❌ Error fetching events:", error.message);
  }
};

// 🔹 Auto-Update Travel Info When User Moves
export const startLocationTracking = async () => {
  try {
    await getUserLocation(); // ✅ Ensure permission is granted

    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 60000,
        distanceInterval: 50,
      },
      async () => {
        console.log("📍 User moved, updating travel info...");
        await fetchEvents(); // ✅ Re-fetch events with updated distances
      }
    );
  } catch (error) {
    console.error("❌ Error starting location tracking:", error.message);
  }
};

// 🔹 Ensure user login state updates correctly
export const watchUserLogin = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("❌ Error fetching user:", error.message);
    return;
  }

  if (data?.user) {
    console.log("✅ User detected:", data.user);

    // ✅ Set user$.id before anything else
    user$.id.set(data.user.id || "MISSING_USER_ID");
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
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    console.log(`🔄 Auth state changed: ${event}, updating user state.`);

    user$.set({
      id: session.user.id,
      name: session.user.user_metadata?.name || "Unknown",
      email: session.user.email || "No email",
      loggedIn: true,
    });

    fetchEvents(); // ✅ Fetch events when the user logs in
  } else {
    console.log("🚪 User logged out, clearing state.");

    user$.set({ id: "", name: "", email: "", loggedIn: false });
    events$.set([]); // ✅ Clear events when logging out
  }
});

// ✅ Ensure user state initializes on app start
watchUserLogin();
