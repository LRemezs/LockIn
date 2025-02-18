import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../../styles/theme";
import GreenButton from "../../assetComponents/GreenButton";
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
      <Text style={styles.header}>Set up a repeating rolling pattern:</Text>
      {segments.map((segment, index) => (
        <SegmentItem
          key={index}
          segment={segment}
          onChange={(updatedSegment) => updateSegment(index, updatedSegment)}
          onRemove={() => removeSegment(index)}
        />
      ))}
      <GreenButton title="Add Segment" onPress={addSegment} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.sectionBackground,
    borderRadius: theme.borderRadius.medium,
    marginVertical: theme.spacing.medium,
  },
  header: {
    fontSize: theme.typography.bodyFontSize,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.headerFontWeight,
    marginBottom: theme.spacing.medium,
  },
});
