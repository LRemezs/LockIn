import { useSelector } from "@legendapp/state/react";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { handleDeleteEvent } from "../../../utils/eventHandlers";
import { formatTimeToHHMM } from "../../../utils/helperUtils";
import {
  displayedEvents$,
  updateEventStatus,
} from "../../../utils/notificationUtils";

export default function ScheduleSection({ selectedDate, onEdit }) {
  const allEvents = useSelector(displayedEvents$) || [];

  if (!Array.isArray(allEvents)) {
    console.error("❌ displayedEvents$ is not an array, received:", allEvents);
    return null;
  }

  // ✅ Use displayedEvents$ directly, filtering by selected date
  const eventsForSelectedDate = allEvents.filter(
    (event) => event.date === selectedDate
  );

  // ✅ Handle marking an event as COMPLETE
  const handleCompleteEvent = async (eventId) => {
    console.log(`✅ Marking event ID ${eventId} as COMPLETE.`);
    await updateEventStatus(eventId, "complete");
    events$.set(events$.get().filter((e) => e.event_status !== "complete"));
  };

  return (
    <View style={styles.scheduleContainer}>
      <Text style={styles.scheduleTitle}>
        {selectedDate ? `Schedule for ${selectedDate}` : "Select a date"}
      </Text>

      {eventsForSelectedDate.length > 0 ? (
        <FlatList
          data={eventsForSelectedDate}
          keyExtractor={(item) => item.id || item.title}
          renderItem={({ item }) => (
            <View style={styles.eventItem}>
              <View style={styles.eventDetails}>
                <Text style={styles.eventText}>
                  {item.title || "Untitled Event"} -{" "}
                  {formatTimeToHHMM(item.start_time)} to{" "}
                  {formatTimeToHHMM(item.end_time)} (
                  {item.location || "No location"})
                </Text>
                <Text style={[styles.statusLabel, styles[item.event_status]]}>
                  {item.event_status.toUpperCase()}
                </Text>
                {typeof item.distance === "number" && !isNaN(item.distance) ? (
                  <Text style={styles.extraInfo}>
                    📍 {item.distance.toFixed(2)} miles away
                  </Text>
                ) : (
                  <Text style={styles.extraInfo}>📍 Calculating...</Text>
                )}
                {typeof item.estimated_travel_time === "number" &&
                !isNaN(item.estimated_travel_time) ? (
                  <Text style={styles.extraInfo}>
                    🚗 {item.estimated_travel_time} min travel time
                  </Text>
                ) : (
                  <Text style={styles.extraInfo}>🚗 Calculating...</Text>
                )}
              </View>
              <View style={styles.buttons}>
                <TouchableOpacity onPress={() => onEdit({ ...item })}>
                  <Text style={styles.editButton}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteEvent(item.id)}>
                  <Text style={styles.deleteButton}>🗑️</Text>
                </TouchableOpacity>
                {item.event_status === "pending" && (
                  <TouchableOpacity
                    onPress={() => handleCompleteEvent(item.id)}
                  >
                    <Text style={styles.completeButton}>✅ COMPLETE</Text>
                  </TouchableOpacity>
                )}
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
  statusLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  today: {
    color: "#4CAF50",
  },
  upcoming: {
    color: "#2196F3",
  },
  pending: {
    color: "#FF9800",
  },
  complete: {
    color: "#8BC34A",
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    marginRight: 10,
    fontSize: 18,
    color: "#4CAF50",
  },
  deleteButton: {
    fontSize: 18,
    color: "red",
    marginRight: 10,
  },
  completeButton: {
    fontSize: 14,
    color: "#8BC34A",
    fontWeight: "bold",
  },
  schedulePlaceholder: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});
