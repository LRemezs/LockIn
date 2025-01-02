import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getCurrentUser } from "../utils/auth";
import { initializeTestAccounts } from "../utils/testAccountsInit";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    async function initialize() {
      await initializeTestAccounts();
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
    }

    initialize();
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}
