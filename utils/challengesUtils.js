import { user$ } from "../state/stateObservables";
import { supabase } from "../state/supabaseClient";
/**
 * => Challenges gateway to Supabase
 *          fetchChallenges
 *          updateChallengeSettings
 *          fetchChallengeOptions
 */

// Fetch active challenges from Supabase
export async function fetchChallenges() {
  const currentUser = user$.get();
  if (!currentUser || !currentUser.id) {
    console.error(
      "fetchChallenges(): No logged in user found in observable state."
    );
    throw new Error("User not logged in");
  }
  console.log(
    "🔎 fetchChallenges(): fetching active challenges for user_id:",
    currentUser.id
  );

  const { data, error } = await supabase
    .from("challenges_master")
    .select("*")
    .eq("is_active", true)
    .eq("user_id", currentUser.id);

  if (error) {
    console.error("fetchChallenges(): error fetching challenges:", error);
    throw error;
  }

  // Create a concise summary for logging: challenge name, is_default, is_active.
  const summary = data.map((challenge) => ({
    challenge_name: challenge.challenge_name,
    is_default: challenge.is_default,
    is_active: challenge.is_active,
  }));
  console.log("✅ Challenges fetched successfully!", summary);

  return data;
}

// Updates the challenge_master record for a given challenge.
export async function updateChallengeSettings(subscriptionId, settings) {
  const { data, error } = await supabase
    .from("challenges_master")
    .update({ pattern: settings })
    .eq("challenge_id", subscriptionId);
  if (error) {
    console.error("updateChallengeSettings() error:", error);
    throw error;
  }
  console.log(
    "✅ Challenge settings updated successfully for challenge:",
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
