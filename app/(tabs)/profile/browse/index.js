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
import Markdown from "react-native-markdown-display";
import { supabase } from "../../../../state/supabaseClient";
import {
  acceptChallenge,
  availableChallenges$,
  DEFAULT_CHALLENGE_PATTERN,
  refreshAllChallenges,
} from "../../../../utils/challengesUtils";
import GrayButton from "../../../components/assetComponents/GrayButton";
import GreenButton from "../../../components/assetComponents/GreenButton";
import ChallengeSettings from "../../../components/profile/challenges/ChallengeSettings";
import { theme } from "../../../styles/theme";

export default function BrowseScreen() {
  const availableChallenges = useSelector(availableChallenges$) || [];
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [configuredPattern, setConfiguredPattern] = useState(null);

  const handlePanelPress = (challenge) => {
    setSelectedChallenge(challenge);
    setModalVisible(true);
    setShowSettings(false);
    setConfiguredPattern(null);
  };

  const handlePatternChange = (pattern) => {
    setConfiguredPattern(pattern);
  };

  const handleChallengeAccepted = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    const patternToUse =
      configuredPattern ||
      selectedChallenge.pattern ||
      DEFAULT_CHALLENGE_PATTERN;

    try {
      await acceptChallenge(selectedChallenge, session.user, patternToUse);
      Alert.alert(
        "Challenge Accepted",
        "You have successfully accepted the challenge."
      );
      setModalVisible(false);
      refreshAllChallenges();
    } catch (err) {
      console.error("Error accepting challenge:", err);
      Alert.alert("Error", "Failed to accept challenge.");
    }
  };

  const renderPanel = ({ item }) => (
    <TouchableOpacity
      style={styles.panel}
      onPress={() => handlePanelPress(item)}
    >
      <View style={styles.panelContent}>
        <Text style={styles.panelTitle}>{item.challenge_name}</Text>
        <View style={styles.backgroundPattern} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Browse Challenges</Text>
      {availableChallenges.length === 0 ? (
        <Text style={styles.emptyText}>No challenges available.</Text>
      ) : (
        <FlatList
          data={availableChallenges}
          keyExtractor={(item) => item.challenge_id}
          renderItem={renderPanel}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {selectedChallenge && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView style={styles.scrollContainer}>
                {showSettings ? (
                  <ChallengeSettings
                    challenge={selectedChallenge}
                    hideSaveButton={true}
                    onPatternChange={handlePatternChange}
                  />
                ) : (
                  <Markdown style={markdownStyles}>
                    {selectedChallenge.description ||
                      "No further details available."}
                  </Markdown>
                )}
              </ScrollView>
              <View style={styles.modalButtons}>
                <GrayButton
                  title={showSettings ? "Back" : "Settings"}
                  onPress={() => setShowSettings((prev) => !prev)}
                />
                <GreenButton
                  title="Accept Challenge"
                  onPress={handleChallengeAccepted}
                />
              </View>
              <GrayButton
                title="Close"
                onPress={() => setModalVisible(false)}
              />
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
    padding: theme.spacing.small,
    backgroundColor: theme.colors.background,
  },
  header: {
    fontSize: theme.typography.headerFontSize,
    fontWeight: theme.typography.headerFontWeight,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.medium,
  },
  listContainer: {
    paddingBottom: theme.spacing.large,
  },
  panel: {
    height: 100,
    marginVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    overflow: "hidden",
    position: "relative",
  },
  panelContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.cardBackground,
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#333",
    opacity: 0.3,
    backgroundImage:
      "linear-gradient(135deg, rgba(24, 51, 36, 0.5), rgba(58,107,79,0))",
  },
  panelTitle: {
    fontSize: theme.typography.headerFontSize,
    color: theme.colors.textPrimary,
    fontWeight: "bold",
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: theme.spacing.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(46, 46, 46, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "95%",
    maxHeight: "80%",
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  scrollContainer: {
    flexGrow: 0,
    marginBottom: theme.spacing.medium,
  },
  markdown: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyFontSize,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: theme.spacing.large,
  },
});

const markdownStyles = {
  heading1: { color: theme.colors.textPrimary, fontSize: 22, marginBottom: 10 },
  heading2: { color: theme.colors.textPrimary, fontSize: 20, marginBottom: 8 },
  heading3: { color: theme.colors.textPrimary, fontSize: 18, marginBottom: 6 },
  body: { color: theme.colors.textPrimary, fontSize: 16 },
  strong: { color: theme.colors.accent },
  blockquote: {
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.cardBackground,
    borderLeftColor: theme.colors.accent,
    borderLeftWidth: 4,
    padding: 10,
    marginVertical: 5,
    borderRadius: theme.borderRadius.small,
  },
  list_item: { color: theme.colors.textPrimary, marginVertical: 4 },
  text: { color: theme.colors.textPrimary },
};
