import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { refreshAllQuests } from "../../../../../utils/questsUtils";
import AddNewTab from "../../../../components/challenges/side-quests/AddNewTab";
import HistoryTab from "../../../../components/challenges/side-quests/HistoryTab";
import ToDoTab from "../../../../components/challenges/side-quests/ToDoTab";
import { theme } from "../../../../styles/theme";

export default function SideQuestsScreen() {
  const [activeTab, setActiveTab] = useState("Add");

  useEffect(() => {
    refreshAllQuests(); // Refresh quests from Supabase when screen loads
  }, []);

  const renderCurrentTab = () => {
    switch (activeTab) {
      case "Add":
        return <AddNewTab />;
      case "ToDo":
        return <ToDoTab />;
      case "History":
        return <HistoryTab />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Tab Navigation */}
      <View style={styles.tabNav}>
        {["Add", "ToDo", "History"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab && styles.activeTabButtonText,
              ]}
            >
              {tab === "Add" ? "Add New" : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Render the content for the active tab */}
      {renderCurrentTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
  },
  tabNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: theme.spacing.medium,
    borderBottomWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  tabButton: {
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.accent,
  },
  tabButtonText: {
    fontSize: theme.typography.bodyFontSize,
    color: theme.colors.textSecondary,
  },
  activeTabButtonText: {
    fontWeight: "bold",
    color: theme.colors.textPrimary,
  },
});
