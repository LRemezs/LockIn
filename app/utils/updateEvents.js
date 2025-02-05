import { events$ } from "../../state/state";
import { supabase } from "../../state/supabaseClient";
import { getTravelInfo } from "./locationUtils";

// 🔹 Update travel info for all tracked events
export const updateEventTravelInfo = async () => {
  try {
    let { data: events, error } = await supabase
      .from("events")
      .select("id, location")
      .eq("track_location", true); // Only fetch events that require tracking

    if (error) throw error;

    for (const event of events) {
      if (!event.location) continue;

      const travelInfo = await getTravelInfo(event.location);
      if (travelInfo) {
        await supabase
          .from("events")
          .update({
            distance: travelInfo.distance,
            travel_time: travelInfo.travelTime,
          })
          .eq("id", event.id);

        events$.set((prevEvents) => {
          const updatedEvents = { ...prevEvents };
          if (!updatedEvents[event.date]) updatedEvents[event.date] = [];

          updatedEvents[event.date] = updatedEvents[event.date].map((e) =>
            e.id === event.id ? { ...e, ...travelInfo } : e
          );

          return updatedEvents;
        });
      }
    }
  } catch (error) {
    console.error("Error updating travel info:", error);
  }
};

// 🔹 Run updates every 5 minutes
setInterval(updateEventTravelInfo, 300000); // 5 minutes
