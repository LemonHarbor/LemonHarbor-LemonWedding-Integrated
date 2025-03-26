import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { SongRequest } from "@/types/music";

// Hook for real-time song request updates
export function useRealtimeSongRequests(guestId?: string) {
  const [songs, setSongs] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial data
    const fetchSongs = async () => {
      try {
        setLoading(true);
        let query = supabase.from("music_wishlist").select("*, guests(name)");

        if (guestId) {
          query = query.eq("guest_id", guestId);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) throw error;

        // Format the data to include guest name
        const formattedSongs = data.map((song) => ({
          ...song,
          guest_name: song.guests?.name || "Unknown Guest",
        }));

        setSongs(formattedSongs || []);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching song requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();

    // Set up real-time subscription
    const subscription = supabase
      .channel("music-wishlist-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "music_wishlist" },
        async (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          // Only process updates for the specified guest if guestId is provided
          if (
            guestId &&
            newRecord &&
            newRecord.guest_id !== guestId &&
            eventType === "INSERT"
          ) {
            return;
          }

          // Handle different event types
          if (eventType === "INSERT") {
            // Fetch the guest name for the new song
            try {
              const { data, error } = await supabase
                .from("guests")
                .select("name")
                .eq("id", newRecord.guest_id)
                .single();

              if (!error && data) {
                const songWithName = {
                  ...newRecord,
                  guest_name: data.name,
                };
                setSongs((prev) => [songWithName, ...prev]);
              } else {
                // If we can't get the name, still add the song
                setSongs((prev) => [
                  { ...newRecord, guest_name: "Unknown Guest" },
                  ...prev,
                ]);
              }

              toast({
                title: "New Song Added",
                description: `A new song has been added to the wishlist.`,
              });
            } catch (err) {
              console.error("Error fetching guest name:", err);
              setSongs((prev) => [
                { ...newRecord, guest_name: "Unknown Guest" },
                ...prev,
              ]);
            }
          } else if (eventType === "UPDATE") {
            setSongs((prev) =>
              prev.map((song) =>
                song.id === newRecord.id
                  ? { ...newRecord, guest_name: song.guest_name }
                  : song,
              ),
            );

            toast({
              title: "Song Updated",
              description: `A song in the wishlist has been updated.`,
            });
          } else if (eventType === "DELETE") {
            setSongs((prev) => prev.filter((song) => song.id !== oldRecord.id));

            toast({
              title: "Song Removed",
              description: `A song has been removed from the wishlist.`,
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

  return { songs, loading, error };
}
