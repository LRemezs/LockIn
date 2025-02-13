import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import ChallengeScroll from "../../components/dashboard/ChallengeScroll";
import CountdownTimer from "../../components/dashboard/CountdownTimer";
import DatePicker from "../../components/dashboard/DatePicker";
import MainView from "../../components/dashboard/mainView/MainView";
export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  useFocusEffect(
    React.useCallback(() => {
      setSelectedDate(new Date());
    }, [])
  );

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>
      <DatePicker value={selectedDate} onDateChange={setSelectedDate} />
      <Text style={styles.dateText}>
        Selected date: {selectedDate.toDateString()}
      </Text>

      {/* Countdown Section */}
      <CountdownTimer />

      {/* Main View (Handles Display Logic & Layout) */}
      <MainView isToday={isToday} />

      {/* Challenge Scroll */}
      <ChallengeScroll />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100, // ✅ Prevents overlap with ChallengeScroll
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  dateText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 5,
  },
});
