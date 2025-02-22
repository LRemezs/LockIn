import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../../styles/theme";

export default function SQForm({ initialData = {}, onSubmit, mode = "save" }) {
  // Set up local state with initial values if provided.
  const [title, setTitle] = useState(initialData.title || "");
  const [hasDuration, setHasDuration] = useState(
    initialData.has_duration || false
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialData.duration_minutes ? String(initialData.duration_minutes) : ""
  );
  const [hasLocation, setHasLocation] = useState(
    initialData.has_location || false
  );
  const [location, setLocation] = useState(initialData.location || "");

  // Date mode: either "deadline" or "due"
  const [dateMode, setDateMode] = useState(
    initialData.deadline ? "deadline" : "due"
  );
  const [deadlineDate, setDeadlineDate] = useState(
    initialData.deadline
      ? new Date(initialData.deadline).toISOString().split("T")[0]
      : ""
  );
  const [deadlineTime, setDeadlineTime] = useState(
    initialData.deadline
      ? new Date(initialData.deadline).toTimeString().slice(0, 5)
      : ""
  );
  const [dueDate, setDueDate] = useState(initialData.due_date || "");

  const handleSubmit = async () => {
    if (title.trim().length < 10) {
      Alert.alert(
        "Validation Error",
        "Please enter a detailed title (at least 10 characters)."
      );
      return;
    }

    let deadline = null;
    let due = null;
    if (dateMode === "deadline") {
      if (!deadlineDate || !deadlineTime) {
        Alert.alert(
          "Validation Error",
          "Please enter both a deadline date and time."
        );
        return;
      }
      deadline = new Date(`${deadlineDate}T${deadlineTime}`);
    } else {
      if (!dueDate) {
        Alert.alert("Validation Error", "Please enter a due date.");
        return;
      }
      due = dueDate;
    }

    const formData = {
      title,
      has_duration: hasDuration,
      duration_minutes: hasDuration ? parseInt(durationMinutes, 10) || 0 : null,
      has_location: hasLocation,
      location: hasLocation ? location : null,
      deadline: deadline,
      due_date: deadline ? null : due || null,
      status: "upcoming",
    };

    try {
      await onSubmit(formData);
      Alert.alert("Success", "Quest added successfully.");
      if (mode === "save") {
        setTitle("");
        setHasDuration(false);
        setDurationMinutes("");
        setHasLocation(false);
        setLocation("");
        setDeadlineDate("");
        setDeadlineTime("");
        setDueDate("");
      }
    } catch (error) {
      console.error("SQForm handleSubmit error:", error);
      Alert.alert("Error", "Failed to add quest.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {mode === "save" ? "Add New Side Quest" : "Edit Side Quest"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Quest Title (describe your plan)"
        placeholderTextColor={theme.colors.textSecondary}
        value={title}
        onChangeText={setTitle}
      />
      <View style={styles.row}>
        <Text style={styles.label}>Track Duration?</Text>
        <Switch
          value={hasDuration}
          onValueChange={setHasDuration}
          trackColor={{
            false: theme.colors.switchTrackOff,
            true: theme.colors.switchTrackOn,
          }}
          thumbColor={theme.colors.switchThumb}
        />
      </View>
      {hasDuration && (
        <TextInput
          style={styles.input}
          placeholder="Duration in minutes"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="numeric"
          value={durationMinutes}
          onChangeText={setDurationMinutes}
        />
      )}
      <View style={styles.row}>
        <Text style={styles.label}>Track Location?</Text>
        <Switch
          value={hasLocation}
          onValueChange={setHasLocation}
          trackColor={{
            false: theme.colors.switchTrackOff,
            true: theme.colors.switchTrackOn,
          }}
          thumbColor={theme.colors.switchThumb}
        />
      </View>
      {hasLocation && (
        <TextInput
          style={styles.input}
          placeholder="Location (e.g. postcode)"
          placeholderTextColor={theme.colors.textSecondary}
          value={location}
          onChangeText={setLocation}
        />
      )}
      {/* Toggle between Deadline and Due Date */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            dateMode === "deadline" && styles.activeModeButton,
          ]}
          onPress={() => setDateMode("deadline")}
        >
          <Text style={styles.modeButtonText}>Deadline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            dateMode === "due" && styles.activeModeButton,
          ]}
          onPress={() => setDateMode("due")}
        >
          <Text style={styles.modeButtonText}>Due Date</Text>
        </TouchableOpacity>
      </View>
      {dateMode === "deadline" ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Deadline Date (YYYY-MM-DD)"
            placeholderTextColor={theme.colors.textSecondary}
            value={deadlineDate}
            onChangeText={setDeadlineDate}
          />
          <TextInput
            style={styles.input}
            placeholder="Deadline Time (HH:MM, 24hr)"
            placeholderTextColor={theme.colors.textSecondary}
            value={deadlineTime}
            onChangeText={setDeadlineTime}
          />
        </>
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Due Date (YYYY-MM-DD)"
          placeholderTextColor={theme.colors.textSecondary}
          value={dueDate}
          onChangeText={setDueDate}
        />
      )}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Save New Quest</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: theme.typography.headerFontSize,
    fontWeight: "bold",
    marginBottom: theme.spacing.small,
    color: theme.colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.small,
    fontSize: theme.typography.inputFontSize,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.inputBackground,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.small,
  },
  label: {
    fontSize: theme.typography.bodyFontSize,
    color: theme.colors.textPrimary,
    marginRight: theme.spacing.small,
  },
  modeButton: {
    flex: 1,
    paddingVertical: theme.spacing.small,
    backgroundColor: theme.colors.grayButtonBackground,
    alignItems: "center",
    marginHorizontal: theme.spacing.xsmall,
    borderRadius: theme.borderRadius.small,
  },
  activeModeButton: {
    backgroundColor: theme.colors.greenButtonBackground,
  },
  modeButtonText: {
    fontSize: theme.typography.bodyFontSize,
    color: theme.colors.textPrimary,
  },
  button: {
    backgroundColor: theme.colors.greenButtonBackground,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.small,
    alignItems: "center",
    marginTop: theme.spacing.medium,
  },
  buttonText: {
    color: theme.colors.greenButtonText,
    fontSize: theme.typography.bodyFontSize,
  },
});
