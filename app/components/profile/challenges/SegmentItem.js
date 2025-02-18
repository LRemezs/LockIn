import React from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { theme } from "../../../styles/theme";
import DismissButton from "../../assetComponents/DismissButton";
import TimeInput from "./TimeInput";

export default function SegmentItem({ segment, onChange, onRemove }) {
  const toggleType = () => {
    onChange({
      ...segment,
      type: segment.type === "active" ? "rest" : "active",
    });
  };

  const handleInputChange = (field, value) => {
    onChange({
      ...segment,
      [field]: value,
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Row: Toggle, Type Text, and Delete Icon */}
      <View style={styles.topRow}>
        <View style={styles.switchContainer}>
          <Switch
            value={segment.type === "active"}
            onValueChange={toggleType}
            trackColor={{
              false: theme.colors.textSecondary,
              true: theme.colors.greenButtonBackground,
            }}
            thumbColor={theme.colors.textPrimary}
          />
          <Text style={styles.typeText}>
            {segment.type === "active" ? "Active" : "Rest"}
          </Text>
        </View>

        <DismissButton onPress={onRemove} />
      </View>

      {/* Middle Row: Days Input */}
      <View style={styles.middleRow}>
        <Text style={styles.label}>For</Text>
        <TextInput
          style={styles.daysInput}
          value={segment.days.toString()}
          onChangeText={(value) =>
            handleInputChange("days", parseInt(value, 10) || 0)
          }
          placeholder="#"
          keyboardType="numeric"
          maxLength={2}
        />
        <Text style={styles.label}>days</Text>
      </View>

      {/* Bottom Row: Time Inputs (Active Only) */}
      {segment.type === "active" && (
        <View style={styles.bottomRow}>
          <TimeInput
            value={segment.startTime}
            onChange={(value) => handleInputChange("startTime", value)}
            placeholder="Start (optional)"
          />
          <TimeInput
            value={segment.endTime}
            onChange={(value) => handleInputChange("endTime", value)}
            placeholder="End (optional)"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.small,
    marginVertical: theme.spacing.xsmall,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.small,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.small,
  },
  typeText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.labelFontSize,
    fontWeight: "bold",
  },
  trashIcon: {
    fontSize: 24,
    color: theme.colors.accent,
    padding: theme.spacing.small,
  },
  middleRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: theme.spacing.xsmall,
    gap: theme.spacing.small,
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.labelFontSize,
  },
  daysInput: {
    backgroundColor: theme.colors.background,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: theme.borderRadius.small,
    width: 50,
    textAlign: "center",
    paddingVertical: theme.spacing.xsmall,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: theme.spacing.small,
    gap: theme.spacing.small,
  },
});
