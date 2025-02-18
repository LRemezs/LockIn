import { useSelector } from "@legendapp/state/react";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { activeChallenges$ } from "../../../../utils/challengesUtils";
import ChallengeToggler from "../../../components/profile/challenges/ChallengeToggler";
import { theme } from "../../../styles/theme";

export default function ChallengesScreen() {
  // Subscribe directly to the computed observable for active challenges
  // useSelector returns a plain JS value from the computed observable
  const activeChallenges = useSelector(activeChallenges$);

  return (
    <View style={styles.container}>
      <FlatList
        data={activeChallenges}
        keyExtractor={(item) => item.challenge_subscription_id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <ChallengeToggler
              challenge={item}
              activeChallenges={activeChallenges}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
  },
  card: {
    backgroundColor: theme.colors.cardBackground,
    marginBottom: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  text: {
    color: theme.colors.textPrimary,
    fontSize: 18,
  },
});
