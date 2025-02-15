// views/challenges/index.js (BrowseScreen)
import { useObservable } from "@legendapp/state/react";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { challengesStore$ } from "../../../../state/stateObservables";
import ChallengeToggler from "../../../components/profile/challenges/ChallengeToggler";

export default function ChallengeScreen() {
  const challengesState = useObservable(challengesStore$);
  // Retrieve the list of challenges (using .get() if needed)
  const activeChallenges = challengesState.challenges.get();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>⚔️ Challenge Toggle</Text>
      <FlatList
        data={activeChallenges}
        keyExtractor={(item) => item.challenge_id}
        renderItem={({ item }) => <ChallengeToggler challenge={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
