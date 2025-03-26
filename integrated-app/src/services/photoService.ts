import { supabase } from "@/lib/supabase";
import { Photo, PhotoComment } from "@/types/photo";

// Get all photos
export const getPhotos = async (): Promise<Photo[]> => {
  try {
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching photos:", error);
    throw error;
  }
};

// Get photos by guest ID
export const getPhotosByGuestId = async (guestId: string): Promise<Photo[]> => {
  try {
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("guest_id", guestId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching guest photos:", error);
    throw error;
  }
};

// Upload a photo
export const uploadPhoto = async (
  file: File,
  guestId: string,
  caption?: string,
): Promise<Photo> => {
  try {
    // Generate a unique file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${guestId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `photos/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("wedding-photos")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data } = supabase.storage
      .from("wedding-photos")
      .getPublicUrl(filePath);

    // Create a record in the photos table
    const { data: photoData, error: insertError } = await supabase
      .from("photos")
      .insert([
        {
          guest_id: guestId,
          url: data.publicUrl,
          caption: caption || null,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;
    return photoData;
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw error;
  }
};

// Delete a photo
export const deletePhoto = async (photoId: string): Promise<boolean> => {
  try {
    // First get the photo to get the URL
    const { data: photo, error: fetchError } = await supabase
      .from("photos")
      .select("url")
      .eq("id", photoId)
      .single();

    if (fetchError) throw fetchError;

    // Extract the file path from the URL
    const url = new URL(photo.url);
    const filePath = url.pathname.split("/").pop();
    const storagePath = `photos/${filePath}`;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("wedding-photos")
      .remove([storagePath]);

    if (storageError) {
      console.warn("Error removing from storage:", storageError);
      // Continue anyway to delete the database record
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("photos")
      .delete()
      .eq("id", photoId);

    if (deleteError) throw deleteError;
    return true;
  } catch (error) {
    console.error("Error deleting photo:", error);
    throw error;
  }
};

// Get comments for a photo
export const getPhotoComments = async (
  photoId: string,
): Promise<PhotoComment[]> => {
  try {
    const { data, error } = await supabase
      .from("photo_comments")
      .select("*, guests(name)")
      .eq("photo_id", photoId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Format the data to include guest name
    return (
      data?.map((comment) => ({
        ...comment,
        guest_name: comment.guests?.name || "Unknown Guest",
      })) || []
    );
  } catch (error) {
    console.error("Error fetching photo comments:", error);
    throw error;
  }
};

// Add a comment to a photo
export const addPhotoComment = async (
  photoId: string,
  guestId: string,
  content: string,
): Promise<PhotoComment> => {
  try {
    const { data, error } = await supabase
      .from("photo_comments")
      .insert([{ photo_id: photoId, guest_id: guestId, content }])
      .select("*, guests(name)")
      .single();

    if (error) throw error;

    return {
      ...data,
      guest_name: data.guests?.name || "Unknown Guest",
    };
  } catch (error) {
    console.error("Error adding photo comment:", error);
    throw error;
  }
};

// Delete a comment
export const deletePhotoComment = async (
  commentId: string,
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("photo_comments")
      .delete()
      .eq("id", commentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting photo comment:", error);
    throw error;
  }
};
