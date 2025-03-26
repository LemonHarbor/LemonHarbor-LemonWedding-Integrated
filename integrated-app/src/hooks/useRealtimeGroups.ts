import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

// Hook for real-time group updates
export function useRealtimeGroups(initialGroups: any[] = []) {
  const [groups, setGroups] = useState<any[]>(initialGroups);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial data
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("guest_groups")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setGroups(data || []);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching groups:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();

    // Set up real-time subscription
    const subscription = supabase
      .channel("groups-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guest_groups" },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          // Handle different event types
          if (eventType === "INSERT") {
            setGroups((prev) => [newRecord, ...prev]);
            toast({
              title: "New Group Added",
              description: `Group "${newRecord.name}" has been added.`,
            });
          } else if (eventType === "UPDATE") {
            setGroups((prev) =>
              prev.map((group) =>
                group.id === newRecord.id ? newRecord : group,
              ),
            );
            toast({
              title: "Group Updated",
              description: `Group "${newRecord.name}" has been updated.`,
            });
          } else if (eventType === "DELETE") {
            setGroups((prev) =>
              prev.filter((group) => group.id !== oldRecord.id),
            );
            toast({
              title: "Group Removed",
              description: `Group "${oldRecord.name}" has been removed.`,
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

  return { groups, loading, error };
}
