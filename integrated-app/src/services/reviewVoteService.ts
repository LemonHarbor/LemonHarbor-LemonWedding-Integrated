import { supabase } from "@/lib/supabase";
import { ReviewVote } from "@/types/review";

// Vote on a review (helpful or not helpful)
export const voteOnReview = async (
  reviewId: string,
  userId: string,
  isHelpful: boolean,
): Promise<ReviewVote> => {
  try {
    // Check if user has already voted on this review
    const { data: existingVote } = await supabase
      .from("vendor_review_votes")
      .select("*")
      .eq("review_id", reviewId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingVote) {
      // If vote exists and is different, update it
      if (existingVote.is_helpful !== isHelpful) {
        const { data, error } = await supabase
          .from("vendor_review_votes")
          .update({ is_helpful: isHelpful })
          .eq("id", existingVote.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
      // If vote is the same, return existing vote
      return existingVote;
    }

    // If no existing vote, create a new one
    const { data, error } = await supabase
      .from("vendor_review_votes")
      .insert([{ review_id: reviewId, user_id: userId, is_helpful: isHelpful }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error voting on review:", error);
    throw error;
  }
};

// Remove a vote from a review
export const removeVoteFromReview = async (
  reviewId: string,
  userId: string,
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("vendor_review_votes")
      .delete()
      .eq("review_id", reviewId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing vote from review:", error);
    throw error;
  }
};

// Get user's vote for a specific review
export const getUserVoteForReview = async (
  reviewId: string,
  userId: string,
): Promise<ReviewVote | null> => {
  try {
    const { data, error } = await supabase
      .from("vendor_review_votes")
      .select("*")
      .eq("review_id", reviewId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting user vote for review:", error);
    throw error;
  }
};

// Get all votes for a review
export const getVotesForReview = async (
  reviewId: string,
): Promise<ReviewVote[]> => {
  try {
    const { data, error } = await supabase
      .from("vendor_review_votes")
      .select("*")
      .eq("review_id", reviewId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting votes for review:", error);
    throw error;
  }
};

// Get helpful and unhelpful vote counts for a review
export const getVoteCountsForReview = async (
  reviewId: string,
): Promise<{ helpful: number; unhelpful: number }> => {
  try {
    const { data, error } = await supabase
      .from("vendor_reviews")
      .select("helpful_votes, unhelpful_votes")
      .eq("id", reviewId)
      .single();

    if (error) throw error;
    return {
      helpful: data.helpful_votes || 0,
      unhelpful: data.unhelpful_votes || 0,
    };
  } catch (error) {
    console.error("Error getting vote counts for review:", error);
    throw error;
  }
};
