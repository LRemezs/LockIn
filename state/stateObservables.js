import { observable } from "@legendapp/state";
import { formatEventsData } from "../utils/helperUtils";
import { events$, sendNotification } from "../utils/notificationUtils";
import { supabase } from "./supabaseClient";

/**
 * => State Management
 *          user$
 *          loading$
 * => State Supporting Logic
 *          formatEventsData
 *          fetchAndProcessEvents
 */

// Observables for user state
export const user$ = observable({
  id: "",
  name: "",
  email: "",
  loggedIn: false,
});
export const loading$ = observable(true);

// Format event data consistently
export const fetchAndProcessEvents = async () => {
  loading$.set(true);
  try {
    const userId = user$.get()?.id;
    if (!userId) {
      console.warn("⚠️ No user ID found. Skipping event fetch.");
      return;
    }

    console.log("🚀 Fetching user events...");
    const { data, error } = await supabase
      .from("events")
      .select("*, notified")
      .eq("user_id", userId);

    if (error) throw new Error(`❌ Supabase Error: ${error.message}`);
    if (!Array.isArray(data)) throw new Error("❌ Invalid event data format.");

    const now = new Date();
    const today = now.toISOString().split("T")[0]; // YYYY-MM-DD

    let eventsToUpdate = [];

    const processedEvents = data.map((event) => {
      let status = event.event_status;
      const eventStartTime = new Date(`${event.date}T${event.start_time}`);
      const departureTime = Math.round(
        (eventStartTime - now) / (1000 * 60) -
          (event.estimated_travel_time || 0)
      );

      // First, process events that need to be marked as "pending"
      if (
        departureTime <= 0 &&
        status !== "pending" &&
        status !== "completed" &&
        !event.notified
      ) {
        status = "pending";
        eventsToUpdate.push({
          id: event.id,
          event_status: status,
          notified: true,
        });

        sendNotification(
          `❗ Departure time for "${event.title}" on ${event.date} at ${event.start_time} has been missed. Event is marked as Pending on calendar to be processed.`
        );
      }
      // Ensure today's events are marked as "today"
      else if (event.date === today && status === "upcoming") {
        status = "today";
        eventsToUpdate.push({ id: event.id, event_status: status });
        console.log(`📅 Marking "${event.title}" as "today"`);
      }

      return { ...event, event_status: status };
    });

    // ✅ Format and sort events
    events$.set(formatEventsData(processedEvents));

    // ✅ Push updates to Supabase only if necessary
    if (eventsToUpdate.length) {
      console.log(`🚀 Updating ${eventsToUpdate.length} events in Supabase...`);
      await Promise.all(
        eventsToUpdate.map(async (event) =>
          supabase
            .from("events")
            .update({
              event_status: event.event_status,
              notified: event.notified ?? false,
            })
            .eq("id", event.id)
        )
      );
    } else {
      console.log("✅ No event status updates needed.");
    }

    console.log(`✅ Processed ${processedEvents.length} events.`);
  } catch (error) {
    console.error("❌ Error fetching events:", error.message);
  } finally {
    loading$.set(false);
  }
};
