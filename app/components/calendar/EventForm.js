import React, { useState } from "react";
import { Button, Modal, StyleSheet, Text, TextInput, View } from "react-native";

export default function EventForm({ visible, onClose, onSave, selectedDate }) {
  const [eventTitle, setEventTitle] = useState("");
  const [eventDuration, setEventDuration] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  const handleSave = () => {
    if (!eventTitle.trim() || !eventDuration.trim()) {
      alert("Please enter an event title and duration.");
      return;
    }
    onSave(eventTitle, eventDuration, eventLocation);
    setEventTitle("");
    setEventDuration("");
    setEventLocation("");
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create Event for {selectedDate}</Text>
          <TextInput
            style={styles.input}
            placeholder="Event Title"
            value={eventTitle}
            onChangeText={setEventTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Duration (hours)"
            keyboardType="numeric"
            value={eventDuration}
            onChangeText={setEventDuration}
          />
          <TextInput
            style={styles.input}
            placeholder="Location (optional)"
            value={eventLocation}
            onChangeText={setEventLocation}
          />
          <Button title="Save Event" onPress={handleSave} />
          <Button title="Close" onPress={onClose} />
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
    backgroundColor: "rgba(204, 30, 30, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
});
