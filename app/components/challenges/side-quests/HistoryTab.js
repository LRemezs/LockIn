import { useSelector } from "@legendapp/state/react";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { completeSideQuests$ } from "../../../../utils/questsUtils";
import { theme } from "../../../styles/theme";

export default function HistoryTab() {
  const completeSideQuests = useSelector(completeSideQuests$) || [];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Completed Side Quests</Text>
      {completeSideQuests.length === 0 ? (
        <Text style={styles.placeholderText}>
          No completed side quests found.
        </Text>
      ) : (
        <FlatList
          data={completeSideQuests}
          keyExtractor={(item) => item.quest_id}
          renderItem={({ item }) => (
            <View style={styles.questCard}>
              {/* Left side: Quest details */}
              <View style={styles.detailsContainer}>
                <Text style={styles.questTitle}>{item.title}</Text>
                <Text style={styles.questDetail}>
                  Completed: {new Date(item.updated_at).toLocaleString()}
                </Text>
              </View>

              {/* Right side: Grey "Engraved" Checkmark */}
              <Text style={styles.checkmark}>✔</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.background,
  },
  sectionTitle: {
    fontSize: theme.typography.headerFontSize,
    fontWeight: theme.typography.headerFontWeight,
    marginBottom: theme.spacing.medium,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  placeholderText: {
    fontSize: theme.typography.bodyFontSize,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginVertical: theme.spacing.large,
  },
  questCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 80,
  },
  detailsContainer: {
    flex: 1,
  },
  questTitle: {
    fontSize: theme.typography.bodyFontSize,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xsmall,
  },
  questDetail: {
    fontSize: theme.typography.labelFontSize,
    color: theme.colors.textSecondary,
  },
  checkmark: {
    fontSize: 22,
    color: theme.colors.textSecondary, // Metallic grey color
    textShadowColor: theme.colors.shadowColor, // Slight shadow for depth
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
