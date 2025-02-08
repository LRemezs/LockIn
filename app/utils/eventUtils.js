import { supabase } from "../../state/supabaseClient";

// Fetch Events from Supabase
export const getUserEvents = async (userId) => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("❌ Supabase Error:", error.message);
    return null;
  }
  return data;
};

// Sort Events by Start Time
export const sortEventsByStartTime = (events) =>
  events.sort(
    (a, b) =>
      new Date(`${a.date}T${a.start_time}`) -
      new Date(`${b.date}T${b.start_time}`)
  );

// Convert minutes → "X hours Y mins"
export const formatMinutesToTravelTime = (minutes) => {
  if (minutes < 1) return "N/A";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0
    ? `${hours} hr ${remainingMinutes} min`
    : `${remainingMinutes} min`;
};

// Format Events with Defaults
export const formatEventsData = (events) =>
  events.map((event) => ({
    ...event,
    distance: event.distance || 0,
    travelTime: formatMinutesToTravelTime(event.estimated_travel_time || 0),
  }));
