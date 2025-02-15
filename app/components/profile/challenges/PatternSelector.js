// components/challenges/PatternSelector.js
import React from "react";
import { Button, StyleSheet, View } from "react-native";

export default function PatternSelector({ patternType, setPatternType }) {
  return (
    <View style={styles.container}>
      <Button
        title="Fixed Pattern"
        onPress={() => setPatternType("fixed")}
        color={patternType === "fixed" ? "green" : "gray"}
      />
      <Button
        title="Rolling Pattern"
        onPress={() => setPatternType("rolling")}
        color={patternType === "rolling" ? "green" : "gray"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
});
