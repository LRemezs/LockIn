import { observable } from "@legendapp/state";
import { supabase } from "./supabaseClient";
// Store the user information (e.g., after login)
export const user$ = observable({
  name: "",
  email: "",
  loggedIn: false,
});

// 🔹 Store the user event information
export const events$ = observable({});

// 🔹 Fetch Events from Supabase and Store in Legend-State
export const fetchEvents = async () => {
  try {
    const { data, error } = await supabase.from("events").select("*");

    if (error) throw error;

    const formattedEvents = {};
    data.forEach((event) => {
      if (!formattedEvents[event.date]) {
        formattedEvents[event.date] = [];
      }
      formattedEvents[event.date].push({
        id: event.id,
        type: event.title,
        duration: event.duration,
        location: event.location,
      });
    });

    events$.set(() => formattedEvents);
  } catch (error) {
    console.error("Error fetching events:", error.message);
  }
};

// 🔹 Automatically Fetch Events on App Load
fetchEvents();

// Store app settings (e.g., theme preferences)
export const settings$ = observable({
  darkMode: false,
  notificationsEnabled: true,
});
