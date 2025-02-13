import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import BrowseChallenges from "./BrowseChallenges";
import ChallengeButton from "./ChallengeButton";

const challenges = [
  { id: "sleep", name: "Sleep", isDefault: true },
  { id: "basic_todo", name: "Basic To-Do", isDefault: true },
  { id: "custom_1", name: "Workout", isDefault: false, userAccepted: true },
  { id: "custom_2", name: "Meditation", isDefault: false, userAccepted: true },
  { id: "custom_3", name: "Reading", isDefault: false, userAccepted: true },
  { id: "custom_4", name: "Hydration", isDefault: false, userAccepted: true },
  { id: "custom_5", name: "Journaling", isDefault: false, userAccepted: true },
  { id: "custom_6", name: "Stretching", isDefault: false, userAccepted: true },
  { id: "custom_7", name: "Gratitude", isDefault: false, userAccepted: true },
  {
    id: "custom_8",
    name: "Healthy Eating",
    isDefault: false,
    userAccepted: true,
  },
  {
    id: "custom_9",
    name: "Digital Detox",
    isDefault: false,
    userAccepted: true,
  },
];

export default function ChallengeScroll() {
  const sortedChallenges = [
    ...challenges.filter((c) => c.isDefault),
    ...challenges.filter((c) => !c.isDefault && c.userAccepted),
  ];

  const challengesWithBrowse = [
    ...sortedChallenges,
    { id: "browse", name: "Browse Challenges" },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.challengeScrollContainer}>
        <FlatList
          horizontal
          keyExtractor={(item) => item.id}
          data={challengesWithBrowse}
          renderItem={({ item }) =>
            item.id === "browse" ? (
              <BrowseChallenges />
            ) : (
              <ChallengeButton id={item.id} name={item.name} />
            )
          }
          showsHorizontalScrollIndicator={true}
          persistentScrollbar={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 5,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  challengeScrollContainer: {
    height: 90, // ✅ Reduced height
    width: "95%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});
