import { useObservable } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { activeChallenges$ } from "../../../utils/challengesUtils";
import ChallengeButton from "./ChallengeButton";

export default function ChallengeScroll() {
  const router = useRouter();
  // Subscribe directly to the computed observable for active challenges
  const activeChallenges = [...useObservable(activeChallenges$).get()];

  // Optionally, you can add a conditional check if data isn't ready yet
  if (!activeChallenges) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  // If there are no active challenges, you might also display a placeholder
  if (activeChallenges.length === 0) {
    return (
      <View style={styles.loading}>
        <Text>No active challenges found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.challengeScrollContainer}>
        <FlatList
          horizontal
          keyExtractor={(item) => item.challenge_id}
          data={activeChallenges}
          renderItem={({ item }) => (
            <ChallengeButton
              id={item.challenge_id}
              name={item.challenges_options?.challenge_name}
              onPress={() =>
                router.push(
                  `/dashboard/challenges/${item.challenges_options?.challenge_name}`
                )
              }
            />
          )}
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
    height: 90,
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
  loading: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
});
