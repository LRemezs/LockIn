import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs initialRouteName="today">
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="today" options={{ title: "Today" }} />
      <Tabs.Screen name="manager" options={{ title: "Manager" }} />
    </Tabs>
  );
}
