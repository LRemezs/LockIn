import { Stack } from "expo-router";
import { theme } from "../../styles/theme";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.headerBackground,
        },
        headerTintColor: theme.colors.headerText,
        headerTitleStyle: {
          fontSize: theme.typography.headerFontSize,
          fontWeight: theme.typography.headerFontWeight,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="info" options={{ headerTitle: "Profile Info" }} />
      <Stack.Screen
        name="challenges"
        options={{ headerTitle: "⚔️ Manage Challenges" }}
      />
      <Stack.Screen
        name="browse"
        options={{ headerTitle: "🔎 Browse Challenges" }}
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
