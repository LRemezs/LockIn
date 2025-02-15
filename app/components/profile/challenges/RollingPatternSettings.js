// components/challenges/RollingPatternSettings.js
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import SegmentItem from "./SegmentItem";

export default function RollingPatternSettings({ segments, onChange }) {
  const updateSegment = (index, updatedSegment) => {
    const newSegments = segments.map((seg, i) =>
      i === index ? updatedSegment : seg
    );
    onChange(newSegments);
  };

  const removeSegment = (index) => {
    const newSegments = segments.filter((_, i) => i !== index);
    onChange(newSegments);
  };

  const addSegment = () => {
    const newSegment = {
      type: "active",
      days: 1,
      startTime: "09:00",
      endTime: "",
    };
    onChange([...segments, newSegment]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Rolling Pattern Segments</Text>
      {segments.map((segment, index) => (
        <SegmentItem
          key={index}
          segment={segment}
          onChange={(updatedSegment) => updateSegment(index, updatedSegment)}
          onRemove={() => removeSegment(index)}
        />
      ))}
      <Button title="Add Segment" onPress={addSegment} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginVertical: 10,
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
