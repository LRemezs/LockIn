/**
 * => Utils with no imports to avoid Require Cycle warnings
 *          formatMinutesToTravelTime
 *          sortEventsByStartTime
 *          getUserEvents
 *          calculateTimeUntilLeave
 *          formatTimeToHHMM
 *          isValidTimeFormat
 *          formatTimeInput
 *          handleTimeChange
 */

// Convert minutes to a human-readable travel time (e.g., "1 hr 30 min")
export const formatMinutesToTravelTime = (minutes) => {
  if (!Number.isFinite(minutes) || minutes < 0) return "N/A"; // ✅ Handles invalid input

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return hours > 0
    ? `${hours} hr ${remainingMinutes} min`
    : `${remainingMinutes} min`;
};

// Sort an array of events by start time.
export const sortEventsByStartTime = (events) => {
  return [...events].sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.start_time}`).getTime();
    const timeB = new Date(`${b.date}T${b.start_time}`).getTime();
    return timeA - timeB;
  });
};

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

// Calculate time until a user needs to leave for an event.
export const calculateTimeUntilLeave = (event, travelTimeMinutes) => {
  if (
    !event ||
    !event.date ||
    !event.start_time ||
    !Number.isFinite(travelTimeMinutes)
  ) {
    console.error("❌ ERROR: Invalid event data or travel time", {
      travelTimeMinutes,
      event,
    });
    return "N/A";
  }

  const now = new Date();
  const eventTime = new Date(`${event.date}T${event.start_time}`);
  const leaveTime = new Date(eventTime.getTime() - travelTimeMinutes * 60000);
  let timeUntilLeave = Math.round((leaveTime - now) / 60000);

  return Math.max(timeUntilLeave, 0); // ✅ Prevents negative values
};

// Format a time string to "HH:MM"
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
export const isValidTimeFormat = (time) => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
};

// Format time input dynamically as the user types.
export const formatTimeInput = (value) => {
  const cleanedValue = value.replace(/\D/g, ""); // Remove non-numeric characters
  let formatted = "";

  if (cleanedValue.length >= 2) {
    formatted += cleanedValue.slice(0, 2);
    if (cleanedValue.length > 2) formatted += ":" + cleanedValue.slice(2, 4);
  } else {
    formatted = cleanedValue;
  }

  return formatted.slice(0, 5).padEnd(5, "0"); // ✅ Ensure HH:MM format is correct
};

// Handle formatted time input change.
export const handleTimeChange = (value, setTime) => {
  if (typeof setTime !== "function") {
    console.error("❌ Error: setTime function is undefined!");
    return;
  }
  setTime(formatTimeInput(value));
};

// Add distance and formatted travel times to events
export const formatEventsData = (events) =>
  events.map((event) => ({
    ...event,
    distance: event.distance || 0,
    travelTime: formatMinutesToTravelTime(event.estimated_travel_time || 0),
  }));
