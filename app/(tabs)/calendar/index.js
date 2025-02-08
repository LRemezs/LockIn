import { useSelector } from "@legendapp/state/react";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { events$, loading$, user$ } from "../../../state/state"; // ✅ Use global loading state
import DayChart from "../../components/calendar/DayChart";
import EventForm from "../../components/calendar/EventForm";
import ScheduleSection from "../../components/calendar/ScheduleSection";
import {
  handleAddEvent,
  handleCloseModal,
  handleDeleteEvent,
  handleEditEvent,
} from "../../utils/eventHandlers";

export default function CalendarScreen() {
  const user = useSelector(user$);
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const isLoading = useSelector(loading$); // ✅ Use global loading state

  // ✅ Memoized Marked Dates
  const markedDates = useMemo(() => {
    if (isLoading) return {}; // ✅ Avoid rendering empty calendar before data loads
    const updatedMarkedDates = {};
    events$.get().forEach((event) => {
      updatedMarkedDates[event.date] = {
        marked: true,
        dotColor: "#4CAF50",
      };
    });
    return updatedMarkedDates;
  }, [events$, isLoading]);

  const selectedEvents = useMemo(() => {
    if (isLoading) return [];
    return events$.get().filter((event) => event.date === selectedDate);
  }, [events$, selectedDate, isLoading]);

  // ✅ Show loader while waiting for data
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading your schedule...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Calendar View */}
      <Calendar
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        firstDay={1}
        style={styles.calendarContainer}
        theme={{
          calendarBackground: "#222",
          textSectionTitleColor: "#fff",
          dayTextColor: "#fff",
          todayTextColor: "#ff9800",
          selectedDayBackgroundColor: "#4CAF50",
          selectedDayTextColor: "#fff",
          textDisabledColor: "#555",
          dotColor: "#4CAF50",
          selectedDotColor: "#fff",
        }}
        dayComponent={({ date, state }) => {
          const isSelected = selectedDate === date.dateString;
          const isToday = date.dateString === today;

          return (
            <View>
              <TouchableOpacity
                onPress={() => setSelectedDate(date.dateString)}
                style={[
                  styles.dayTouchable,
                  isSelected && styles.selectedDayBackground,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    state === "disabled" && styles.disabledText,
                    isToday && styles.todayText,
                    isSelected && styles.selectedDayText,
                  ]}
                >
                  {date.day}
                </Text>
                <DayChart />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <ScheduleSection
        selectedDate={selectedDate}
        onEdit={(event) =>
          handleEditEvent(event, setEventToEdit, setModalVisible)
        }
        onDelete={handleDeleteEvent}
      />

      <Button
        title="Add Event"
        onPress={() => handleAddEvent(setEventToEdit, setModalVisible)}
      />

      <EventForm
        visible={modalVisible}
        onClose={() =>
          handleCloseModal(setModalVisible, () => setEventToEdit(null))
        }
        selectedDate={selectedDate}
        eventToEdit={eventToEdit}
        userId={user.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 2, backgroundColor: "#afa" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" }, // ✅ Loader style
  calendarContainer: {
    overflow: "hidden",
    borderRadius: 25,
    backgroundColor: "#a5a",
  },
  dayTouchable: {
    alignItems: "center",
    justifyContent: "center",
    padding: 1,
    backgroundColor: "transparent",
  },
  selectedDayBackground: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingHorizontal: 5,
  },
  selectedDayText: { color: "#fff", fontWeight: "bold" },
  todayText: { color: "#ff9800", fontWeight: "bold" },
  disabledText: { color: "#555" },
  dayText: { fontSize: 10, fontWeight: "bold" },
});
