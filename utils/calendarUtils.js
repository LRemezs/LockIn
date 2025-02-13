import * as Location from "expo-location";
import { debounce } from "lodash";
import {
  events$,
  getCachedUserLocation,
  setCachedUserLocation,
} from "../utils/notificationUtils";

// Global tracking state for location tracking logic
let trackingSubscription = null;
let lastUpdatedLocation = null;

let isTravelUpdateInProgress = false;
let lastTravelInfoHash = "";
let isTrackingStarted = false;
let isLocationRequestInProgress = false;

/**
 * Location tracking logic for user's events
 * => Location Functions:
 *          -- getCachedUserLocation
 *          -- setCachedUserLocation
 *          getUserLocation
 * => Google Maps API Fetch
 *         -- getTravelInfo
 *          updateTravelInfoBasedOnTime
 * => Tracking Functions
 *          startLocationTracking
 *          stopLocationTracking
 * => Utility Functions
 *          debouncedUpdateTravelInfo
 */

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
