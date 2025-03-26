import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

// Hook for real-time RSVP status updates
export function useRealTimeRSVP() {
  const [stats, setStats] = useState({
    confirmed: 0,
    pending: 0,
    declined: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial stats
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("guests")
          .select("rsvp_status");

        if (error) throw error;

        // Calculate stats
        const confirmed = data.filter(
          (g) => g.rsvp_status === "confirmed",
        ).length;
        const pending = data.filter((g) => g.rsvp_status === "pending").length;
        const declined = data.filter(
          (g) => g.rsvp_status === "declined",
        ).length;

        setStats({
          confirmed,
          pending,
          declined,
          total: data.length,
        });
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching RSVP stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up real-time subscription
    const subscription = supabase
      .channel("rsvp-status-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guests" },
        (payload) => {
          // When any change happens to guests table, refetch stats
          fetchStats();

          // Show toast notification for RSVP status changes
          if (
            payload.eventType === "UPDATE" &&
            payload.old &&
            payload.new &&
            payload.old.rsvp_status !== payload.new.rsvp_status
          ) {
            toast({
              title: "RSVP Status Updated",
              description: `A guest has changed their RSVP status to ${payload.new.rsvp_status}`,
            });
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  return { stats, loading, error };
}
