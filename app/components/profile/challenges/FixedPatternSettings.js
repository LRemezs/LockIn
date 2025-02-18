import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../../styles/theme";
import TimeInput from "./TimeInput";

export default function FixedPatternSettings({ fixedDays, onChangeFixedDays }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleDay = (day) => {
    const current = fixedDays[day] || {
      active: false,
      startTime: "",
      endTime: "",
    };
    onChangeFixedDays({
      ...fixedDays,
      [day]: { ...current, active: !current.active },
    });
  };

  const handleTimeChange = (day, type, value) => {
    const current = fixedDays[day] || { active: true };
    onChangeFixedDays({
      ...fixedDays,
      [day]: { ...current, [type]: value },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select Days</Text>

      {/* Day Selector */}
      <View style={styles.daySelector}>
        {days.map((day) => {
          const isActive = fixedDays[day]?.active;
          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayButton, isActive && styles.activeDay]}
              onPress={() => toggleDay(day)}
            >
              <Text style={styles.dayText}>{day}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Time Inputs for Selected Days */}
      <View style={styles.timeInputs}>
        {days.map((day) => {
          const daySettings = fixedDays[day] || {};
          if (daySettings.active) {
            return (
              <View key={day} style={styles.timeInputRow}>
                <Text style={styles.dayLabel}>{day}</Text>
                <TimeInput
                  value={daySettings.startTime}
                  onChange={(value) =>
                    handleTimeChange(day, "startTime", value)
                  }
                  placeholder="Start (optional)"
                />
                <TimeInput
                  value={daySettings.endTime}
                  onChange={(value) => handleTimeChange(day, "endTime", value)}
                  placeholder="End (optional)"
                />
              </View>
            );
          }
          return null;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.medium,
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.sectionBackground,
    borderRadius: theme.borderRadius.medium,
  },
  header: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyFontSize,
    fontWeight: theme.typography.headerFontWeight,
    marginBottom: theme.spacing.medium,
    textAlign: "center",
  },
  daySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: theme.spacing.small,
  },
  dayButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    alignItems: "center",
    backgroundColor: theme.colors.cardBackground,
  },
  activeDay: {
    backgroundColor: theme.colors.greenButtonBackground,
  },
  dayText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.labelFontSize,
  },
  timeInputs: {
    gap: theme.spacing.xsmall,
  },
  timeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xsmall,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.xsmall,
    paddingVertical: theme.spacing.xsmall,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dayLabel: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.labelFontSize,
    marginRight: theme.spacing.xsmall,
    width: 40,
    textAlign: "center",
  },
});
