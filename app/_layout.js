import { Slot, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { stopTravelUpdateChecker } from "../state/state";
import { supabase } from "../state/supabaseClient";
import {
  getCachedUserLocation,
  getUserLocation,
  startLocationTracking,
  user$,
} from "../utils/calendarUtils";
import { events$ } from "../utils/notificationUtils";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [locationReady, setLocationReady] = useState(false);
  const [trackingStarted, setTrackingStarted] = useState(false); // ✅ Ensure tracking only starts once

  const router = useRouter();
  const authListenerRef = useRef(null);

  // ✅ Check User Authentication & Fetch Profile
  async function checkUser(skipLog = false) {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      if (!skipLog)
        console.warn("⚠️ No active user session. Waiting for login...");
      setIsAuthenticated(false);
      return;
    }

    const user = data.user;
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
  }

  // ✅ Monitor Authentication State & Handle Login/Logout
  useEffect(() => {
    checkUser(true);

    if (!authListenerRef.current) {
      const { data: subscription } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === "INITIAL_SESSION") return;

          console.log(`🔄 Auth state changed: ${event}`);

          if (session?.user) {
            setIsAuthenticated(true);
          } else {
            console.log("🚪 User logged out, clearing state.");
            user$.set({ id: "", name: "", email: "", loggedIn: false });

            stopTravelUpdateChecker(); // ✅ Stop checking travel updates on logout

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

  // ✅ Ensure Only ONE Location Request Happens & Handle Retries
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log("✅ User authenticated. Initializing setup...");

    const location = getCachedUserLocation();
    if (location) {
      console.log(`📍 Using cached location: "${location}".`);
      setLocationReady(true);
      if (!trackingStarted) {
        setTrackingStarted(true);
        startLocationTracking();
      }
    } else {
      console.log("📍 No cached location. Requesting user location...");
      getUserLocation()
        .then((newLocation) => {
          if (newLocation) {
            console.log(`📍 Location obtained: "${newLocation}"`);
            setLocationReady(true);
            if (!trackingStarted) {
              setTrackingStarted(true);
              startLocationTracking();
            }
          } else {
            console.warn("⚠️ Could not obtain initial location.");
          }
        })
        .catch((err) => console.error("❌ Error fetching location:", err));
    }
  }, [isAuthenticated]);

  // ✅ Handle Notifications AFTER Location is Ready
  useEffect(() => {
    if (!isAuthenticated || !locationReady) return;

    console.log("🔔 Location ready. Fetching events...");

    const waitForEvents = setInterval(() => {
      if (events$.get().length > 0) {
        console.log("🔔 Events loaded");
        clearInterval(waitForEvents);
      }
    }, 500);

    return () => clearInterval(waitForEvents);
  }, [isAuthenticated, locationReady]);

  // ✅ Show Login Screen If Not Authenticated
  if (isAuthenticated === false) {
    return <Slot />;
  }

  // ✅ Show Loading If Auth State Is Unknown
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}
