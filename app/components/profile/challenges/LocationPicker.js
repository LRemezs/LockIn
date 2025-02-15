// components/challenges/LocationPicker.js
import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

export default function LocationPicker({ useLocation, onToggle }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Use Location:</Text>
        <Switch value={useLocation} onValueChange={onToggle} />
      </View>
      {useLocation && (
        <View style={styles.favorites}>
          <Text>Favorite locations dropdown goes here.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    marginRight: 10,
  },
  favorites: {
    marginTop: 5,
    padding: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
});
