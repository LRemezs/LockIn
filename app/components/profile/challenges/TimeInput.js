import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { formatTimeInput } from "../../../../utils/helperUtils";
import { theme } from "../../../styles/theme";

export default function TimeInput({ value, onChange, placeholder }) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={value}
        placeholder={placeholder || "HH:MM"}
        placeholderTextColor={theme.colors.textSecondary}
        onChangeText={(text) => onChange(formatTimeInput(text))}
        maxLength={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.small,
    width: 100,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.background,
    color: theme.colors.textPrimary,
    paddingVertical: theme.spacing.xsmall,
    paddingHorizontal: theme.spacing.small,
    textAlign: "center",
    fontSize: 13,
    height: 35,
  },
});
