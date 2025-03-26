import { supabase } from "@/lib/supabase";
import { SongRequest, SongRequestFormData } from "@/types/music";

// Get all song requests
export const getSongRequests = async (): Promise<SongRequest[]> => {
  try {
    const { data, error } = await supabase
      .from("music_wishlist")
      .select("*, guests(name)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Format the data to include guest name
    return (
      data?.map((song) => ({
        ...song,
        guest_name: song.guests?.name || "Unknown Guest",
      })) || []
    );
  } catch (error) {
    console.error("Error fetching song requests:", error);
    throw error;
  }
};

// Get song requests by guest ID
export const getSongRequestsByGuestId = async (
  guestId: string,
): Promise<SongRequest[]> => {
  try {
    const { data, error } = await supabase
      .from("music_wishlist")
      .select("*, guests(name)")
      .eq("guest_id", guestId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Format the data to include guest name
    return (
      data?.map((song) => ({
        ...song,
        guest_name: song.guests?.name || "Unknown Guest",
      })) || []
    );
  } catch (error) {
    console.error("Error fetching guest song requests:", error);
    throw error;
  }
};

// Add a song request
export const addSongRequest = async (
  guestId: string,
  songData: SongRequestFormData,
): Promise<SongRequest> => {
  try {
    const { data, error } = await supabase
      .from("music_wishlist")
      .insert([
        {
          guest_id: guestId,
          title: songData.title,
          artist: songData.artist,
          notes: songData.notes || null,
        },
      ])
      .select("*, guests(name)")
      .single();

    if (error) throw error;

    return {
      ...data,
      guest_name: data.guests?.name || "Unknown Guest",
    };
  } catch (error) {
    console.error("Error adding song request:", error);
    throw error;
  }
};

// Update a song request
export const updateSongRequest = async (
  songId: string,
  songData: Partial<SongRequestFormData>,
): Promise<SongRequest> => {
  try {
    const { data, error } = await supabase
      .from("music_wishlist")
      .update({
        ...songData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", songId)
      .select("*, guests(name)")
      .single();

    if (error) throw error;

    return {
      ...data,
      guest_name: data.guests?.name || "Unknown Guest",
    };
  } catch (error) {
    console.error("Error updating song request:", error);
    throw error;
  }
};

// Delete a song request
export const deleteSongRequest = async (songId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("music_wishlist")
      .delete()
      .eq("id", songId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting song request:", error);
    throw error;
  }
};

// Update song status (for admin/couple use)
export const updateSongStatus = async (
  songId: string,
  status: "pending" | "approved" | "rejected",
): Promise<SongRequest> => {
  try {
    const { data, error } = await supabase
      .from("music_wishlist")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", songId)
      .select("*, guests(name)")
      .single();

    if (error) throw error;

    return {
      ...data,
      guest_name: data.guests?.name || "Unknown Guest",
    };
  } catch (error) {
    console.error("Error updating song status:", error);
    throw error;
  }
};
