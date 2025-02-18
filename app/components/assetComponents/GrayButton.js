import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { theme } from "../../styles/theme";

export default function GrayButton({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.grayButtonBackground,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: theme.colors.grayButtonText,
    fontSize: 16,
    fontWeight: "600",
  },
});
