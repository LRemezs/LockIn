// app/(tabs)/dashboard/challenges/Sleep/_layout.js
import { Stack } from "expo-router";

export default function SleepLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Sleep Challenge" }} />
      {/* Additional Sleep-specific screens can be added here */}
    </Stack>
  );
}
