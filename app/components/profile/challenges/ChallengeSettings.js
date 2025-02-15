import React from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";
import useChallengeSettings from "../../../hooks/useChallengeSettings";
import ChallengeSpecificSettings from "./ChallengeSpecificSettings";
import FixedPatternSettings from "./FixedPatternSettings";
import LocationPicker from "./LocationPicker";
import PatternSelector from "./PatternSelector";
import RollingPatternSettings from "./RollingPatternSettings";

export default function ChallengeSettings({ challenge }) {
  // Use our custom hook to manage all settings state and actions.
  const {
    patternType,
    setPatternType,
    fixedDays,
    setFixedDays,
    rollingSegments,
    setRollingSegments,
    useLocation,
    setUseLocation,
    favoriteLocations,
    setFavoriteLocations,
    specificSettings,
    setSpecificSettings,
    availableOptions,
    saveSettings,
  } = useChallengeSettings(challenge);

  // Handler for the Save button. Calls the hook's saveSettings function.
  const handleSave = async () => {
    try {
      await saveSettings();
      Alert.alert("Settings saved successfully.");
    } catch (error) {
      console.error("Error during update:", error);
      Alert.alert("Error saving settings", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings for {challenge.challenge_name}</Text>
      {/* PatternSelector lets user choose fixed vs. rolling */}
      <PatternSelector
        patternType={patternType}
        setPatternType={setPatternType}
      />
      {/* Conditionally render fixed or rolling settings */}
      {patternType === "fixed" && (
        <FixedPatternSettings
          fixedDays={fixedDays}
          onChangeFixedDays={setFixedDays}
        />
      )}
      {patternType === "rolling" && (
        <RollingPatternSettings
          segments={rollingSegments}
          onChange={setRollingSegments}
        />
      )}
      {/* Generic settings section: location tracking and favorite locations */}
      <View style={styles.genericSection}>
        <LocationPicker
          useLocation={useLocation}
          favoriteLocations={favoriteLocations}
          onToggle={setUseLocation}
          onUpdateFavorites={setFavoriteLocations}
        />
      </View>
      {/* Challenge-specific settings section (fetched dynamically) */}
      {availableOptions && (
        <View style={styles.specificSection}>
          <Text style={styles.subHeader}>Challenge-Specific Settings</Text>
          <ChallengeSpecificSettings
            options={availableOptions}
            settings={specificSettings}
            onChangeSettings={setSpecificSettings}
          />
        </View>
      )}
      <View style={styles.saveButtonContainer}>
        <Button title="Save Settings" onPress={handleSave} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  genericSection: {
    marginVertical: 10,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  saveButtonContainer: {
    marginVertical: 10,
  },
  specificSection: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#e8f0ff",
    borderRadius: 8,
  },
});
