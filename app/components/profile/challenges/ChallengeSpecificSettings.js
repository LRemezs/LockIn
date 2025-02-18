import { Picker } from "@react-native-picker/picker";
import React from "react";
import {
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { theme } from "../../../styles/theme";

export default function ChallengeSpecificSettings({
  options,
  settings,
  onChangeSettings,
}) {
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
      } else if (option.type === "select") {
        return option.default ?? option.options?.[0] ?? "";
      }
      return "";
    }
    return current;
  };

  const renderOptionRow = (key, option) => {
    const current = getCurrent(key, option);

    if (option.type === "select") {
      return (
        <View key={key} style={styles.row}>
          <Text style={styles.label}>{option.label}:</Text>
          <Picker
            selectedValue={current}
            onValueChange={(itemValue) =>
              onChangeSettings({ ...settings, [key]: itemValue })
            }
            style={[
              styles.picker,
              Platform.OS === "android" && { color: theme.colors.textPrimary },
            ]}
            mode="dialog"
          >
            {option.options?.map((opt) => (
              <Picker.Item label={opt} value={opt} key={opt} />
            ))}
          </Picker>
        </View>
      );
    }

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
          trackColor={{
            false: theme.colors.textSecondary,
            true: theme.colors.greenButtonBackground,
          }}
          thumbColor={theme.colors.textPrimary}
        />
        {option.type === "toggleWithInput" &&
          typeof current === "object" &&
          current.enabled && (
            <TextInput
              style={styles.input}
              value={current.value?.toString() ?? ""}
              onChangeText={(text) =>
                onChangeSettings({
                  ...settings,
                  [key]: { ...current, value: text },
                })
              }
              keyboardType="numeric"
              placeholder={option.placeholder || "Enter value"}
              placeholderTextColor={theme.colors.textSecondary}
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
    marginVertical: theme.spacing.medium,
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.sectionBackground,
    borderRadius: theme.borderRadius.medium,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.small,
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.labelFontSize,
    flex: 1,
    marginRight: theme.spacing.small,
  },
  picker: {
    height: 40,
    width: 120,
    backgroundColor: theme.colors.cardBackground,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: theme.borderRadius.small,
    paddingVertical: theme.spacing.xsmall,
    paddingHorizontal: theme.spacing.small,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.background,
    width: 80,
    textAlign: "center",
  },
});
