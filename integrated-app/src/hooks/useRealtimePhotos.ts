import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Photo, PhotoComment } from "@/types/photo";

// Hook for real-time photo updates
export function useRealtimePhotos(guestId?: string) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial data
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        let query = supabase.from("photos").select("*");

        if (guestId) {
          query = query.eq("guest_id", guestId);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) throw error;
        setPhotos(data || []);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching photos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();

    // Set up real-time subscription
    const subscription = supabase
      .channel("photos-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "photos" },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          // Only process updates for the specified guest if guestId is provided
          if (guestId && newRecord && newRecord.guest_id !== guestId) {
            return;
          }

          // Handle different event types
          if (eventType === "INSERT") {
            setPhotos((prev) => [newRecord, ...prev]);
            toast({
              title: "New Photo Added",
              description: `A new photo has been added to the gallery.`,
            });
          } else if (eventType === "UPDATE") {
            setPhotos((prev) =>
              prev.map((photo) =>
                photo.id === newRecord.id ? newRecord : photo,
              ),
            );
          } else if (eventType === "DELETE") {
            setPhotos((prev) =>
              prev.filter((photo) => photo.id !== oldRecord.id),
            );
            toast({
              title: "Photo Removed",
              description: `A photo has been removed from the gallery.`,
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

  return { photos, loading, error };
}

// Hook for real-time photo comment updates
export function useRealtimePhotoComments(photoId: string) {
  const [comments, setComments] = useState<PhotoComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!photoId) {
      setComments([]);
      setLoading(false);
      return;
    }

    // Fetch initial data
    const fetchComments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("photo_comments")
          .select("*, guests(name)")
          .eq("photo_id", photoId)
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Format the data to include guest name
        const formattedComments = data.map((comment) => ({
          ...comment,
          guest_name: comment.guests?.name || "Unknown Guest",
        }));

        setComments(formattedComments);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching photo comments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`photo-comments-${photoId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "photo_comments",
          filter: `photo_id=eq.${photoId}`,
        },
        async (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          // Handle different event types
          if (eventType === "INSERT") {
            // Fetch the guest name for the new comment
            try {
              const { data, error } = await supabase
                .from("guests")
                .select("name")
                .eq("id", newRecord.guest_id)
                .single();

              if (!error && data) {
                const commentWithName = {
                  ...newRecord,
                  guest_name: data.name,
                };
                setComments((prev) => [...prev, commentWithName]);
              } else {
                // If we can't get the name, still add the comment
                setComments((prev) => [
                  ...prev,
                  { ...newRecord, guest_name: "Unknown Guest" },
                ]);
              }
            } catch (err) {
              console.error("Error fetching guest name:", err);
              setComments((prev) => [
                ...prev,
                { ...newRecord, guest_name: "Unknown Guest" },
              ]);
            }
          } else if (eventType === "UPDATE") {
            setComments((prev) =>
              prev.map((comment) =>
                comment.id === newRecord.id
                  ? { ...newRecord, guest_name: comment.guest_name }
                  : comment,
              ),
            );
          } else if (eventType === "DELETE") {
            setComments((prev) =>
              prev.filter((comment) => comment.id !== oldRecord.id),
            );
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [photoId, toast]);

  return { comments, loading, error };
}
