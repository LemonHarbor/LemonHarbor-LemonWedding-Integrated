import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { GuestRelationship } from "@/types/relationship";

// Hook for real-time relationship updates
export function useRealtimeRelationships(guestId?: string) {
  const [relationships, setRelationships] = useState<GuestRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial data
    const fetchRelationships = async () => {
      try {
        setLoading(true);
        let query = supabase.from("guest_relationships").select("*");

        if (guestId) {
          query = query.or(
            `guest_id.eq.${guestId},related_guest_id.eq.${guestId}`,
          );
        }

        const { data, error } = await query;

        if (error) throw error;
        setRelationships(data || []);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching relationships:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelationships();

    // Set up real-time subscription
    const subscription = supabase
      .channel("relationships-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guest_relationships" },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          // Only process updates for the specified guest if guestId is provided
          if (
            guestId &&
            newRecord &&
            newRecord.guest_id !== guestId &&
            newRecord.related_guest_id !== guestId
          ) {
            return;
          }

          // Handle different event types
          if (eventType === "INSERT") {
            setRelationships((prev) => [...prev, newRecord]);
            toast({
              title: "New Relationship Added",
              description: `A new guest relationship has been created.`,
            });
          } else if (eventType === "UPDATE") {
            setRelationships((prev) =>
              prev.map((rel) => (rel.id === newRecord.id ? newRecord : rel)),
            );
            toast({
              title: "Relationship Updated",
              description: `A guest relationship has been updated.`,
            });
          } else if (eventType === "DELETE") {
            setRelationships((prev) =>
              prev.filter((rel) => rel.id !== oldRecord.id),
            );
            toast({
              title: "Relationship Removed",
              description: `A guest relationship has been removed.`,
            });
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [guestId, toast]);

  return { relationships, loading, error };
}
