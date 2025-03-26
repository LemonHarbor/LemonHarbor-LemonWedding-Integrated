import { supabase } from "@/lib/supabase";
import {
  MoodBoard,
  MoodBoardItem,
  MoodBoardComment,
  MoodBoardShare,
} from "@/types/moodboard";

// Get all mood boards for a user
export const getMoodBoards = async (userId: string): Promise<MoodBoard[]> => {
  try {
    // Get boards created by the user
    const { data: ownedBoards, error: ownedError } = await supabase
      .from("mood_boards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (ownedError) throw ownedError;

    // Get boards shared with the user
    const { data: sharedData, error: sharedError } = await supabase
      .from("mood_board_shares")
      .select("board_id, permission, mood_boards(*)")
      .eq("shared_with_id", userId);

    if (sharedError) throw sharedError;

    // Extract shared boards and add a 'shared' property
    const sharedBoards = sharedData
      .filter((share) => share.mood_boards)
      .map((share) => ({
        ...share.mood_boards,
        shared: true,
        permission: share.permission,
      }));

    return [...ownedBoards, ...sharedBoards];
  } catch (error) {
    console.error("Error fetching mood boards:", error);
    throw error;
  }
};

// Get a single mood board by ID
export const getMoodBoardById = async (boardId: string): Promise<MoodBoard> => {
  try {
    const { data, error } = await supabase
      .from("mood_boards")
      .select("*")
      .eq("id", boardId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching mood board:", error);
    throw error;
  }
};

// Create a new mood board
export const createMoodBoard = async (
  boardData: Partial<MoodBoard>,
): Promise<MoodBoard> => {
  try {
    const { data, error } = await supabase
      .from("mood_boards")
      .insert([boardData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating mood board:", error);
    throw error;
  }
};

// Update a mood board
export const updateMoodBoard = async (
  boardId: string,
  boardData: Partial<MoodBoard>,
): Promise<MoodBoard> => {
  try {
    const { data, error } = await supabase
      .from("mood_boards")
      .update({
        ...boardData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", boardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating mood board:", error);
    throw error;
  }
};

// Delete a mood board
export const deleteMoodBoard = async (boardId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("mood_boards")
      .delete()
      .eq("id", boardId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting mood board:", error);
    throw error;
  }
};

// Get all items for a mood board
export const getMoodBoardItems = async (
  boardId: string,
): Promise<MoodBoardItem[]> => {
  try {
    const { data, error } = await supabase
      .from("mood_board_items")
      .select("*")
      .eq("board_id", boardId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching mood board items:", error);
    throw error;
  }
};

// Add an item to a mood board
export const addMoodBoardItem = async (
  itemData: Partial<MoodBoardItem>,
): Promise<MoodBoardItem> => {
  try {
    const { data, error } = await supabase
      .from("mood_board_items")
      .insert([itemData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding mood board item:", error);
    throw error;
  }
};

// Update a mood board item
export const updateMoodBoardItem = async (
  itemId: string,
  itemData: Partial<MoodBoardItem>,
): Promise<MoodBoardItem> => {
  try {
    const { data, error } = await supabase
      .from("mood_board_items")
      .update({
        ...itemData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating mood board item:", error);
    throw error;
  }
};

// Delete a mood board item
export const deleteMoodBoardItem = async (itemId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("mood_board_items")
      .delete()
      .eq("id", itemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting mood board item:", error);
    throw error;
  }
};

// Upload an image for a mood board item
export const uploadMoodBoardImage = async (
  file: File,
  userId: string,
): Promise<string> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `mood_board_images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("images").getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Get all comments for a mood board
export const getMoodBoardComments = async (
  boardId: string,
): Promise<MoodBoardComment[]> => {
  try {
    const { data, error } = await supabase
      .from("mood_board_comments")
      .select("*, users(name)")
      .eq("board_id", boardId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Format the data to include user_name
    return data.map((comment) => ({
      ...comment,
      user_name: comment.users?.name,
    }));
  } catch (error) {
    console.error("Error fetching mood board comments:", error);
    throw error;
  }
};

// Add a comment to a mood board
export const addMoodBoardComment = async (
  commentData: Partial<MoodBoardComment>,
): Promise<MoodBoardComment> => {
  try {
    const { data, error } = await supabase
      .from("mood_board_comments")
      .insert([commentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding mood board comment:", error);
    throw error;
  }
};

// Delete a mood board comment
export const deleteMoodBoardComment = async (
  commentId: string,
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("mood_board_comments")
      .delete()
      .eq("id", commentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting mood board comment:", error);
    throw error;
  }
};

// Share a mood board with another user
export const shareMoodBoard = async (
  boardId: string,
  userId: string,
  sharedWithId: string,
  permission: "view" | "edit" | "admin",
): Promise<MoodBoardShare> => {
  try {
    const { data, error } = await supabase
      .from("mood_board_shares")
      .insert([
        {
          board_id: boardId,
          user_id: userId,
          shared_with_id: sharedWithId,
          permission,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error sharing mood board:", error);
    throw error;
  }
};

// Update a mood board share permission
export const updateMoodBoardShare = async (
  shareId: string,
  permission: "view" | "edit" | "admin",
): Promise<MoodBoardShare> => {
  try {
    const { data, error } = await supabase
      .from("mood_board_shares")
      .update({
        permission,
        updated_at: new Date().toISOString(),
      })
      .eq("id", shareId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating mood board share:", error);
    throw error;
  }
};

// Remove a share from a mood board
export const removeMoodBoardShare = async (
  shareId: string,
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("mood_board_shares")
      .delete()
      .eq("id", shareId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing mood board share:", error);
    throw error;
  }
};

// Generate a shareable link for a mood board
export const generateShareableLink = async (
  boardId: string,
): Promise<string> => {
  try {
    // Update the mood board to be public
    await updateMoodBoard(boardId, { is_public: true });

    // Return a shareable link
    return `${window.location.origin}/mood-board/${boardId}`;
  } catch (error) {
    console.error("Error generating shareable link:", error);
    throw error;
  }
};
