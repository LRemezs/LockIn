import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      {/* Add more screens here if needed */}
      <Stack.Screen name="index" options={{ title: "Your Profile" }} />
    </Stack>
  );
}
