import { Stack } from "expo-router";

export default function ManagerLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Manager" }} />
    </Stack>
  );
}
