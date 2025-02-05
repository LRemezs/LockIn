import { Alert } from "react-native";
import { fetchEvents } from "../../state/state";
import { supabase } from "../../state/supabaseClient";

// ✅ Add or Update Event
export const handleSaveEvent = async (
  eventToEdit,
  selectedDate,
  eventTitle,
  startTime,
  endTime,
  trackLocation,
  location,
  userId,
  onClose,
  resetForm,
  setLoading // ✅ New parameter to manage loading state
) => {
  if (!eventTitle.trim()) {
    alert("Please enter a valid title.");
    return;
  }
  if (!userId) {
    alert("Error: No user ID found. Please log in again.");
    return;
  }
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    alert("Invalid time format. Please use HH:MM.");
    return;
  }

  const eventData = {
    title: eventTitle,
    start_time: startTime,
    end_time: endTime,
    location: trackLocation ? location.address : null,
    latitude: trackLocation ? location.latitude : null,
    longitude: trackLocation ? location.longitude : null,
    track_location: trackLocation,
    date: selectedDate,
    user_id: userId,
  };

  try {
    setLoading(true); // ✅ Start loading
    let response;
    if (eventToEdit) {
      response = await supabase
        .from("events")
        .update(eventData)
        .eq("id", eventToEdit.id);
    } else {
      response = await supabase.from("events").insert([eventData]);
    }

    if (response.error) throw response.error;

    console.log("✅ Event saved successfully:", response.data);
    await fetchEvents();
    resetForm();
    onClose();
  } catch (err) {
    console.error("❌ Error saving event:", err);
  } finally {
    setLoading(false); // ✅ Stop loading after request completes
  }
};

// ✅ Delete Event
export const handleDeleteEvent = async (eventId) => {
  Alert.alert("Delete Event?", "Are you sure you want to delete this event?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Yes, Delete",
      onPress: async () => {
        try {
          const { error } = await supabase
            .from("events")
            .delete()
            .eq("id", eventId);
          if (error) throw error;

          console.log("✅ Event deleted:", eventId);
          await fetchEvents();
        } catch (error) {
          console.error("❌ Error deleting event:", error.message);
        }
      },
    },
  ]);
};

// ✅ Open Modal for Editing
export const handleEditEvent = (event, setEventToEdit, setModalVisible) => {
  console.log("🟢 Editing event:", event);
  setEventToEdit(event);
  setModalVisible(true); // ✅ Open modal
};

// ✅ Open Modal for Adding New Event
export const handleAddEvent = (setEventToEdit, setModalVisible) => {
  setEventToEdit(null); // ✅ Ensure form is blank
  setModalVisible(true);
};

// ✅ Close Modal and Reset Form
export const handleCloseModal = (setModalVisible, resetForm) => {
  setModalVisible(false);
  resetForm(); // ✅ Clear form
};

// ✅ Reset Event Form
export const resetEventForm = (
  setEventTitle,
  setStartTime,
  setEndTime,
  setTrackLocation,
  setLocation
) => {
  setEventTitle("");
  setStartTime("");
  setEndTime("");
  setTrackLocation(false);
  setLocation({ address: "", latitude: null, longitude: null });
};

// ✅ Format time to "HH:MM"
export const formatTimeToHHMM = (timeString) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes}`;
};

// ✅ Validate Time Format (HH:MM)
export const isValidTimeFormat = (time) => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
};

// ✅ Format Time Input to HH:MM as user types
export const formatTimeInput = (value) => {
  const cleanedValue = value.replace(/\D/g, ""); // Remove non-numeric characters
  let formatted = "";

  if (cleanedValue.length > 0) {
    formatted += cleanedValue.slice(0, 2);
  }
  if (cleanedValue.length > 2) {
    formatted += ":" + cleanedValue.slice(2, 4);
  }

  return formatted.slice(0, 5); // Restrict input length to 5 characters
};

// Format time input
export const handleTimeChange = (value, setTime) => {
  if (setTime) {
    setTime(formatTimeInput(value));
  } else {
    console.error("❌ Error: setTime function is undefined!");
  }
};
