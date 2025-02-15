// hooks/useChallengeSettings.js
import { useEffect, useState } from "react";
import { challengesStore$ } from "../../state/stateObservables";
import {
  fetchChallengeOptions,
  updateChallengeSettings,
} from "../../utils/challengesUtils";

// This helper wraps a promise and logs "Waiting for update to complete..." every 5 seconds.
function updateWithLogging(promise) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      console.log("Waiting for update to complete...");
    }, 5000);

    promise
      .then((res) => {
        clearInterval(interval);
        resolve(res);
      })
      .catch((err) => {
        clearInterval(interval);
        reject(err);
      });
  });
}

export default function useChallengeSettings(challenge) {
  // Initialize generic settings to include useLocation and favoriteLocations.
  const initialGenericSettings = (typeof challenge.pattern === "object" &&
    challenge.pattern.genericSettings) || {
    useLocation: false,
    favoriteLocations: [],
  };

  const [patternType, setPatternType] = useState(
    (typeof challenge.pattern === "object" && challenge.pattern.patternType) ||
      "fixed"
  );

  const [fixedDays, setFixedDays] = useState(
    (typeof challenge.pattern === "object" && challenge.pattern.fixedDays) || {
      Mon: { active: false, startTime: "", endTime: "" },
      Tue: { active: false, startTime: "", endTime: "" },
      Wed: { active: false, startTime: "", endTime: "" },
      Thu: { active: false, startTime: "", endTime: "" },
      Fri: { active: false, startTime: "", endTime: "" },
      Sat: { active: false, startTime: "", endTime: "" },
      Sun: { active: false, startTime: "", endTime: "" },
    }
  );

  const [rollingSegments, setRollingSegments] = useState(
    (typeof challenge.pattern === "object" && challenge.pattern.segments) || [
      { type: "active", days: 2, startTime: "09:00", endTime: "" },
      { type: "active", days: 2, startTime: "17:00", endTime: "" },
      { type: "rest", days: 2 },
    ]
  );

  const [useLocation, setUseLocation] = useState(
    initialGenericSettings.useLocation
  );
  // New state for favoriteLocations.
  const [favoriteLocations, setFavoriteLocations] = useState(
    initialGenericSettings.favoriteLocations || []
  );

  const [specificSettings, setSpecificSettings] = useState(
    (typeof challenge.pattern === "object" &&
      challenge.pattern.specificSettings) ||
      {}
  );
  const [availableOptions, setAvailableOptions] = useState(null);

  useEffect(() => {
    async function loadOptions() {
      const options = await fetchChallengeOptions(challenge.challenge_id);
      setAvailableOptions(options);
      if (options && Object.keys(specificSettings).length === 0) {
        const defaults = {};
        Object.entries(options).forEach(([key, option]) => {
          defaults[key] = option.default;
        });
        console.log("Pre-filling specificSettings with defaults:", defaults);
        setSpecificSettings(defaults);
      }
    }
    loadOptions();
  }, [challenge.challenge_id]);

  // Build the final settings object. Only include favoriteLocations if useLocation is true.
  const buildSettingsObject = () => {
    const genericSettings = { useLocation };
    if (useLocation) {
      genericSettings.favoriteLocations = favoriteLocations;
    }
    const baseSettings =
      patternType === "fixed"
        ? { patternType, fixedDays, genericSettings }
        : { patternType, segments: rollingSegments, genericSettings };
    return { ...baseSettings, specificSettings };
  };

  const saveSettings = async () => {
    console.log(
      "💾 saveSettings(): Saving user preferences for current challenge..."
    );
    const settings = buildSettingsObject();
    // Now use challenge_subscription_id (the new primary key) to update the record.
    if (!challenge.challenge_subscription_id) {
      throw new Error("Challenge subscription ID is missing.");
    }
    const prevSettings = challenge.pattern;
    // Optimistically update the global observable using .set()
    challengesStore$.set((prevState) => ({
      ...prevState,
      challenges: prevState.challenges.map((ch) =>
        ch.challenge_subscription_id === challenge.challenge_subscription_id
          ? { ...ch, pattern: settings }
          : ch
      ),
    }));
    try {
      const result = await updateWithLogging(
        updateChallengeSettings(challenge.challenge_subscription_id, settings)
      );
      return result;
    } catch (error) {
      challengesStore$.set((prevState) => ({
        ...prevState,
        challenges: prevState.challenges.map((ch) =>
          ch.challenge_subscription_id === challenge.challenge_subscription_id
            ? { ...ch, pattern: prevSettings }
            : ch
        ),
      }));
      throw error;
    }
  };

  return {
    patternType,
    setPatternType,
    fixedDays,
    setFixedDays,
    rollingSegments,
    setRollingSegments,
    useLocation,
    setUseLocation,
    favoriteLocations,
    setFavoriteLocations,
    specificSettings,
    setSpecificSettings,
    availableOptions,
    saveSettings,
    buildSettingsObject,
  };
}
