// hooks/useChallengeCatalog.js
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../state/supabaseClient";

export default function useChallengeCatalog() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const refreshCatalog = useCallback(() => {
    setRefreshCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    async function fetchCatalog() {
      setLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) {
        setError(sessionError);
        setLoading(false);
        return;
      }
      if (!session) {
        setError(new Error("User not logged in"));
        setLoading(false);
        return;
      }
      const user = session.user;

      const { data: catalogData, error: catalogError } = await supabase
        .from("challenges_options")
        .select("*");
      if (catalogError) {
        setError(catalogError);
        setLoading(false);
        return;
      }

      const { data: acceptedData, error: acceptedError } = await supabase
        .from("challenges_master")
        .select("challenge_id")
        .eq("user_id", user.id)
        .eq("is_deleted", false);
      if (acceptedError) {
        setError(acceptedError);
        setLoading(false);
        return;
      }
      const acceptedIds = acceptedData.map((row) => row.challenge_id);
      const filteredCatalog = catalogData.filter(
        (challenge) => !acceptedIds.includes(challenge.challenge_id)
      );
      setChallenges(filteredCatalog);
      setLoading(false);
    }
    fetchCatalog();
  }, [refreshCount]);

  return { challenges, loading, error, refreshCatalog };
}
