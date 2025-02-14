import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function BrowseScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>⚔️ Challenge Toggle</Text>
      <Text style={styles.body}>Toggle Active Challenges Here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  body: {
    fontSize: 16,
    color: "#666",
  },
});
