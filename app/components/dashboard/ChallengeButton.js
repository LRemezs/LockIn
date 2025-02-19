import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import challengeIcons from "../../../assets/images/challengeIcons/challengeIcons";

export default function ChallengeButton({ id, name, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Image source={challengeIcons[name]} style={styles.icon} />
      <Text style={styles.text} numberOfLines={2}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 65,
    height: 65,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 3,
    padding: 4,
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  text: {
    fontSize: 10,
    color: "#333",
    marginTop: 3,
    textAlign: "center",
  },
});
