import { useObservable } from "@legendapp/state/react";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { challengesStore$ } from "../../../state/stateObservables";
import { fetchChallenges } from "../../../utils/challengesUtils";
import ChallengeButton from "./ChallengeButton";

export default function ChallengeScroll() {
  const challengesState = useObservable(challengesStore$);
  useEffect(() => {
    async function loadChallenges() {
      challengesStore$.loading.set(true);
      try {
        const data = await fetchChallenges();
        challengesStore$.challenges.set(data);
      } catch (err) {
        challengesStore$.error.set(err.message);
      } finally {
        challengesStore$.loading.set(false);
      }
    }
    loadChallenges();
  }, []);

  if (challengesState.loading.get()) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  if (challengesState.error.get()) {
    return (
      <View style={styles.loading}>
        <Text>Error loading challenges: {challengesState.error.get()}</Text>
      </View>
    );
  }

  // Access the underlying challenges array using .get()
  const defaultChallenges = challengesState.challenges
    .get()
    .filter((c) => c.is_default);
  const customChallenges = challengesState.challenges
    .get()
    .filter((c) => !c.is_default && c.userAccepted);
  const sortedChallenges = [...defaultChallenges, ...customChallenges];

  return (
    <View style={styles.wrapper}>
      <View style={styles.challengeScrollContainer}>
        <FlatList
          horizontal
          keyExtractor={(item) => item.challenge_id}
          data={sortedChallenges}
          renderItem={({ item }) => (
            <ChallengeButton
              id={item.challenge_id}
              name={item.challenge_name}
              onPress={() => {
                console.log(`✒️ Challenge ${item.challenge_name} selected...`);
              }}
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
