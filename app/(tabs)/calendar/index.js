import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { events$ } from "../../../state/state"; // Import Legend-State store
import { supabase } from "../../../state/supabaseClient"; // Fix import
import DayChart from "../../components/calendar/DayChart";
import EventForm from "../../components/calendar/EventForm";
import ScheduleSection from "../../components/calendar/ScheduleSection";

export default function CalendarScreen() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [markedDates, setMarkedDates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  // Input states for new event creation
  const [eventTitle, setEventTitle] = useState("");
  const [eventDuration, setEventDuration] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  // // 🔹 Fetch events on mount
  // useEffect(() => {
  //   fetchEvents();
  // }, []);

  // 🔹 Update marked dates when events change
  useEffect(() => {
    const updatedMarkedDates = {};
    Object.keys(events$.get()).forEach((date) => {
      updatedMarkedDates[date] = {
        marked: true,
        dotColor: "#4CAF50",
      };
    });

    setMarkedDates(updatedMarkedDates);
  }, [events$]); // 🔹 Auto-update when Legend-State changes

  // 🔹 Handle new event creation

  const handleAddEvent = async (title, duration, location) => {
    try {
      const newEvent = {
        date: selectedDate,
        title: title,
        duration: parseInt(duration, 10),
        location: location,
      };

      const { data, error } = await supabase
        .from("events")
        .insert([newEvent])
        .select("*");

      if (error) throw error;

      const addedEvent = data[0];

      events$.set((prevEvents) => {
        const updatedEvents = { ...prevEvents };
        if (!updatedEvents[selectedDate]) {
          updatedEvents[selectedDate] = [];
        }
        updatedEvents[selectedDate] = [
          ...updatedEvents[selectedDate],
          {
            id: addedEvent.id, // Ensure id is included
            type: addedEvent.title, // Ensure correct key name
            duration: addedEvent.duration,
            location: addedEvent.location,
          },
        ];
        return updatedEvents;
      });

      setModalVisible(false);
    } catch (error) {
      console.error("Error adding event:", error.message);
    }
  };

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
          const isToday =
            date.dateString === new Date().toISOString().split("T")[0];

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

      <ScheduleSection selectedDate={selectedDate} />

      {/* Add Event Button */}
      <Button title="Add Event" onPress={() => setModalVisible(true)} />

      <EventForm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={(title, duration, location) =>
          handleAddEvent(title, duration, location)
        }
        selectedDate={selectedDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 2,
    backgroundColor: "#afa", //page background
  },

  calendarContainer: {
    overflow: "hidden",
    borderRadius: 25,
    backgroundColor: "#a5a", // calendar header background
  },

  dayTouchable: {
    alignItems: "center",
    justifyContent: "center",
    padding: 1,
    backgroundColor: "transparent",
  },

  selectedDayBackground: {
    backgroundColor: "#4CAF50", // selected date background
    borderRadius: 8,
    paddingHorizontal: 5,
  },

  selectedDayText: {
    color: "#fff", // Selected date text color
    fontWeight: "bold",
  },

  todayText: {
    color: "#ff9800", // Today's date text coloe
    fontWeight: "bold",
  },

  disabledText: {
    color: "#555", // Text color from dates outside of current month
  },

  dayText: {
    fontSize: 10,
    fontWeight: "bold",
  },

  scheduleContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  schedulePlaceholder: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  eventText: {
    fontSize: 16,
    marginTop: 5,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(204, 30, 30, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
});
