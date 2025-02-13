import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"; // Placeholder icons

const challengeIcons = {
  sleep: "moon",
  basic_todo: "clipboard",
  custom_1: "barbell",
  custom_2: "body",
  custom_3: "book",
  custom_4: "water",
  custom_5: "document-text",
  custom_6: "body",
  custom_7: "heart",
  custom_8: "fast-food",
  custom_9: "phone-portrait",
};

export default function ChallengeButton({ id, name, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Ionicons
        name={challengeIcons[id] || "help-circle"}
        size={30}
        color="#555"
      />
      <Text style={styles.text} numberOfLines={2}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 65, // ✅ Reduced size
    height: 65,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 3,
    padding: 4,
  },
  text: {
    fontSize: 10, // ✅ Adjusted for readability
    color: "#333",
    marginTop: 3,
    textAlign: "center",
  },
});
