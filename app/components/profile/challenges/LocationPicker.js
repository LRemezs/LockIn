import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { theme } from "../../../styles/theme";
import LocationSearch from "../../assetComponents/LocationSearch";

export default function LocationPicker({
  useLocation,
  onToggle,
  onLocationSelect, // Callback to update the selected location in your hook
  defaultLocation, // The current selected location (if any) from your settings state
}) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Use Location:</Text>
        <Switch
          value={useLocation}
          onValueChange={onToggle}
          trackColor={{
            false: theme.colors.switchTrackOff,
            true: theme.colors.switchTrackOn,
          }}
          thumbColor={theme.colors.switchThumb}
        />
      </View>
      {useLocation && (
        <View style={styles.searchContainer}>
          <LocationSearch
            onLocationSelect={onLocationSelect}
            defaultValue={defaultLocation}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.medium,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.labelFontSize,
  },
  searchContainer: {
    marginTop: theme.spacing.small,
    padding: theme.spacing.small,
    backgroundColor: theme.colors.sectionBackground,
    borderRadius: theme.borderRadius.small,
  },
});
