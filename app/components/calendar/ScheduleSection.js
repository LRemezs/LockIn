import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { events$ } from "../../../state/state"; // Import Legend-State store

export default function ScheduleSection({ selectedDate }) {
  const eventsForSelectedDate = events$.get()?.[selectedDate] || [];

  return (
    <View style={styles.scheduleContainer}>
      <Text style={styles.scheduleTitle}>
        {selectedDate ? `Schedule for ${selectedDate}` : "Select a date"}
      </Text>

      {eventsForSelectedDate.length > 0 ? (
        <FlatList
          data={eventsForSelectedDate}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text style={styles.eventText}>
              {item.type} - {item.duration} hrs (
              {item.location || "No location"})
            </Text>
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
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  schedulePlaceholder: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  eventText: {
    fontSize: 16,
    marginTop: 5,
    fontWeight: "bold",
  },
});
