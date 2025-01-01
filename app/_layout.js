import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getCurrentUser } from "../utils/auth";
import { initializeTestAccounts } from "../utils/testAccountsInit";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    async function initialize() {
      // Initialize test accounts in local storage
      await initializeTestAccounts();

      // Check if a user is currently authenticated
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
    }

    initialize();
  }, []);

  // Show a loading indicator while authentication is being checked
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render the app once authentication state is determined
  return <Slot />;
}
