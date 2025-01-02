import { useFocusEffect } from "@react-navigation/native"; // Import the hook
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import DatePicker from "../../components/dashboard/DatePicker";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date()); // State to manage the selected date

  useFocusEffect(
    React.useCallback(() => {
      // Reset the date to today whenever the screen is focused
      setSelectedDate(new Date());
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>
      <DatePicker value={selectedDate} onDateChange={setSelectedDate} />
      <Text style={{ marginTop: 20 }}>
        Selected Date: {selectedDate.toDateString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
