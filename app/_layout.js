import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "../state/supabaseClient";

// Root layout handling only UI logic
export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth().catch((error) =>
      console.error("❌ Error checking auth state:", error)
    );
  }, []);

  // Show Login Screen if Not Authenticated
  if (isAuthenticated === false) {
    return <Slot />;
  }

  // Show Loading Spinner while Auth State Is Unknown
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  // Show Main App Content after login
  return <Slot />;
}
