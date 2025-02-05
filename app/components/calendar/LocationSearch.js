import { GOOGLE_MAPS_API_KEY } from "@env";
import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

export default function LocationSearch({ onLocationSelect, defaultValue }) {
  const locationRef = useRef(null);

  useEffect(() => {
    if (locationRef.current && defaultValue) {
      locationRef.current.setAddressText(defaultValue); // ✅ Set default address
    }
  }, [defaultValue]); // ✅ Runs when defaultValue updates

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        ref={locationRef} // ✅ Attach ref to manually update input field
        placeholder="Search for location"
        fetchDetails
        onPress={(data, details = null) => {
          if (details) {
            const { lat, lng } = details.geometry.location;
            onLocationSelect({
              address: data.description,
              latitude: lat,
              longitude: lng,
            });
          }
        }}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: "en",
        }}
        styles={{
          textInputContainer: styles.textInputContainer,
          textInput: styles.textInput,
          listView: styles.listView,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 10,
    zIndex: 10,
  },
  textInputContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    zIndex: 12,
    paddingBottom: 10,
  },
  textInput: {
    height: 40,
    paddingHorizontal: 10,
  },
  listView: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    zIndex: 15,
    maxHeight: 150,
  },
});
