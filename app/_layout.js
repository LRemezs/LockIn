import { Slot, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { startLocationTracking, user$ } from "../state/state";
import { supabase } from "../state/supabaseClient";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const router = useRouter();
  const authListenerRef = useRef(null);

  async function checkUser(skipLog = false) {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      if (!skipLog)
        console.warn("⚠️ No active user session. Waiting for login...");
      setIsAuthenticated(false);
      return;
    }

    if (!data?.user) {
      if (!skipLog)
        console.warn("⚠️ No user session found. Redirecting to login.");
      setIsAuthenticated(false);
      return;
    }

    const user = data.user;
    console.log("🟢 User detected in _layout.js:", user);

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

    user$.set({
      id: user.id,
      name: profile.name || "Unknown",
      email: profile.email || "No email",
      loggedIn: true,
    });

    console.log("🟢 Updated user state:", user$.get());
    setIsAuthenticated(true);

    startLocationTracking(); // ✅ Start tracking location on login
  }

  useEffect(() => {
    checkUser(true);

    if (!authListenerRef.current) {
      const { data: subscription } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === "INITIAL_SESSION") return; // ✅ Skip duplicate handling

          console.log(`🔄 Auth state changed: ${event}`);

          if (session?.user) {
            setIsAuthenticated(true);
          } else {
            console.log("🚪 User logged out, clearing state.");
            user$.set({ id: "", name: "", email: "", loggedIn: false });
            setIsAuthenticated(false);
            router.push("/login");
          }
        }
      );

      authListenerRef.current = subscription;
    }

    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe?.();
        authListenerRef.current = null;
      }
    };
  }, []);

  // ✅ Show login UI immediately if user is not authenticated
  if (isAuthenticated === false) {
    return <Slot />;
  }

  // ✅ Show loading only when authentication state is unknown
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}
