import { Alert } from "react-native";
import { fetchAndProcessEvents } from "../state/stateObservables";
import { supabase } from "../state/supabaseClient";

/**
 * => Event CRUD operations & state management
 *          handleSaveEvent
 *          handleDeleteEvent
 * => Modal controls
 *          handleEditEvent
 *          handleAddEvent
 *          handleCloseModal
 *          resetEventForm
 */

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

  if (!selectedDate || !eventTitle || !startTime || !endTime || !userId) {
    Alert.alert("Error", "All fields must be filled out.");
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
    setLoading(true);
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

    console.log(
      `✅ Event ${eventToEdit ? "updated" : "created"} successfully!`
    );
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

          console.log(`✅ Event deleted: ${eventId}`);
          await fetchAndProcessEvents();
        } catch (error) {
          console.error("❌ Error deleting event:", error.message);
          Alert.alert("Error", "Failed to delete event.");
        }
      },
    },
  ]);
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
