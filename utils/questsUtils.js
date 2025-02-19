import { computed, observable } from "@legendapp/state";
import { user$ } from "../state/stateObservables";
import { supabase } from "../state/supabaseClient";

// Global store for all quests
export const questsStore$ = observable([]);

// Filter out only those quests for SideQuests (challenge_id for SideQuests)
export const sideQuests$ = computed(() => {
  return questsStore$
    .get()
    .filter((q) => q.challenge_id === "b5ae2763-4ddc-470b-bb9b-b34fcbec2855");
});

// From the side quests, compute incomplete quests (e.g. not complete)
export const incompleteSideQuests$ = computed(() => {
  return sideQuests$.get().filter((q) => q.status !== "complete");
});

// Compute history as the last 20 completed side quests
export const completeSideQuests$ = computed(() => {
  const completed = sideQuests$.get().filter((q) => q.status === "complete");
  return completed.slice(-20);
});

// Refresh Global State
export async function refreshAllQuests() {
  console.log("🔎 refreshAllQuests(): Initializing quests...");
  // Replace this with your actual Supabase fetch logic.
  const { data, error } = await supabase.from("quests_master").select("*");
  if (error) {
    console.error("Error fetching quests:", error);
    throw error;
  }
  questsStore$.set(data || []);
  console.log("✅ refreshAllQuests(): Quests loaded!");
}

// CANCEL QUEST
export async function cancelQuest(quest_id) {
  console.log(
    `🗑️ cancelQuest(): Starting cancellation for quest ID: ${quest_id}`
  );
  // Confirm deletion (in your UI you can also perform a confirmation prompt)
  // For this function, we'll assume that the user already confirmed.
  const { data, error } = await supabase
    .from("quests_master")
    .delete()
    .eq("quest_id", quest_id);

  if (error) {
    console.error("cancelQuest(): Error cancelling quest:", error);
    throw error;
  }

  // Refresh the global quests store after deletion
  await refreshAllQuests();
  console.log(`✅ cancelQuest(): Successfully cancelled quest ID: ${quest_id}`);
  return data;
}

// EDIT QUEST
export async function editQuest(quest_id, newData) {
  console.log(`📝 editQuest(): Starting edit for quest ID: ${quest_id}`);
  // newData should contain the fields to update, e.g. title, duration, location, etc.
  const { data, error } = await supabase
    .from("quests_master")
    .update(newData)
    .eq("quest_id", quest_id);

  if (error) {
    console.error("editQuest(): Error editing quest:", error);
    throw error;
  }

  // Refresh the global quests store after updating
  await refreshAllQuests();
  console.log(`✅ editQuest(): Successfully edited quest ID: ${quest_id}`);
  return data;
}

// START QUEST
export async function startQuest(quest_id) {
  console.log(`▶️ startQuest(): Starting quest for quest ID: ${quest_id}`);
  const { data, error } = await supabase
    .from("quests_master")
    .update({ status: "active" })
    .eq("quest_id", quest_id);

  console.log("startQuest() update result:", { data, error });

  if (error) {
    console.error("startQuest(): Error starting quest:", error);
    throw error;
  }

  await refreshAllQuests();
  console.log(`✅ startQuest(): Quest ID: ${quest_id} status set to active`);
  return data;
}

// ADD SIDEQUEST
const sideQuestChallengeId = "b5ae2763-4ddc-470b-bb9b-b34fcbec2855";

export async function addSideQuest(newQuestData) {
  // Retrieve the current user id from the global state
  const currentUser = user$.get();
  if (!currentUser || !currentUser.id) {
    throw new Error("User not logged in.");
  }

  // Set user_id and challenge_id in newQuestData
  newQuestData.user_id = currentUser.id;
  newQuestData.challenge_id = sideQuestChallengeId;

  console.log("📝 addQuest(): Starting to add a new quest...");

  const { data, error } = await supabase
    .from("quests_master")
    .insert([newQuestData]);

  if (error) {
    console.error("addQuest(): Error adding quest:", error);
    throw error;
  }
  console.log("✅ addQuest(): Quest added successfully.");
  await refreshAllQuests();
  return data;
}

// Marks quest as completed
export async function completeQuest(quest_id) {
  console.log(`💾 completeQuest(): Marking quest ${quest_id} as complete...`);
  const { data, error } = await supabase
    .from("quests_master")
    .update({ status: "complete" })
    .eq("quest_id", quest_id);
  if (error) {
    console.error("completeQuest(): Error marking quest as complete:", error);
    throw error;
  }
  await refreshAllQuests();
  console.log(`✅ completeQuest(): Quest ${quest_id} marked as complete!"`);
  return data;
}
