import { Stack } from "expo-router";

export default function TodayLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Today's Overview" }} />
    </Stack>
  );
}
