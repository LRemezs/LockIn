import { Slot, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { startLocationTracking, user$ } from "../state/state"; // Import Legend-State global user state
import { supabase } from "../state/supabaseClient";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const router = useRouter();

  async function checkUser() {
    const { data, error } = await supabase.auth.getUser();

    if (!data?.user) {
      console.warn("⚠️ No user session found. Redirecting to login.");
      setIsAuthenticated(false);
      return;
    }

    const user = data.user;
    console.log("🟢 User detected in _layout.js:", user);

    // ✅ Fetch profile details from Supabase
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("❌ Error fetching user profile:", profileError.message);
      setIsAuthenticated(false);
      return;
    }

    // ✅ Store full user state in Legend-State
    user$.set({
      id: user.id, // ✅ Ensure user ID is stored
      name: profile.name || "Unknown",
      email: profile.email || "No email",
      loggedIn: true,
    });

    console.log("🟢 Updated user state:", user$.get());
    setIsAuthenticated(true);

    startLocationTracking(); // ✅ Start tracking user location when logged in
  }

  useEffect(() => {
    checkUser(); // ✅ Ensure `user.id` is set at startup

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`🔄 Auth state changed: ${event}`);

        if (session?.user) {
          checkUser(); // ✅ Re-run checkUser() on login
        } else {
          user$.set({ id: "", name: "", email: "", loggedIn: false }); // ✅ Clear state on logout
          setIsAuthenticated(false);
          router.push("/login");
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
