/**
 * => Utility functions for event handling
 *          formatMinutesToTravelTime
 *          sortEventsByStartTime
 *          getUserEvents
 *          calculateTimeUntilLeave
 *          formatTimeToHHMM
 *          isValidTimeFormat
 *          formatTimeInput
 *          handleTimeChange
 *          addTravelTime
 */

// Convert minutes to human-readable travel time (e.g., "1 hr 30 min")
export const formatMinutesToTravelTime = (minutes) => {
  if (!Number.isFinite(minutes) || minutes < 0) return "N/A";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return hours > 0
    ? `${hours} hr ${remainingMinutes} min`
    : `${remainingMinutes} min`;
};

// Sort events by start time
export const sortEventsByStartTime = (events) =>
  [...events].sort(
    (a, b) =>
      new Date(`${a.date}T${a.start_time}`).getTime() -
      new Date(`${b.date}T${b.start_time}`).getTime()
  );

// Fetch user events from Supabase.
export const getUserEvents = async (supabase, userId) => {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    return Array.isArray(data) ? data : []; // ✅ Always return an array
  } catch (error) {
    console.error("❌ Supabase Error:", error.message);
    return [];
  }
};

// Calculate time until user needs to leave
export const calculateTimeUntilLeave = (event, estimated_travel_time) => {
  if (
    !event ||
    !event.date ||
    !event.start_time ||
    !Number.isFinite(estimated_travel_time)
  ) {
    console.error("❌ ERROR: Invalid event data or travel time", {
      estimated_travel_time,
      event,
    });
    return "N/A";
  }

  const now = new Date();
  const eventTime = new Date(`${event.date}T${event.start_time}`);
  const leaveTime = new Date(
    eventTime.getTime() - estimated_travel_time * 60000
  );
  let timeUntilLeave = Math.max(Math.round((leaveTime - now) / 60000), 0);

  return timeUntilLeave;
};

// Format time to HH:MM
export const formatTimeToHHMM = (timeString) => {
  if (
    !timeString ||
    typeof timeString !== "string" ||
    !timeString.includes(":")
  ) {
    console.warn(`⚠️ Invalid time format received: "${timeString}"`);
    return "Invalid Time";
  }

  const [hours, minutes] = timeString.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

// Validate time format (HH:MM)
export const isValidTimeFormat = (time) =>
  /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);

// Improved: Format time input dynamically as user types
export const formatTimeInput = (value) => {
  const cleanedValue = value.replace(/\D/g, ""); // Remove non-numeric characters
  let formatted = "";

  if (cleanedValue.length >= 2) {
    formatted += cleanedValue.slice(0, 2);
    if (cleanedValue.length > 2) formatted += ":" + cleanedValue.slice(2, 4);
  } else {
    formatted = cleanedValue;
  }

  return formatted.slice(0, 5); // Ensure max length of 5 characters
};

// Handle time input and enforce correct HH:MM format
export const handleTimeChange = (value, setTime) => {
  if (typeof setTime !== "function") {
    console.error("❌ Error: setTime function is undefined!");
    return;
  }

  // Remove non-numeric characters
  const cleanedValue = value.replace(/\D/g, "");

  let formatted = "";
  if (cleanedValue.length >= 2) {
    formatted += cleanedValue.slice(0, 2);
    if (cleanedValue.length > 2) {
      formatted += ":" + cleanedValue.slice(2, 4);
    }
  } else {
    formatted = cleanedValue;
  }

  const finalValue = formatted.slice(0, 5);

  // Enforce `HH:MM` format and validate input
  if (isValidTimeFormat(finalValue)) {
    setTime(finalValue);
  } else {
    setTime(finalValue.replace(/[^0-9:]/g, "")); // Remove invalid characters
  }
};

// Format event data (adds calculated travel time)
export const addTravelTime = (events) =>
  events.map((event) => ({
    ...event,
    distance: event.distance || 0,
    travelTime: formatMinutesToTravelTime(event.estimated_travel_time || 0),
  }));
