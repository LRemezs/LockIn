import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"; // Placeholder icon

export default function BrowseChallenges({ onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Ionicons name="search" size={30} color="#fff" />
      <Text style={styles.text} numberOfLines={2}>
        Browse
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 65, // ✅ Matches ChallengeButton size
    height: 65,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50", // ✅ Green to stand out
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#388E3C",
    marginHorizontal: 3,
    padding: 4,
  },
  text: {
    fontSize: 10, // ✅ Adjusted for readability
    color: "#fff",
    marginTop: 3,
    textAlign: "center",
  },
});
