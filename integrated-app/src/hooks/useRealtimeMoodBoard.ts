import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { MoodBoard, MoodBoardItem, MoodBoardComment } from "@/types/moodboard";
import {
  getMoodBoardById,
  getMoodBoardItems,
  getMoodBoardComments,
} from "@/services/moodboardService";

// Hook for real-time mood board updates
export function useRealtimeMoodBoard(boardId?: string) {
  const [board, setBoard] = useState<MoodBoard | null>(null);
  const [items, setItems] = useState<MoodBoardItem[]>([]);
  const [comments, setComments] = useState<MoodBoardComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!boardId) {
      setBoard(null);
      setItems([]);
      setComments([]);
      setLoading(false);
      return;
    }

    // Fetch initial data
    const fetchMoodBoardData = async () => {
      try {
        setLoading(true);

        // Fetch board details
        const boardData = await getMoodBoardById(boardId);
        setBoard(boardData);

        // Fetch board items
        const itemsData = await getMoodBoardItems(boardId);
        setItems(itemsData);

        // Fetch board comments
        const commentsData = await getMoodBoardComments(boardId);
        setComments(commentsData);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching mood board data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMoodBoardData();

    // Set up real-time subscription for board details
    const boardSubscription = supabase
      .channel(`mood-board-${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mood_boards",
          filter: `id=eq.${boardId}`,
        },
        (payload) => {
          const { eventType, new: newRecord } = payload;

          if (eventType === "UPDATE") {
            setBoard(newRecord);
            toast({
              title: "Mood Board Updated",
              description: "The mood board details have been updated.",
            });
          } else if (eventType === "DELETE") {
            setBoard(null);
            toast({
              title: "Mood Board Deleted",
              description: "This mood board has been deleted.",
            });
          }
        },
      )
      .subscribe();

    // Set up real-time subscription for board items
    const itemsSubscription = supabase
      .channel(`mood-board-items-${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mood_board_items",
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === "INSERT") {
            setItems((current) => [...current, newRecord]);
            toast({
              title: "Item Added",
              description: "A new item has been added to the mood board.",
            });
          } else if (eventType === "UPDATE") {
            setItems((current) =>
              current.map((item) =>
                item.id === oldRecord.id ? newRecord : item,
              ),
            );
          } else if (eventType === "DELETE") {
            setItems((current) =>
              current.filter((item) => item.id !== oldRecord.id),
            );
            toast({
              title: "Item Removed",
              description: "An item has been removed from the mood board.",
            });
          }
        },
      )
      .subscribe();

    // Set up real-time subscription for board comments
    const commentsSubscription = supabase
      .channel(`mood-board-comments-${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mood_board_comments",
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === "INSERT") {
            // Fetch the user name for the new comment
            const fetchUserName = async () => {
              try {
                const { data } = await supabase
                  .from("users")
                  .select("name")
                  .eq("id", newRecord.user_id)
                  .single();

                const commentWithUserName = {
                  ...newRecord,
                  user_name: data?.name,
                };

                setComments((current) => [...current, commentWithUserName]);
              } catch (error) {
                console.error("Error fetching user name:", error);
                setComments((current) => [...current, newRecord]);
              }
            };

            fetchUserName();

            toast({
              title: "New Comment",
              description: "A new comment has been added to the mood board.",
            });
          } else if (eventType === "DELETE") {
            setComments((current) =>
              current.filter((comment) => comment.id !== oldRecord.id),
            );
          }
        },
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      boardSubscription.unsubscribe();
      itemsSubscription.unsubscribe();
      commentsSubscription.unsubscribe();
    };
  }, [boardId, toast]);

  return { board, items, comments, loading, error };
}

// Hook for real-time mood boards list
export function useRealtimeMoodBoards(userId: string) {
  const [boards, setBoards] = useState<MoodBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setBoards([]);
      setLoading(false);
      return;
    }

    // Fetch initial data
    const fetchMoodBoards = async () => {
      try {
        setLoading(true);

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

        setBoards([...ownedBoards, ...sharedBoards]);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching mood boards:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMoodBoards();

    // Set up real-time subscription for user's boards
    const ownedBoardsSubscription = supabase
      .channel(`user-mood-boards-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mood_boards",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === "INSERT") {
            setBoards((current) => [newRecord, ...current]);
            toast({
              title: "Mood Board Created",
              description: "A new mood board has been created.",
            });
          } else if (eventType === "UPDATE") {
            setBoards((current) =>
              current.map((board) =>
                board.id === oldRecord.id
                  ? {
                      ...newRecord,
                      shared: board.shared,
                      permission: board.permission,
                    }
                  : board,
              ),
            );
          } else if (eventType === "DELETE") {
            setBoards((current) =>
              current.filter((board) => board.id !== oldRecord.id),
            );
            toast({
              title: "Mood Board Deleted",
              description: "A mood board has been deleted.",
            });
          }
        },
      )
      .subscribe();

    // Set up real-time subscription for shared boards
    const sharedBoardsSubscription = supabase
      .channel(`shared-mood-boards-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mood_board_shares",
          filter: `shared_with_id=eq.${userId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === "INSERT") {
            // Fetch the board details
            const fetchBoardDetails = async () => {
              try {
                const { data, error } = await supabase
                  .from("mood_boards")
                  .select("*")
                  .eq("id", newRecord.board_id)
                  .single();

                if (error) throw error;

                setBoards((current) => [
                  { ...data, shared: true, permission: newRecord.permission },
                  ...current,
                ]);

                toast({
                  title: "Mood Board Shared With You",
                  description: "A mood board has been shared with you.",
                });
              } catch (error) {
                console.error("Error fetching shared board details:", error);
              }
            };

            fetchBoardDetails();
          } else if (eventType === "UPDATE") {
            setBoards((current) =>
              current.map((board) =>
                board.id === newRecord.board_id
                  ? { ...board, permission: newRecord.permission }
                  : board,
              ),
            );
          } else if (eventType === "DELETE") {
            setBoards((current) =>
              current.filter((board) => board.id !== oldRecord.board_id),
            );
            toast({
              title: "Mood Board Unshared",
              description: "A mood board is no longer shared with you.",
            });
          }
        },
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      ownedBoardsSubscription.unsubscribe();
      sharedBoardsSubscription.unsubscribe();
    };
  }, [userId, toast]);

  return { boards, loading, error };
}
