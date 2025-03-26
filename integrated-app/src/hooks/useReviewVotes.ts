import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { ReviewVote } from "@/types/review";
import {
  getUserVoteForReview,
  voteOnReview,
  removeVoteFromReview,
} from "@/services/reviewVoteService";

// Hook for managing a user's vote on a review
export function useReviewVote(reviewId: string, userId?: string) {
  const [userVote, setUserVote] = useState<ReviewVote | null>(null);
  const [helpfulCount, setHelpfulCount] = useState<number>(0);
  const [unhelpfulCount, setUnhelpfulCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Fetch initial vote data
  useEffect(() => {
    if (!reviewId || !userId) {
      setLoading(false);
      return;
    }

    const fetchVoteData = async () => {
      try {
        setLoading(true);

        // Get user's vote
        const vote = await getUserVoteForReview(reviewId, userId);
        setUserVote(vote);

        // Get vote counts from the review
        const { data, error } = await supabase
          .from("vendor_reviews")
          .select("helpful_votes, unhelpful_votes")
          .eq("id", reviewId)
          .single();

        if (error) throw error;

        setHelpfulCount(data.helpful_votes || 0);
        setUnhelpfulCount(data.unhelpful_votes || 0);
      } catch (err) {
        console.error("Error fetching vote data:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchVoteData();

    // Set up real-time subscription for vote counts
    const reviewSubscription = supabase
      .channel(`review-votes-${reviewId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "vendor_reviews",
          filter: `id=eq.${reviewId}`,
        },
        (payload) => {
          const { new: newRecord } = payload;
          setHelpfulCount(newRecord.helpful_votes || 0);
          setUnhelpfulCount(newRecord.unhelpful_votes || 0);
        },
      )
      .subscribe();

    // Set up real-time subscription for user's vote
    const voteSubscription = supabase
      .channel(`user-vote-${reviewId}-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vendor_review_votes",
          filter: `review_id=eq.${reviewId} AND user_id=eq.${userId}`,
        },
        (payload) => {
          const { eventType, new: newRecord } = payload;

          if (eventType === "INSERT" || eventType === "UPDATE") {
            setUserVote(newRecord);
          } else if (eventType === "DELETE") {
            setUserVote(null);
          }
        },
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      reviewSubscription.unsubscribe();
      voteSubscription.unsubscribe();
    };
  }, [reviewId, userId, toast]);

  // Vote as helpful
  const voteHelpful = async () => {
    if (!userId || !reviewId) return;

    try {
      await voteOnReview(reviewId, userId, true);
    } catch (err) {
      console.error("Error voting as helpful:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark review as helpful.",
      });
    }
  };

  // Vote as unhelpful
  const voteUnhelpful = async () => {
    if (!userId || !reviewId) return;

    try {
      await voteOnReview(reviewId, userId, false);
    } catch (err) {
      console.error("Error voting as unhelpful:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark review as unhelpful.",
      });
    }
  };

  // Remove vote
  const removeVote = async () => {
    if (!userId || !reviewId) return;

    try {
      await removeVoteFromReview(reviewId, userId);
    } catch (err) {
      console.error("Error removing vote:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove your vote.",
      });
    }
  };

  return {
    userVote,
    helpfulCount,
    unhelpfulCount,
    loading,
    error,
    voteHelpful,
    voteUnhelpful,
    removeVote,
    isHelpful: userVote?.is_helpful === true,
    isUnhelpful: userVote?.is_helpful === false,
    hasVoted: !!userVote,
  };
}

// Hook for getting all votes for a review
export function useReviewVotes(reviewId: string) {
  const [votes, setVotes] = useState<ReviewVote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!reviewId) {
      setLoading(false);
      return;
    }

    const fetchVotes = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("vendor_review_votes")
          .select("*")
          .eq("review_id", reviewId);

        if (error) throw error;
        setVotes(data || []);
      } catch (err) {
        console.error("Error fetching votes:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`review-votes-all-${reviewId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vendor_review_votes",
          filter: `review_id=eq.${reviewId}`,
        },
        () => {
          // Refetch all votes when any change occurs
          fetchVotes();
        },
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [reviewId]);

  return { votes, loading, error };
}
