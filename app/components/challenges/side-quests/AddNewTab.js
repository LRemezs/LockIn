// components/challenges/side-quests/AddNewTab.js
import React from "react";
import { StyleSheet, View } from "react-native";
import { addSideQuest } from "../../../../utils/questsUtils";
import { theme } from "../../../styles/theme";
import SQForm from "./SQForm";

export default function AddNewTab() {
  const handleSubmit = async (formData) => {
    try {
      await addSideQuest(formData);
      // Optionally, provide feedback here (e.g., toast notification)
    } catch (error) {
      console.error("Error adding quest:", error);
    }
  };

  return (
    <View style={styles.container}>
      <SQForm onSubmit={handleSubmit} mode="save" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
