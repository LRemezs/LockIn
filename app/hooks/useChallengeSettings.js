import { useEffect, useState } from "react";
import {
  challengeLibraryStore$,
  checkedOutChallengesStore$,
  updateChallengeSettings,
} from "../../utils/challengesUtils"; // or your state file

export default function useChallengeSettings(challenge) {
  // Existing state initializations…
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
    (typeof challenge.pattern === "object" && challenge.pattern.segments) || []
  );
  const [useLocation, setUseLocation] = useState(
    (typeof challenge.pattern === "object" &&
      challenge.pattern.genericSettings?.useLocation) ||
      false
  );
  const [favoriteLocations, setFavoriteLocations] = useState(
    (typeof challenge.pattern === "object" &&
      challenge.pattern.genericSettings?.favoriteLocations) ||
      []
  );
  const [specificSettings, setSpecificSettings] = useState(
    (typeof challenge.pattern === "object" &&
      challenge.pattern.specificSettings) ||
      {}
  );
  // For challenge-specific options fetched from the global challenge library
  const [availableOptions, setAvailableOptions] = useState(null);

  // New: Look up available options from the global challenge library based on challenge ID.
  useEffect(() => {
    const library = challengeLibraryStore$.get();
    if (library && Array.isArray(library)) {
      const found = library.find(
        (item) => item.challenge_id === challenge.challenge_id
      );
      if (found && found.options) {
        setAvailableOptions(found.options);
      }
    }
  }, [challenge.challenge_id]);

  // Build the final settings object from state
  const buildSettingsObject = () => ({
    patternType,
    fixedDays: patternType === "fixed" ? fixedDays : undefined,
    segments: patternType === "rolling" ? rollingSegments : undefined,
    genericSettings: { useLocation, favoriteLocations },
    specificSettings,
  });

  // Save settings: update Supabase and optimistically update global state if desired
  const saveSettings = async () => {
    const settings = buildSettingsObject();
    console.log("💾 saveSettings(): Saving settings...", settings);
    if (!challenge.challenge_subscription_id) {
      throw new Error("Challenge subscription ID is missing.");
    }

    // Save previous settings for potential rollback
    const prevSettings = challenge.pattern;

    // Optimistically update the global store for checked-out challenges.
    checkedOutChallengesStore$.set(
      checkedOutChallengesStore$
        .get()
        .map((ch) =>
          ch.challenge_subscription_id === challenge.challenge_subscription_id
            ? { ...ch, pattern: settings }
            : ch
        )
    );

    try {
      const result = await updateChallengeSettings(
        challenge.challenge_subscription_id,
        settings
      );
      return result;
    } catch (error) {
      // Rollback the optimistic update if the API call fails
      checkedOutChallengesStore$.set(
        checkedOutChallengesStore$
          .get()
          .map((ch) =>
            ch.challenge_subscription_id === challenge.challenge_subscription_id
              ? { ...ch, pattern: prevSettings }
              : ch
          )
      );
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
    availableOptions, // now populated from the global challenge library lookup
    saveSettings,
    buildSettingsObject,
  };
}
