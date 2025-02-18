import React, { useEffect } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import useChallengeSettings from "../../../hooks/useChallengeSettings";
import { theme } from "../../../styles/theme";
import GreenButton from "../../assetComponents/GreenButton";
import ChallengeSpecificSettings from "./ChallengeSpecificSettings";
import FixedPatternSettings from "./FixedPatternSettings";
import LocationPicker from "./LocationPicker";
import PatternSelector from "./PatternSelector";
import RollingPatternSettings from "./RollingPatternSettings";

export default function ChallengeSettings({
  challenge,
  onPatternChange,
  hideSaveButton = false,
}) {
  // Use our custom hook for state and business logic
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
    buildSettingsObject,
  } = useChallengeSettings(challenge);

  // Whenever settings change, lift the built object to the parent if needed
  useEffect(() => {
    if (onPatternChange) {
      onPatternChange(buildSettingsObject());
    }
  }, [
    patternType,
    fixedDays,
    rollingSegments,
    useLocation,
    favoriteLocations,
    specificSettings,
  ]);

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
      <Text style={styles.header}>Challenge Settings:</Text>
      {/* Pattern selector */}
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
      {/* Generic settings: location and favorite locations */}
      <View style={styles.genericSection}>
        <LocationPicker
          useLocation={useLocation}
          favoriteLocations={favoriteLocations}
          onToggle={setUseLocation}
          onUpdateFavorites={setFavoriteLocations}
        />
      </View>
      {/* Challenge-specific settings */}
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
      {!hideSaveButton && (
        <View style={styles.saveButtonContainer}>
          <GreenButton title="Save Settings" onPress={handleSave} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.small,
    padding: theme.spacing.small,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  header: {
    fontSize: theme.typography.headerFontSize,
    fontWeight: theme.typography.headerFontWeight,
    color: theme.colors.textPrimary,
  },
  genericSection: {
    marginVertical: theme.spacing.small,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 5,
  },
  saveButtonContainer: {
    marginVertical: theme.spacing.medium,
    alignItems: "center",
  },
  specificSection: {
    marginVertical: theme.spacing.medium,
    padding: theme.spacing.small,
    backgroundColor: theme.colors.sectionBackground,
    borderRadius: theme.borderRadius.medium,
  },
});
