import { LinearGradient } from "expo-linear-gradient"; // Subtle active gradient
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../styles/theme";

export default function QuestCard({
  quest,
  onCancel,
  onEdit,
  onStart,
  onComplete,
}) {
  // Format estimated travel time (if available)
  const estimatedTravelTime = quest.estimated_travel_time_minutes
    ? ` (${quest.estimated_travel_time_minutes} min)`
    : "";

  return (
    <LinearGradient
      colors={
        quest.status === "active"
          ? [theme.colors.cardBackground, theme.colors.badgeBackground] // Subtle gradient for active quest
          : [theme.colors.cardBackground, theme.colors.cardBackground]
      }
      style={[styles.questCard]}
    >
      {/* Left Side - Quest Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.questTitle}>{quest.title}</Text>
        {quest.has_duration && (
          <Text style={styles.questDetail}>
            ⏳ {quest.duration_minutes} min
          </Text>
        )}
        {quest.has_location && (
          <Text style={styles.questDetail}>
            📍 {quest.location} {estimatedTravelTime}
          </Text>
        )}
        {(quest.deadline || quest.due_date) && (
          <Text style={styles.questDetail}>
            📅{" "}
            {quest.deadline
              ? new Date(quest.deadline).toLocaleString()
              : quest.due_date}
          </Text>
        )}
      </View>

      {/* Right Side - Monochrome Action Buttons */}
      <View style={styles.buttonsContainer}>
        {quest.status === "active" ? (
          <TouchableOpacity style={styles.iconButton} onPress={onComplete}>
            <Text style={styles.iconText}>✅</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.iconButton} onPress={onCancel}>
              <Text style={styles.iconText}>🏳️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={onEdit}>
              <Text style={styles.iconText}>📝</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={onStart}>
              <Text style={styles.iconText}>▶️</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  questCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    shadowColor: theme.colors.shadowColor,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
    minHeight: 100,
  },
  detailsContainer: {
    flex: 1,
    paddingRight: theme.spacing.small,
  },
  questTitle: {
    fontSize: theme.typography.bodyFontSize, // Reduced for better spacing
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xsmall,
  },
  questDetail: {
    fontSize: theme.typography.labelFontSize, // Reduced size for better clarity
    color: theme.colors.textSecondary,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: theme.spacing.xsmall,
    marginLeft: theme.spacing.xsmall,
    alignItems: "center",
  },
  iconText: {
    fontSize: 20, // Increased slightly for better visibility
    color: theme.colors.textPrimary, // Monochrome effect (same as ChallengeToggler)
  },
});
