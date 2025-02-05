import { GOOGLE_MAPS_API_KEY } from "@env"; // Secure API key in .env file
import * as Location from "expo-location";

// 🔹 Get user's current location
export const getUserLocation = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permission to access location was denied");
      return null;
    }

    let location = await Location.getCurrentPositionAsync({});
    return `${location.coords.latitude},${location.coords.longitude}`;
  } catch (error) {
    console.error("Error fetching user location:", error);
    return null;
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
    const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation}&destination=${destination}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;

    console.log("🚀 Fetching travel info from URL:", apiUrl);

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== "OK") {
      console.error("❌ Google API Error:", data.error_message || data.status);
      return null;
    }

    return {
      distance: data.routes[0].legs[0].distance.value / 1609, // ✅ Convert meters to miles
      travelTime: data.routes[0].legs[0].duration.text,
    };
  } catch (error) {
    console.error("❌ Error fetching travel info:", error);
    return null;
  }
};
