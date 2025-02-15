// components/challenges/FixedPatternSettings.js
import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import TimeInput from "./TimeInput";

export default function FixedPatternSettings({ fixedDays, onChangeFixedDays }) {
  // Week starts with Monday
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleToggle = (day, value) => {
    onChangeFixedDays({
      ...fixedDays,
      [day]: {
        ...(fixedDays[day] || { startTime: "", endTime: "" }),
        active: value,
      },
    });
  };

  const handleStartTimeChange = (day, time) => {
    onChangeFixedDays({
      ...fixedDays,
      [day]: {
        ...(fixedDays[day] || { active: false, endTime: "" }),
        startTime: time,
      },
    });
  };

  const handleEndTimeChange = (day, time) => {
    onChangeFixedDays({
      ...fixedDays,
      [day]: {
        ...(fixedDays[day] || { active: false, startTime: "" }),
        endTime: time,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Fixed Pattern Settings</Text>
      {days.map((day) => {
        const daySettings = fixedDays[day] || {
          active: false,
          startTime: "",
          endTime: "",
        };
        return (
          <View key={day} style={styles.dayRow}>
            <Text style={styles.dayLabel}>{day}</Text>
            <Switch
              value={daySettings.active}
              onValueChange={(value) => handleToggle(day, value)}
            />
            {daySettings.active && (
              <View style={styles.timeInputs}>
                <TimeInput
                  value={daySettings.startTime}
                  onChange={(time) => handleStartTimeChange(day, time)}
                  placeholder="Start"
                />
                <TimeInput
                  value={daySettings.endTime}
                  onChange={(time) => handleEndTimeChange(day, time)}
                  placeholder="End (opt.)"
                />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  dayLabel: {
    width: 40,
    fontSize: 14,
  },
  timeInputs: {
    flexDirection: "row",
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
});
