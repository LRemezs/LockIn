import { StyleSheet, Text, View } from "react-native";

export default function ManagerScreen() {
  return (
    <View style={styles.screen}>
      <Text>Welcome to the Manager Tab!</Text>
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
