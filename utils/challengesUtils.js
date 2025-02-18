import { computed, observable } from "@legendapp/state";
import { user$ } from "../state/stateObservables";
import { supabase } from "../state/supabaseClient";
/**
 * => Global stores and computed observables
 *          checkedOutChallengesStore$
 *          challengeLibraryStore$
 *          activeChallenges$
 *          availableChallenges$
 * => CRUD operations for managing challenges
 *          fetchCheckedOutChallenges
 *          fetchChallengeLibrary
 *
 *
 *
 * => Challenges gateway to Supabase
 *          fetchActiveChallenges
 *          fetchAvailableChallenges
 *          updateChallengeSettings
 *          fetchChallengeOptions
 *          acceptChallenge
 *          cancelChallenge
 */

// Global store holding the user's checked-out challenges (from challenges_master)
export const checkedOutChallengesStore$ = observable([]);

// Global store holding the entire challenge library (from challenges_options)
export const challengeLibraryStore$ = observable([]);

// Computed observable for active challenges (user's challenges that are not deleted)
export const activeChallenges$ = computed(() => {
  return checkedOutChallengesStore$
    .get()
    .filter((challenge) => !challenge.is_deleted);
});

// Computed observable for available challenges (those in the library that the user hasn't checked out)
export const availableChallenges$ = computed(() => {
  const checkedOut = checkedOutChallengesStore$.get(); // User's checked-out challenges from challenges_master
  return challengeLibraryStore$.get().filter((option) => {
    // Find if there's an active (i.e. not deleted) checked-out challenge that matches this challenge option.
    const activeRecord = checkedOut.find(
      (ch) => ch.challenge_id === option.challenge_id && !ch.is_deleted
    );
    // If there's no active record, then this option is available.
    return !activeRecord;
  });
});

// Fetch all challenge subscriptions (user's checked-out challenges) from challenges_master
export async function fetchCheckedOutChallenges() {
  const currentUser = user$.get();
  if (!currentUser || !currentUser.id) {
    console.error("fetchCheckedOutChallenges(): No logged in user found.");
    throw new Error("User not logged in");
  }

  const { data, error } = await supabase
    .from("challenges_master")
    .select("*, challenges_options(challenge_name)")
    .eq("user_id", currentUser.id);

  if (error) {
    console.error("Error fetching checked-out challenges:", error);
    throw error;
  }

  // Update the global store with the raw data
  checkedOutChallengesStore$.set(data || []);
  return data;
}

// Fetch all challenge options from challenges_options
export async function fetchChallengeLibrary() {
  const { data, error } = await supabase.from("challenges_options").select("*");

  if (error) {
    console.error("Error fetching challenge library:", error);
    throw error;
  }

  // Update the global store with the raw library data
  challengeLibraryStore$.set(data || []);

  return data;
}

// Run both fetch at the same time
export async function refreshAllChallenges() {
  try {
    console.log("🔎 refreshAllChallenges(): Refreshing all challenges...");
    // Fetch and update the checked-out challenges store.
    await fetchCheckedOutChallenges();
    // Fetch and update the challenge library store.
    await fetchChallengeLibrary();
    console.log("✅ All challenges refreshed successfully.");
  } catch (error) {
    console.error("Error refreshing challenges:", error);
    throw error;
  }
}

// Sends settings built by buildSettingsObject to Supabase
export async function updateChallengeSettings(subscriptionId, settings) {
  const { data, error } = await supabase
    .from("challenges_master")
    .update({ pattern: settings })
    .eq("challenge_subscription_id", subscriptionId);
  if (error) {
    console.error("updateChallengeSettings() error:", error);
    throw error;
  }
  console.log(
    "✅ Challenge settings updated successfully for:",
    subscriptionId
  );
  return data;
}

// Fetch challenge specific options for the settings UI
export async function fetchChallengeOptions(challengeId) {
  const { data, error } = await supabase
    .from("challenges_options")
    .select("options")
    .eq("challenge_id", challengeId)
    .single();

  if (error) {
    console.error(
      "fetchChallengeOptions(): Error fetching challenge options:",
      error
    );
    return null;
  }
  return data.options;
}

// Change is_disabled to true
export async function cancelChallenge(subscriptionId) {
  const { data, error } = await supabase
    .from("challenges_master")
    .update({ is_deleted: true })
    .eq("challenge_subscription_id", subscriptionId);
  if (error) {
    console.error("cancelChallenge error:", error);
    throw error;
  }
  return data;
}

// Insert new record into challenges_master table OR enable existing one with overwritten setting preferences
export async function acceptChallenge(challenge, user, pattern) {
  // First, try to fetch an existing challenge subscription for this user and challenge.
  const { data: existing, error: fetchError } = await supabase
    .from("challenges_master")
    .select("*")
    .eq("user_id", user.id)
    .eq("challenge_id", challenge.challenge_id)
    .limit(1)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 might indicate "No rows found"
    console.error("Error checking for existing challenge:", fetchError);
    throw fetchError;
  }

  if (existing) {
    // If a record exists (even if marked as deleted), update it:
    console.log("Existing challenge found. Updating record...");
    const { error: updateError } = await supabase
      .from("challenges_master")
      .update({
        pattern, // update with the new settings
        is_deleted: false, // mark it as active
      })
      .eq("challenge_subscription_id", existing.challenge_subscription_id);
    if (updateError) {
      console.error("Error updating existing challenge:", updateError);
      throw updateError;
    }
    return existing; // Optionally, return the updated record
  } else {
    // No existing record; insert a new one.
    console.log("No existing challenge found. Inserting a new record...");
    const { data, error } = await supabase.from("challenges_master").insert([
      {
        user_id: user.id,
        challenge_id: challenge.challenge_id, // foreign key to challenges_options
        pattern, // use the provided pattern
        is_default: false,
        is_active: true,
        is_deleted: false,
        challenge_end_date: null,
      },
    ]);
    if (error) {
      console.error("Error inserting new challenge subscription:", error);
      throw error;
    }
    return data;
  }
}

// Default Settings Preferences when accepting a new challenge
export const DEFAULT_CHALLENGE_PATTERN = {
  patternType: "fixed",
  fixedDays: {
    Mon: { active: true, startTime: "", endTime: "" },
    Tue: { active: true, startTime: "", endTime: "" },
    Wed: { active: true, startTime: "", endTime: "" },
    Thu: { active: true, startTime: "", endTime: "" },
    Fri: { active: true, startTime: "", endTime: "" },
    Sat: { active: true, startTime: "", endTime: "" },
    Sun: { active: true, startTime: "", endTime: "" },
  },
  genericSettings: { useLocation: false },
  specificSettings: {},
};
