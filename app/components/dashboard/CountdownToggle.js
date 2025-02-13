import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function CountdownToggle({ onToggle, label }) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: label === "Toggle1" ? "#007AFF" : "#FF5722" },
      ]}
      onPress={onToggle}
    >
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
