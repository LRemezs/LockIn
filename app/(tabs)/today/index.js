import { StyleSheet, Text, View } from "react-native";

export default function TodayScreen() {
  return (
    <View style={styles.screen}>
      <Text>Welcome to the Today Tab!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
