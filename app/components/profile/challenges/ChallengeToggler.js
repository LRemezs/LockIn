// components/challenges/ChallengeToggler.js
import React, { useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import ChallengeSettings from "./ChallengeSettings";

export default function ChallengeToggler({ challenge }) {
  // For non-default challenges, maintain local state for active/inactive.
  const [isActive, setIsActive] = useState(challenge.is_active);
  // Separate state to toggle the display of settings.
  const [showSettings, setShowSettings] = useState(false);

  return (
    <View
      style={[
        styles.container,
        challenge.is_default ? styles.defaultContainer : styles.customContainer,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{challenge.challenge_name}</Text>
          {challenge.is_default && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Default</Text>
            </View>
          )}
        </View>
        <View style={styles.controls}>
          {/* For non-default challenges, show the active/inactive switch */}
          {!challenge.is_default && (
            <Switch
              value={isActive}
              onValueChange={(value) => {
                setIsActive(value);
                // TODO: Update is_active in the database if needed
              }}
            />
          )}
          {/* Gear button to toggle settings display */}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettings((prev) => !prev)}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Render ChallengeSettings if showSettings is true */}
      {showSettings && <ChallengeSettings challenge={challenge} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  defaultContainer: {
    backgroundColor: "#e6f7ff", // light blue tint for default challenges
  },
  customContainer: {
    backgroundColor: "#fff",
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
    fontSize: 18,
    fontWeight: "bold",
  },
  badge: {
    backgroundColor: "green",
    borderRadius: 4,
    marginLeft: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsButton: {
    marginLeft: 10,
  },
  settingsIcon: {
    fontSize: 24,
  },
});
