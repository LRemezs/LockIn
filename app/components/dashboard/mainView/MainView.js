import React from "react";
import { StyleSheet, View } from "react-native";
import OtherDateView from "./OtherDateView";
import TodayView from "./TodayView";

export default function MainView({ isToday }) {
  return (
    <View style={styles.container}>
      {isToday ? <TodayView /> : <OtherDateView />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // ✅ Fills remaining space
    width: "95%", // ✅ Matches ChallengeScroll
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5, // ✅ Small gap for aesthetics
  },
});
