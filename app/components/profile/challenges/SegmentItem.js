// components/challenges/SegmentItem.js
import React from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { formatTimeInput } from "../../../../utils/helperUtils";

export default function SegmentItem({ segment, onChange, onRemove }) {
  // segment: { type, days, startTime, endTime }
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Segment</Text>
      <View style={styles.row}>
        <Text>Type:</Text>
        <Button
          title={segment.type === "active" ? "Active" : "Rest"}
          onPress={() =>
            onChange({
              ...segment,
              type: segment.type === "active" ? "rest" : "active",
            })
          }
        />
      </View>
      <View style={styles.row}>
        <Text>Days:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={segment.days.toString()}
          onChangeText={(text) => {
            const days = parseInt(text, 10) || 0;
            onChange({ ...segment, days });
          }}
        />
      </View>
      {segment.type === "active" && (
        <>
          <View style={styles.row}>
            <Text>Start Time:</Text>
            <TextInput
              style={styles.input}
              value={segment.startTime}
              onChangeText={(text) =>
                onChange({ ...segment, startTime: formatTimeInput(text) })
              }
              placeholder="HH:MM"
            />
          </View>
          <View style={styles.row}>
            <Text>End Time:</Text>
            <TextInput
              style={styles.input}
              value={segment.endTime}
              onChangeText={(text) =>
                onChange({ ...segment, endTime: formatTimeInput(text) })
              }
              placeholder="Optional"
            />
          </View>
        </>
      )}
      <Button title="Remove Segment" onPress={onRemove} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    elevation: 1,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
    flex: 1,
    marginLeft: 5,
  },
});
