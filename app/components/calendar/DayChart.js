import React from "react";
import { StyleSheet, View } from "react-native";

export default function DayChart() {
  return (
    <View style={styles.container}>
      <View style={styles.circle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "grey",
    alignSelf: "center",
    marginTop: 0,
  },
});
