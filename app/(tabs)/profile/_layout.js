import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="info" options={{ headerTitle: "Profile Info" }} />
      <Stack.Screen name="challenges" options={{ headerTitle: "Challenges" }} />
      <Stack.Screen
        name="browse"
        options={{ headerTitle: "Browse Challenges" }}
      />
      <Stack.Screen
        name="achievementLogs"
        options={{ headerTitle: "Achievement Logs" }}
      />
      <Stack.Screen
        name="wall"
        options={{ headerTitle: "Wall of Inspiration" }}
      />
    </Stack>
  );
}
