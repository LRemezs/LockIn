// app/(tabs)/dashboard/challenges/Sleep/_layout.js
import { Stack } from "expo-router";
import { theme } from "../../../../styles/theme";

export default function SideQuestsLayout() {
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
      <Stack.Screen name="index" options={{ title: "Side-Quest Challenge" }} />
    </Stack>
  );
}
