import { useState, useEffect } from "react";
import {
  realtimeManager,
  RealtimeGuest,
  RealtimeTable,
  RealtimeSeat,
} from "@/lib/realtime";
import { supabase } from "@/lib/supabase";

// Hook for guests realtime updates
export function useRealtimeGuests(initialGuests: RealtimeGuest[] = []) {
  const [guests, setGuests] = useState<RealtimeGuest[]>(initialGuests);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
        setGuests(data as RealtimeGuest[]);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching guests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();

    // Subscribe to realtime updates
    const unsubscribe = realtimeManager.subscribeToGuests((payload) => {
      if (payload.new) {
        setGuests((currentGuests) => {
          // Check if this guest already exists
          const existingIndex = currentGuests.findIndex(
            (g) => g.id === payload.new.id,
          );

          if (existingIndex >= 0) {
            // Update existing guest
            const updatedGuests = [...currentGuests];
            updatedGuests[existingIndex] = payload.new;
            return updatedGuests;
          } else {
            // Add new guest
            return [payload.new, ...currentGuests];
          }
        });
      } else if (payload.old) {
        // Handle deletion
        setGuests((currentGuests) =>
          currentGuests.filter((g) => g.id !== payload.old?.id),
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { guests, loading, error };
}

// Hook for tables realtime updates
export function useRealtimeTables(initialTables: RealtimeTable[] = []) {
  const [tables, setTables] = useState<RealtimeTable[]>(initialTables);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
        setTables(data as RealtimeTable[]);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching tables:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();

    // Subscribe to realtime updates
    const unsubscribe = realtimeManager.subscribeToTables((payload) => {
      if (payload.new) {
        setTables((currentTables) => {
          // Check if this table already exists
          const existingIndex = currentTables.findIndex(
            (t) => t.id === payload.new.id,
          );

          if (existingIndex >= 0) {
            // Update existing table
            const updatedTables = [...currentTables];
            updatedTables[existingIndex] = payload.new;
            return updatedTables;
          } else {
            // Add new table
            return [payload.new, ...currentTables];
          }
        });
      } else if (payload.old) {
        // Handle deletion
        setTables((currentTables) =>
          currentTables.filter((t) => t.id !== payload.old?.id),
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { tables, loading, error };
}

// Hook for seats realtime updates
export function useRealtimeSeats(tableId?: string) {
  const [seats, setSeats] = useState<RealtimeSeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
        setSeats(data as RealtimeSeat[]);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching seats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();

    // Subscribe to realtime updates
    const unsubscribe = realtimeManager.subscribeToSeats((payload) => {
      // Only process updates for the specified table if tableId is provided
      if (tableId && payload.new && payload.new.table_id !== tableId) {
        return;
      }

      if (payload.new) {
        setSeats((currentSeats) => {
          // Check if this seat already exists
          const existingIndex = currentSeats.findIndex(
            (s) => s.id === payload.new.id,
          );

          if (existingIndex >= 0) {
            // Update existing seat
            const updatedSeats = [...currentSeats];
            updatedSeats[existingIndex] = payload.new;
            return updatedSeats;
          } else if (!tableId || payload.new.table_id === tableId) {
            // Add new seat if it belongs to the current table or if no tableId filter
            return [...currentSeats, payload.new];
          }
          return currentSeats;
        });
      } else if (payload.old) {
        // Handle deletion
        setSeats((currentSeats) =>
          currentSeats.filter((s) => s.id !== payload.old?.id),
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [tableId]);

  return { seats, loading, error };
}
