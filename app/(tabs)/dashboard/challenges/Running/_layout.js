import { Stack } from "expo-router";

export default function RunningLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Running Challenge" }} />
    </Stack>
  );
}
