// components/challenges/ChallengeSpecificSettings.js
import React from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";

export default function ChallengeSpecificSettings({
  options,
  settings,
  onChangeSettings,
}) {
  // Helper: get current value for the given option key.
  const getCurrent = (key, option) => {
    const current = settings[key];
    if (current === undefined || current === null) {
      if (option.type === "toggleWithInput") {
        return {
          enabled: option.defaultToggle ?? true,
          value: option.defaultInput ?? "",
        };
      } else if (option.type === "toggle") {
        return option.defaultToggle ?? true;
      } else {
        return "";
      }
    }
    return current;
  };

  const renderOptionRow = (key, option) => {
    const current = getCurrent(key, option);
    return (
      <View key={key} style={styles.row}>
        <Text style={styles.label}>{option.label}:</Text>
        <Switch
          value={typeof current === "object" ? current.enabled : current}
          onValueChange={(value) => {
            if (option.type === "toggleWithInput") {
              onChangeSettings({
                ...settings,
                [key]: { ...current, enabled: value },
              });
            } else {
              onChangeSettings({ ...settings, [key]: value });
            }
          }}
        />
        {option.type === "toggleWithInput" &&
          typeof current === "object" &&
          current.enabled && (
            <TextInput
              style={styles.input}
              value={
                current.value !== undefined ? current.value.toString() : ""
              }
              onChangeText={(text) =>
                onChangeSettings({
                  ...settings,
                  [key]: { ...current, value: text },
                })
              }
              keyboardType="numeric"
              placeholder={option.placeholder || ""}
            />
          )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {Object.entries(options).map(([key, option]) =>
        renderOptionRow(key, option)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#f8f8ff",
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  label: {
    flex: 1,
    fontWeight: "600",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
    borderRadius: 4,
    marginLeft: 10,
  },
});
