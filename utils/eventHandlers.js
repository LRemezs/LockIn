import { Alert } from "react-native";
import { fetchAndProcessEvents } from "../state/stateObservables";
import { supabase } from "../state/supabaseClient";
import { getTravelInfo } from "../utils/notificationUtils";
/**
 * => Event CRUD operations & support functions
 *          validateEventData
 *          formatEventData
 *          handleSaveEvent
 *          handleDeleteEvent
 * => Modal controls
 *          handleEditEvent
 *          handleAddEvent
 *          handleCloseModal
 *          resetEventForm
 */

// Validate event data before saving
const validateEventData = ({
  selectedDate,
  eventTitle,
  startTime,
  endTime,
  trackLocation,
  location,
  userId,
}) => {
  console.log("🔍 Validating event data...");

  // Basic required fields
  if (
    !selectedDate ||
    !eventTitle.trim() ||
    !startTime.trim() ||
    !endTime.trim() ||
    !userId
  ) {
    Alert.alert("Error", "All fields must be filled out.");
    console.error("❌ Validation failed:", {
      selectedDate,
      eventTitle,
      startTime,
      endTime,
      userId,
    });
    return false;
  }

  // If tracking is enabled, location must be valid
  if (trackLocation) {
    if (!location?.address || !location?.latitude || !location?.longitude) {
      Alert.alert(
        "Error",
        "Location details are required when tracking is enabled."
      );
      console.error("❌ Missing location data:", location);
      return false;
    }
  }

  console.log("✅ Event data is valid!");
  return true;
};

// Format Event Data for Supabase
const formatEventData = ({
  eventTitle,
  startTime,
  endTime,
  trackLocation,
  location,
  selectedDate,
  userId,
}) => {
  return {
    title: eventTitle.trim(),
    start_time: `${startTime}:00`,
    end_time: `${endTime}:00`,
    location: trackLocation ? location.address : null,
    latitude: trackLocation ? location.latitude : null,
    longitude: trackLocation ? location.longitude : null,
    track_location: trackLocation,
    date: selectedDate,
    user_id: userId,
    event_status: "upcoming",
    notified: false,
  };
};

// Add or Update Event
export const handleSaveEvent = async ({
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
  setLoading,
}) => {
  console.log(`🛠️ ${eventToEdit ? "Updating" : "Creating"} Event...`);

  // Validate input
  if (
    !validateEventData({
      selectedDate,
      eventTitle,
      startTime,
      endTime,
      trackLocation,
      location,
      userId,
    })
  )
    return;

  // Format event data for Supabase
  const eventData = formatEventData({
    eventTitle,
    startTime,
    endTime,
    trackLocation,
    location,
    selectedDate,
    userId,
  });

  if (eventToEdit) {
    eventData.notified = false;
  }

  console.log("📌 Event Data to Save:", eventData);

  try {
    setLoading(true);
    let response, eventId;

    // Save or update event
    if (eventToEdit) {
      console.log(`✏️ Updating Event: ${eventToEdit.id}`);
      response = await supabase
        .from("events")
        .update(eventData)
        .eq("id", eventToEdit.id)
        .select("id")
        .single();
      eventId = response.data?.id || eventToEdit.id;
    } else {
      console.log("➕ Inserting New Event");
      response = await supabase
        .from("events")
        .insert([eventData])
        .select("id")
        .maybeSingle();
      eventId = response.data?.id;
    }

    if (!eventId) {
      throw new Error("❌ Event ID missing after save operation.");
    }

    console.log(
      `✅ Event ${eventToEdit ? "updated" : "created"} successfully!`
    );

    // Fetch travel info using calendarUtils.js
    const travelData = await getTravelInfo({ ...eventData, id: eventId });
    if (travelData) {
      console.log("🚗 Updating event with travel info:", travelData);

      const { distance, estimated_travel_time } = travelData;

      // 🛠️ Update the event with distance and travel time
      const { error: travelError } = await supabase
        .from("events")
        .update({
          distance: distance.toFixed(2),
          estimated_travel_time,
        })
        .eq("id", eventId);

      if (travelError) {
        console.error(`❌ Failed to update travel info:`, travelError);
      } else {
        console.log(`✅ Travel info added for event ID ${eventId}`);
      }
    } else {
      console.warn("⚠️ Travel info unavailable for this event.");
    }

    // Refresh events to update the UI
    await fetchAndProcessEvents();

    resetForm();
    onClose();
  } catch (error) {
    console.error("❌ Error saving event:", error.message);
    Alert.alert("Error", "Failed to save event. Please try again.");
  } finally {
    setLoading(false);
  }
};

// Delete Event
export const handleDeleteEvent = async (eventId) => {
  console.log(`🗑️ Attempting to delete event: ${eventId}`);
  try {
    const { data: eventExists, error: fetchError } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .single();

    if (fetchError || !eventExists) {
      console.warn("⚠️ Event already deleted or not found.");
      return;
    }

    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) throw error;

    console.log(`✅ Event deleted: ${eventId}`);
    await fetchAndProcessEvents();
  } catch (error) {
    console.error("❌ Error deleting event:", error.message);
    Alert.alert("Error", "Failed to delete event.");
  }
};

// Open Modal for Editing an Event
export const handleEditEvent = (event, setEventToEdit, setModalVisible) => {
  setEventToEdit(event);
  setModalVisible(true);
};

// Open Modal for Adding a New Event
export const handleAddEvent = (setEventToEdit, setModalVisible) => {
  setEventToEdit(null);
  setModalVisible(true);
};

// Close Modal and Reset Form
export const handleCloseModal = (setModalVisible, resetForm) => {
  setModalVisible(false);
  resetForm();
};

// Reset Event Form
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
