import { GOOGLE_MAPS_API_KEY } from "@env";
import * as Location from "expo-location";
import { debounce } from "lodash";
import { events$ } from "../utils/notificationUtils";

// Global tracking state for location tracking logic
let trackingSubscription = null;
let lastUpdatedLocation = null;
let cachedUserLocation = null;
let isTravelUpdateInProgress = false;
let lastTravelInfoHash = "";
let isTrackingStarted = false;
let isLocationRequestInProgress = false;

/**
 * Location tracking logic for user's events
 * => Location Functions:
 *          getCachedUserLocation
 *          setCachedUserLocation
 *          getUserLocation
 * => Google Maps API Fetch
 *          getTravelInfo
 *          updateTravelInfoBasedOnTime
 * => Tracking Functions
 *          startLocationTracking
 *          stopLocationTracking
 * => Utility Functions
 *          debouncedUpdateTravelInfo
 */

// Get cached location
export const getCachedUserLocation = () => cachedUserLocation;

//  Set cached location
export const setCachedUserLocation = (location) => {
  cachedUserLocation = location;
};

// Get the user's current location
export const getUserLocation = async () => {
  if (getCachedUserLocation()) {
    return getCachedUserLocation();
  }

  if (isLocationRequestInProgress) {
    console.warn("⚠️ Location request already in progress. Skipping.");
    return null;
  }

  isLocationRequestInProgress = true;
  console.log("📍 Requesting location...");

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.warn("⚠️ Location access denied.");
    isLocationRequestInProgress = false;
    return null;
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  isLocationRequestInProgress = false; // ✅ Reset flag

  if (!location?.coords) return null;

  const newLocation = `${location.coords.latitude},${location.coords.longitude}`;
  setCachedUserLocation(newLocation);
  console.log(`📍 User location received: "${newLocation}"`);
  return newLocation;
};
// Fetch travel info from Google Maps API
export const getTravelInfo = async (event) => {
  try {
    if (!event?.latitude || !event?.longitude) {
      console.error(
        `❌ Error: Missing coordinates for event "${
          event?.title || "Unknown"
        }".`
      );
      return null;
    }

    let userLocation = getCachedUserLocation();
    if (!userLocation) {
      console.warn("⚠️ Cannot fetch travel info: No location available.");
      return null;
    }

    const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation}&destination=${event.latitude},${event.longitude}&mode=driving&departure_time=now&traffic_model=best_guess&key=${GOOGLE_MAPS_API_KEY}`;

    console.log(
      `🚀 Fetching travel info for event "${event.title}" from Google Maps...`
    );
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== "OK") {
      console.error(
        `❌ Google API Error for "${event.title}":`,
        data.error_message || data.status
      );
      return null;
    }

    const route = data.routes[0]?.legs[0];
    if (!route) {
      console.error(
        `❌ Error: No valid route found for event "${event.title}".`
      );
      return null;
    }

    // Convert meters to miles (1 mile = 1609.34 meters)
    const distanceMiles = route?.distance?.value
      ? route.distance.value / 1609.34
      : 0;
    const estimatedTravelTime = route?.duration?.value
      ? Math.round(route.duration.value / 60)
      : 0;

    // Calculate time left until departure
    const eventStartTime = new Date(`${event.date}T${event.start_time}`);
    const currentTime = new Date();
    const timeUntilDeparture =
      Math.round((eventStartTime - currentTime) / (1000 * 60)) -
      estimatedTravelTime;

    console.log(
      `📡 Travel info received for "${event.title}": ` +
        `Distance - ${distanceMiles.toFixed(1)} miles, ` +
        `ETA - ${estimatedTravelTime} min, ` +
        `Time until departure - ${timeUntilDeparture} min`
    );

    return {
      distance: distanceMiles,
      estimated_travel_time: estimatedTravelTime,
      time_until_departure: timeUntilDeparture,
    };
  } catch (error) {
    console.error(
      `❌ Error fetching travel info for "${event?.title || "Unknown"}":`,
      error
    );
    return null;
  }
};

// Check if travel info needs updating and update it.
export const updateTravelInfoBasedOnTime = async () => {
  if (isTravelUpdateInProgress) {
    console.warn("⚠️ Travel update already in progress. Skipping.");
    return;
  }

  isTravelUpdateInProgress = true;
  console.log(`🔄 Checking travel info... (Triggered by: ${triggeredBy})`);

  let currentLocation = getCachedUserLocation();
  if (!currentLocation) {
    console.warn("⚠️ No location available, skipping travel update.");
    isTravelUpdateInProgress = false;
    return;
  }

  const eventsToUpdate = events$
    .get()
    .filter(
      (event) => event.track_location && event.latitude && event.longitude
    );

  if (!eventsToUpdate.length) {
    console.log("⚠️ No events require travel info updates.");
    isTravelUpdateInProgress = false;
    return;
  }

  const updatedEvents = await Promise.all(
    eventsToUpdate.map(async (event) => {
      const travelData = await getTravelInfo(event);
      return travelData ? { ...event, ...travelData } : event;
    })
  );

  const newTravelInfoHash = JSON.stringify(updatedEvents);
  if (newTravelInfoHash === lastTravelInfoHash) {
    console.log("✅ Travel info unchanged. Skipping notification update.");
    isTravelUpdateInProgress = false;
    return;
  }

  lastTravelInfoHash = newTravelInfoHash;
  events$.set(updatedEvents);
  console.log("✅ Travel info updated.");

  isTravelUpdateInProgress = false;
};

// Start tracking the user's location.
export const startLocationTracking = async () => {
  if (isTrackingStarted) {
    console.log("⚠️ Location tracking already started. Skipping.");
    return;
  }

  let initialLocation = getCachedUserLocation();
  if (!initialLocation) {
    console.warn("⚠️ Cannot start tracking: No location available.");
    return;
  }

  console.log("🚀 Starting location tracking...");
  isTrackingStarted = true;

  let lastUpdateTimestamp = Date.now();

  trackingSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5 * 60 * 1000, // Check every 5 minutes
      distanceInterval: 100, // Only update if moved >100m
    },
    (position) => {
      const newLocation = `${position.coords.latitude},${position.coords.longitude}`;

      if (newLocation !== lastUpdatedLocation) {
        console.log("📍 Significant location change detected:", newLocation);
        setCachedUserLocation(newLocation);
        lastUpdatedLocation = newLocation;

        // Only update travel info if the last update was 2+ minutes ago
        if (Date.now() - lastUpdateTimestamp > 120000) {
          debouncedUpdateTravelInfo();
          lastUpdateTimestamp = Date.now();
        }
      }
    }
  );
};

// Stop tracking user location.
export const stopLocationTracking = () => {
  if (trackingSubscription) {
    trackingSubscription.remove();
    trackingSubscription = null;
    console.log("🛑 Stopped location tracking.");
  }
};

// Debounced function to update travel info when user movement stops.
const debouncedUpdateTravelInfo = debounce(updateTravelInfoBasedOnTime, 10000); // ✅ Reduce API spam
