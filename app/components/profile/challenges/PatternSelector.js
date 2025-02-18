import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../../styles/theme";

export default function PatternSelector({ patternType, setPatternType }) {
  return (
    <View style={styles.container}>
      {/* Fixed Pattern Button */}
      <TouchableOpacity
        style={[
          styles.button,
          patternType === "fixed" ? styles.activeButton : styles.inactiveButton,
        ]}
        onPress={() => setPatternType("fixed")}
      >
        <Text style={styles.buttonText}>Fixed Pattern</Text>
      </TouchableOpacity>

      {/* Rolling Pattern Button */}
      <TouchableOpacity
        style={[
          styles.button,
          patternType === "rolling"
            ? styles.activeButton
            : styles.inactiveButton,
        ]}
        onPress={() => setPatternType("rolling")}
      >
        <Text style={styles.buttonText}>Rolling Pattern</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: theme.spacing.medium,
  },
  button: {
    flex: 1,
    marginHorizontal: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    justifyContent: "center",
  },
  activeButton: {
    backgroundColor: theme.colors.greenButtonBackground,
  },
  inactiveButton: {
    backgroundColor: theme.colors.grayButtonBackground,
  },
  buttonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyFontSize,
    fontWeight: "600",
  },
});
