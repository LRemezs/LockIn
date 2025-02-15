// components/challenges/TimeInput.js
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { formatTimeInput } from "../../../../utils/helperUtils";

export default function TimeInput({ value, onChange, placeholder }) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={value}
        placeholder={placeholder || "HH:MM"}
        onChangeText={(text) => onChange(formatTimeInput(text))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 4,
  },
});
