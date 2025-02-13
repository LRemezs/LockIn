import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function TodayView() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Today's Overview</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222", // Dark background for contrast
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4, // Subtle shadow
    borderWidth: 2,
    borderColor: "#333",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00e676", // Bright green for urgency
  },
});
