import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { theme } from "../../styles/theme";

export default function DismissButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>✖️</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.textSecondary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: theme.colors.textSecondary,
  },
  text: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    lineHeight: 18, // Helps center the X vertically
    textShadowColor: theme.colors.shadowColor,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
