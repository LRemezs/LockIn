import { observable } from "@legendapp/state";
import { addTravelTime } from "../utils/helperUtils";
import {
  events$,
  getTravelInfo,
  scheduleEventNotifications,
  sendNotification,
} from "../utils/notificationUtils";
import { supabase } from "./supabaseClient";

/**
 * => State Management
 *          user$
 *          loading$
 *          challengesStore$
 * => State Supporting Logic
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

export const challengesStore$ = observable({
  challenges: [],
  loading: false,
  error: null,
});

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
    let travelInfoPromises = [];

    // Process each event and prepare travel info requests
    const processedEvents = data.map((event) => {
      let status = event.event_status;
      const eventStartTime = new Date(`${event.date}T${event.start_time}`);
      const departureTime = Math.round(
        (eventStartTime - now) / (1000 * 60) -
          (event.estimated_travel_time || 0)
      );

      // Handle missed events
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
          `❗ Missed departure: "${event.title}". Marked as Pending.`
        );
      }

      // Handle today's events
      if (event.date === today && status === "upcoming") {
        status = "today";
        eventsToUpdate.push({ id: event.id, event_status: status });
        console.log(`📅 Marking "${event.title}" as "today"`);
      }

      // Prepare to fetch travel info if required
      if (event.track_location && event.latitude && event.longitude) {
        travelInfoPromises.push(
          getTravelInfo(event).then((travelData) => ({
            id: event.id,
            travelData,
          }))
        );
      }

      return { ...event, event_status: status };
    });

    // Fetch all travel info requests in parallel
    const travelInfoResults = await Promise.all(travelInfoPromises);

    // Attach travel info to events
    const eventsWithTravelInfo = processedEvents.map((event) => {
      const match = travelInfoResults.find((res) => res.id === event.id);
      if (match && match.travelData) {
        return {
          ...event,
          distance: match.travelData.distance,
          estimated_travel_time: match.travelData.estimated_travel_time,
          time_until_departure: match.travelData.time_until_departure,
        };
      }
      return event;
    });

    // Update events observable
    events$.set(addTravelTime(eventsWithTravelInfo));

    // Push updates to Supabase only if necessary
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

    console.log("🔄 Scheduling notifications after event fetch...");
    scheduleEventNotifications();
  } catch (error) {
    console.error("❌ Error fetching events:", error.message);
  } finally {
    loading$.set(false);
  }
};
