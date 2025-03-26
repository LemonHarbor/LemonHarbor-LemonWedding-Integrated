import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

// Hook for real-time guest updates
export function useRealtimeGuests(initialGuests: any[] = []) {
  const [guests, setGuests] = useState<any[]>(initialGuests);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial data
    const fetchGuests = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("guests")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setGuests(data || []);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching guests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();

    // Set up real-time subscription
    const subscription = supabase
      .channel("guests-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guests" },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          // Handle different event types
          if (eventType === "INSERT") {
            setGuests((prev) => [newRecord, ...prev]);
            toast({
              title: "New Guest Added",
              description: `${newRecord.name} has been added to the guest list.`,
            });
          } else if (eventType === "UPDATE") {
            setGuests((prev) =>
              prev.map((guest) =>
                guest.id === newRecord.id ? newRecord : guest,
              ),
            );
            toast({
              title: "Guest Updated",
              description: `${newRecord.name}'s information has been updated.`,
            });
          } else if (eventType === "DELETE") {
            setGuests((prev) =>
              prev.filter((guest) => guest.id !== oldRecord.id),
            );
            toast({
              title: "Guest Removed",
              description: `${oldRecord.name} has been removed from the guest list.`,
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

  return { guests, loading, error };
}

// Hook for real-time table updates
export function useRealtimeTables(initialTables: any[] = []) {
  const [tables, setTables] = useState<any[]>(initialTables);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial data
    const fetchTables = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("tables")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTables(data || []);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching tables:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();

    // Set up real-time subscription
    const subscription = supabase
      .channel("tables-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tables" },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          // Handle different event types
          if (eventType === "INSERT") {
            setTables((prev) => [newRecord, ...prev]);
            // Only show toast for user-initiated actions, not for initial data load
            if (prev.length > 0) {
              toast({
                title: "New Table Added",
                description: `Table "${newRecord.name}" has been added.`,
              });
            }
          } else if (eventType === "UPDATE") {
            setTables((prev) =>
              prev.map((table) =>
                table.id === newRecord.id ? newRecord : table,
              ),
            );
            // Don't show toast for position updates to reduce notification spam
            const isPositionUpdate =
              oldRecord &&
              newRecord &&
              JSON.stringify(oldRecord.position) !==
                JSON.stringify(newRecord.position);

            if (!isPositionUpdate) {
              toast({
                title: "Table Updated",
                description: `Table "${newRecord.name}" has been updated.`,
              });
            }
          } else if (eventType === "DELETE") {
            setTables((prev) =>
              prev.filter((table) => table.id !== oldRecord.id),
            );
            toast({
              title: "Table Removed",
              description: `Table "${oldRecord.name}" has been removed.`,
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

  return { tables, loading, error };
}

// Hook for real-time seat assignments
export function useRealtimeSeats(tableId?: string) {
  const [seats, setSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial data
    const fetchSeats = async () => {
      try {
        setLoading(true);
        let query = supabase.from("seats").select("*");

        if (tableId) {
          query = query.eq("table_id", tableId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setSeats(data || []);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching seats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();

    // Set up real-time subscription
    const subscription = supabase
      .channel("seats-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "seats" },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          // Only process updates for the specified table if tableId is provided
          if (tableId && newRecord && newRecord.table_id !== tableId) {
            return;
          }

          // Handle different event types
          if (eventType === "INSERT") {
            setSeats((prev) => [...prev, newRecord]);
          } else if (eventType === "UPDATE") {
            setSeats((prev) =>
              prev.map((seat) => (seat.id === newRecord.id ? newRecord : seat)),
            );

            // Show toast only when a guest is assigned or removed
            if (
              oldRecord &&
              newRecord &&
              oldRecord.guest_id !== newRecord.guest_id
            ) {
              if (newRecord.guest_id) {
                toast({
                  title: "Guest Seated",
                  description: `A guest has been assigned to a seat.`,
                });
              } else if (oldRecord.guest_id) {
                toast({
                  title: "Guest Removed from Seat",
                  description: `A guest has been removed from their seat.`,
                });
              }
            }
          } else if (eventType === "DELETE") {
            setSeats((prev) => prev.filter((seat) => seat.id !== oldRecord.id));
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [tableId, toast]);

  return { seats, loading, error };
}

// Hook for real-time RSVP status updates
export function useRealTimeRSVPStats() {
  const [stats, setStats] = useState({
    confirmed: 0,
    pending: 0,
    declined: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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

    // Set up realtime subscription
    const channel = supabase
      .channel("rsvp-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guests" },
        () => {
          // Refetch stats when any change happens to guests table
          fetchStats();
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { stats, loading, error };
}
