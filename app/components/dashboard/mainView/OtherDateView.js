import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function OtherDateView() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Schedule for Selected Date</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 2,
    borderColor: "#333",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff7043", // Bright orange to differentiate
  },
});
