import { Slot, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { user$ } from "../state/state"; // Import Legend-State global user state
import { supabase } from "../state/supabaseClient";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      // Get the current session from Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch user profile from Supabase
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("name, email")
          .eq("id", user.id)
          .single();

        if (!error) {
          user$.set({
            name: profile.name,
            email: profile.email,
            loggedIn: true,
          });
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    }

    checkUser();

    // Listen for authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
          checkUser();
          if (!session) router.push("/login"); // Redirect to login if user logs out
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
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
