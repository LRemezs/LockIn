// app/(tabs)/dashboard/challenges/SideQuests/ToDoTab.js
import { useSelector } from "@legendapp/state/react";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  cancelQuest,
  completeQuest,
  editQuest,
  incompleteSideQuests$,
  startQuest,
} from "../../../../utils/questsUtils";
import QuestCard from "../../../components/challenges/QuestCard";
import { theme } from "../../../styles/theme";
import SQForm from "../side-quests/SQForm";

export default function ToDoTab() {
  const incompleteSideQuests = useSelector(incompleteSideQuests$) || [];
  const [editingQuest, setEditingQuest] = useState(null);

  // Sort quests by deadline/due_date (earliest first)
  const sortedQuests = incompleteSideQuests.sort((a, b) => {
    const dateA = a.deadline ? new Date(a.deadline) : new Date(a.due_date);
    const dateB = b.deadline ? new Date(b.deadline) : new Date(b.due_date);
    return dateA - dateB;
  });

  // Open edit modal for a quest
  const handleEditPress = (quest) => {
    setEditingQuest(quest);
  };

  // Handle quest edit submission
  const handleEditSubmit = async (formData) => {
    try {
      console.log("📝 Editing quest", editingQuest.quest_id, formData);
      await editQuest(editingQuest.quest_id, formData);
      Alert.alert("Success", "Quest edited successfully.");
      setEditingQuest(null);
    } catch (error) {
      console.error("Error editing quest", error);
      Alert.alert("Error", "Failed to edit quest.");
    }
  };

  const renderQuest = ({ item }) => (
    <QuestCard
      quest={item}
      onCancel={async () => {
        await cancelQuest(item.quest_id);
      }}
      onEdit={() => handleEditPress(item)}
      onStart={async () => {
        try {
          await startQuest(item.quest_id);
        } catch (error) {
          console.error("Error in onStart callback", error);
        }
      }}
      onComplete={async () => {
        try {
          await completeQuest(item.quest_id);
        } catch (error) {
          console.error("Error marking quest as complete", error);
        }
      }}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Side Quests - To Do</Text>
      {sortedQuests.length === 0 ? (
        <Text style={styles.placeholderText}>No pending side quests.</Text>
      ) : (
        <FlatList
          data={sortedQuests}
          keyExtractor={(item) => item.quest_id}
          renderItem={renderQuest}
        />
      )}

      {/* Edit Modal */}
      {editingQuest && (
        <Modal
          visible={true}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setEditingQuest(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Quest</Text>

              {/* Scrollable Form */}
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
              >
                <SQForm
                  initialData={editingQuest}
                  onSubmit={handleEditSubmit}
                  mode="edit"
                />
              </ScrollView>

              {/* Buttons Fixed at Bottom */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setEditingQuest(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
  },
  sectionTitle: {
    fontSize: theme.typography.headerFontSize,
    fontWeight: "bold",
    marginBottom: theme.spacing.small,
    color: theme.colors.textPrimary,
  },
  placeholderText: {
    fontSize: theme.typography.bodyFontSize,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginVertical: theme.spacing.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)", // Darker background for better contrast
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: theme.typography.headerFontSize,
    fontWeight: "bold",
    marginBottom: theme.spacing.small,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  modalScrollContent: {
    paddingBottom: theme.spacing.medium,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.medium,
  },
  closeButton: {
    backgroundColor: theme.colors.grayButtonBackground,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
    borderRadius: theme.borderRadius.small,
    alignItems: "center",
    flex: 1,
    marginLeft: theme.spacing.small,
  },
  closeButtonText: {
    color: theme.colors.grayButtonText,
    fontSize: theme.typography.bodyFontSize,
  },
});
