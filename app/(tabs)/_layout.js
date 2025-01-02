import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs initialRouteName="dashboard" screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="manager" options={{ title: "Manager" }} />
    </Tabs>
  );
}
