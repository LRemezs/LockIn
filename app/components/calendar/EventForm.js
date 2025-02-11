import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { handleSaveEvent, resetEventForm } from "../../../utils/eventHandlers";
import { formatTimeToHHMM, handleTimeChange } from "../../../utils/helperUtils";
import LocationSearch from "./LocationSearch";

export default function EventForm({
  visible,
  onClose,
  selectedDate,
  eventToEdit,
  userId,
}) {
  const [eventTitle, setEventTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [trackLocation, setTrackLocation] = useState(false);
  const [location, setLocation] = useState({
    address: "",
    latitude: null,
    longitude: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setEventTitle(eventToEdit.title || "");
      setStartTime(formatTimeToHHMM(eventToEdit.start_time || ""));
      setEndTime(formatTimeToHHMM(eventToEdit.end_time || ""));
      setTrackLocation(eventToEdit.track_location || false);
      setLocation({
        address: eventToEdit.location || "",
        latitude: eventToEdit.latitude ?? null,
        longitude: eventToEdit.longitude ?? null,
      });
    } else {
      resetEventForm(
        setEventTitle,
        setStartTime,
        setEndTime,
        setTrackLocation,
        setLocation
      );
    }
  }, [eventToEdit]);

  const validateAndSave = () => {
    if (!eventTitle.trim()) {
      Alert.alert("Error", "Event title cannot be empty.");
      return;
    }
    if (!startTime.trim() || !endTime.trim()) {
      Alert.alert("Error", "Start time and end time must be filled.");
      return;
    }

    handleSaveEvent(
      eventToEdit,
      selectedDate,
      eventTitle,
      startTime,
      endTime,
      trackLocation,
      location,
      userId,
      onClose,
      () =>
        resetEventForm(
          setEventTitle,
          setStartTime,
          setEndTime,
          setTrackLocation,
          setLocation
        ),
      setIsLoading
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.inputContainer}>
            <Text style={styles.modalTitle}>
              {eventToEdit ? "Edit Event" : "Create Event"} for {selectedDate}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Event Title"
              value={eventTitle}
              onChangeText={setEventTitle}
              editable={!isLoading}
            />

            <TextInput
              style={styles.input}
              placeholder="Start Time (HH:MM)"
              value={startTime}
              keyboardType="numeric"
              onChangeText={(text) => handleTimeChange(text, setStartTime)}
              editable={!isLoading}
            />

            <TextInput
              style={styles.input}
              placeholder="End Time (HH:MM)"
              value={endTime}
              keyboardType="numeric"
              onChangeText={(text) => handleTimeChange(text, setEndTime)}
              editable={!isLoading}
            />

            <View style={styles.switchContainer}>
              <Text>Enable travel tracking</Text>
              <Switch
                value={trackLocation}
                onValueChange={setTrackLocation}
                disabled={isLoading}
              />
            </View>

            {trackLocation && (
              <View style={styles.locationContainer}>
                <LocationSearch
                  onLocationSelect={setLocation}
                  defaultValue={location.address || ""}
                />
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
              <>
                <Button
                  title={eventToEdit ? "Update Event" : "Save Event"}
                  onPress={validateAndSave}
                  disabled={isLoading}
                />
                <Button title="Close" onPress={onClose} disabled={isLoading} />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignSelf: "center",
    maxHeight: "85%",
    minHeight: 300,
    justifyContent: "flex-start",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "white",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  locationContainer: {
    width: "100%",
    marginBottom: 10,
    minHeight: 50,
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});
