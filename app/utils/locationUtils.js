import { GOOGLE_MAPS_API_KEY } from "@env"; // Secure API key in .env file
import * as Location from "expo-location";

// 🔹 Get user's current location (for full background tracking, switch to expo-task-manager in app.json to keep location updates running even when the app is closed.)
export const getUserLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.warn("⚠️ Permission to access location was denied.");
      return null; // Prevents undefined behavior
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High, // ✅ Ensures accurate readings
    });

    if (!location || !location.coords) {
      console.warn("⚠️ Failed to get location, retrying...");
      return null; // ✅ Prevents breaking travel info updates
    }

    return `${location.coords.latitude},${location.coords.longitude}`;
  } catch (error) {
    console.error("❌ Error fetching location:", error.message);
    return null; // ✅ Prevents crashing app if location fails
  }
};

// 🔹 Fetch distance & travel time from Google Maps
export const getTravelInfo = async (latitude, longitude) => {
  try {
    const userLocation = await getUserLocation();

    // ✅ Check if coordinates exist before making API call
    if (!userLocation) {
      console.error("❌ Error: Missing user location.");
      return null;
    }
    if (!latitude || !longitude) {
      console.error("❌ Missing required coordinates for travel info.");
      return null;
    }

    const destination = `${latitude},${longitude}`;
    const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation}&destination=${destination}&mode=driving&departure_time=now&traffic_model=best_guess&key=${GOOGLE_MAPS_API_KEY}`;

    console.log("🚀 Fetching travel info from URL:", apiUrl);

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== "OK") {
      console.error("❌ Google API Error:", data.error_message || data.status);
      return null;
    }

    // ✅ Extract relevant info
    const route = data.routes[0]?.legs[0];
    const distanceMiles = route?.distance?.value / 1609 || 0;
    const travelTime = route?.duration?.text || "N/A";
    const destinationName =
      data.routes[0]?.legs[0]?.end_address || "Unknown Location";

    console.log(
      `📡 Travel Info: Destination: ${destinationName} (${destination}), Distance: ${distanceMiles.toFixed(
        2
      )} miles, Time: ${travelTime}`
    );

    return {
      distance: distanceMiles,
      travelTime,
    };
  } catch (error) {
    console.error("❌ Error fetching travel info:", error);
    return null;
  }
};
