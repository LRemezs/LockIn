import { useSelector } from "@legendapp/state/react";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { events$ } from "../../../state/state";
import { formatTimeToHHMM, handleDeleteEvent } from "../../utils/eventHandlers";

export default function ScheduleSection({ selectedDate, onEdit }) {
  const allEvents = useSelector(events$) || [];

  if (!Array.isArray(allEvents)) {
    console.error("❌ events$ is not an array, received:", allEvents);
    return null;
  }

  // ✅ Filter & sort events by date and start time
  const eventsForSelectedDate = allEvents
    .filter((event) => event.date === selectedDate)
    .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));

  return (
    <View style={styles.scheduleContainer}>
      <Text style={styles.scheduleTitle}>
        {selectedDate ? `Schedule for ${selectedDate}` : "Select a date"}
      </Text>

      {eventsForSelectedDate.length > 0 ? (
        <FlatList
          data={eventsForSelectedDate}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={({ item }) => (
            <View style={styles.eventItem}>
              <View style={styles.eventDetails}>
                <Text style={styles.eventText}>
                  {item.title || "Untitled Event"} -{" "}
                  {formatTimeToHHMM(item.start_time)} to{" "}
                  {formatTimeToHHMM(item.end_time)} (
                  {item.location || "No location"})
                </Text>
                {item.distance !== undefined && (
                  <Text style={styles.extraInfo}>
                    📍 {item.distance.toFixed(2)} miles away
                  </Text>
                )}
                {item.travelTime && (
                  <Text style={styles.extraInfo}>🚗 {item.travelTime}</Text>
                )}
              </View>
              <View style={styles.buttons}>
                <TouchableOpacity onPress={() => onEdit({ ...item })}>
                  {/* ✅ Ensure `eventToEdit` is passed correctly */}
                  <Text style={styles.editButton}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteEvent(item.id)}>
                  <Text style={styles.deleteButton}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <Text style={styles.schedulePlaceholder}>No events scheduled</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scheduleContainer: {
    flex: 1,
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  eventItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  eventDetails: {
    flex: 1,
  },
  eventText: {
    fontSize: 16,
  },
  extraInfo: {
    fontSize: 14,
    color: "#666",
  },
  buttons: {
    flexDirection: "row",
  },
  editButton: {
    marginRight: 10,
    fontSize: 18,
    color: "#4CAF50",
  },
  deleteButton: {
    fontSize: 18,
    color: "red",
  },
  schedulePlaceholder: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});
