import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  cancelChallenge,
  refreshAllChallenges,
} from "../../../../utils/challengesUtils";
import { theme } from "../../../styles/theme";
import ChallengeSettings from "./ChallengeSettings";

export default function ChallengeToggler({ challenge }) {
  const [isActive, setIsActive] = useState(challenge.is_active);
  const [showSettings, setShowSettings] = useState(false);

  const handleCancelChallenge = () => {
    Alert.alert(
      "",
      `Are you sure you want to give up on "${challenge.challenges_options?.challenge_name} challenge"?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await cancelChallenge(challenge.challenge_subscription_id);

              // Show confirmation alert with an OK button
              Alert.alert(
                "Challenge Cancelled",
                "You can always restart it later.",
                [
                  {
                    text: "OK",
                    onPress: async () => {
                      await refreshAllChallenges();
                      console.log(
                        "✅ handleCancelChallenge(): Cancelation completed."
                      );
                    },
                  },
                ]
              );
            } catch (error) {
              console.error("Error during cancellation:", error);
              Alert.alert("Error", "Failed to cancel challenge.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {challenge.challenges_options?.challenge_name ||
                "Unnamed Challenge"}
            </Text>
            {challenge.is_default && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Default</Text>
              </View>
            )}
          </View>
          <View style={styles.controls}>
            {!challenge.is_default && (
              <Switch
                value={isActive}
                onValueChange={(value) => setIsActive(value)}
                trackColor={{
                  false: theme.colors.switchTrackOff,
                  true: theme.colors.switchTrackOn,
                }}
                thumbColor={theme.colors.switchThumb}
              />
            )}
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setShowSettings((prev) => !prev)}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelChallenge}
            >
              <Text style={styles.cancelIcon}>🏳️</Text>
            </TouchableOpacity>
          </View>
        </View>
        {showSettings && <ChallengeSettings challenge={challenge} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.cardBackground,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    paddingHorizontal: 0,
  },
  innerContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    minHeight: 100,
    margin: 2,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    backgroundColor: theme.colors.background,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  badgeText: {
    color: theme.colors.textPrimary,
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsButton: {
    marginLeft: 10,
  },
  settingsIcon: {
    fontSize: 28,
    color: theme.colors.textPrimary,
  },
  cancelButton: {
    marginLeft: 10,
  },
  cancelIcon: {
    fontSize: 28,
    color: theme.colors.accent,
  },
});
