import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CountdownTimer() {
  const [toggleLabel, setToggleLabel] = useState("Toggle1");
  const [baseTime, setBaseTime] = useState(Date.now()); // Stores the starting time
  const [targetDuration, setTargetDuration] = useState(2 * 60 * 60 * 1000); // Default 2h
  const [timeLeft, setTimeLeft] = useState(
    calculateTimeLeft(baseTime, targetDuration)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(baseTime, targetDuration));
    }, 1000);

    return () => clearInterval(timer);
  }, [baseTime, targetDuration]);

  function calculateTimeLeft(startTime, duration) {
    const now = Date.now();
    const elapsed = now - startTime;
    const remaining = Math.max(duration - elapsed, 0);

    const hours = String(Math.floor(remaining / (1000 * 60 * 60))).padStart(
      2,
      "0"
    );
    const minutes = String(Math.floor((remaining / (1000 * 60)) % 60)).padStart(
      2,
      "0"
    );
    const seconds = String(Math.floor((remaining / 1000) % 60)).padStart(
      2,
      "0"
    );

    return `${hours}:${minutes}:${seconds}`;
  }

  const handleToggle = () => {
    const newDuration =
      toggleLabel === "Toggle1" ? 3 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000;
    setToggleLabel((prev) => (prev === "Toggle1" ? "Toggle2" : "Toggle1"));
    setTargetDuration(newDuration);
    setBaseTime(Date.now() - (targetDuration - newDuration)); // ✅ Instantly adjust countdown
    setTimeLeft(calculateTimeLeft(Date.now(), newDuration)); // ✅ Update state immediately
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{timeLeft} till</Text>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          {
            backgroundColor: toggleLabel === "Toggle1" ? "#d9534f" : "#0275d8",
          },
        ]}
        onPress={handleToggle}
      >
        <Text style={styles.toggleText}>{toggleLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // ✅ Align countdown & button in one row
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#222", // ✅ Dark background for urgency
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4, // ✅ Adds depth
  },
  timerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff", // ✅ High contrast for readability
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  toggleText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
