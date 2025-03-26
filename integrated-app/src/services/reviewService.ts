import { supabase } from "@/lib/supabase";
import { Review, ReviewFormData, ReviewStatus } from "@/types/review";

// Get all reviews
export const getReviews = async (): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from("vendor_reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
};

// Get reviews by vendor ID (only approved by default)
export const getReviewsByVendor = async (
  vendorId: string,
  includeNonApproved = false,
  sortBy: "recent" | "helpful" | "rating" = "recent",
): Promise<Review[]> => {
  try {
    let query = supabase
      .from("vendor_reviews")
      .select("*")
      .eq("vendor_id", vendorId);

    if (!includeNonApproved) {
      query = query.eq("status", "approved");
    }

    // Apply sorting
    switch (sortBy) {
      case "helpful":
        // Sort by net helpfulness (helpful_votes - unhelpful_votes)
        query = query.order("helpful_votes", { ascending: false });
        break;
      case "rating":
        query = query.order("rating", { ascending: false });
        break;
      case "recent":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching vendor reviews:", error);
    throw error;
  }
};

// Get reviews pending moderation
export const getPendingReviews = async (): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from("vendor_reviews")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    throw error;
  }
};

// Get review by ID
export const getReviewById = async (id: string): Promise<Review> => {
  try {
    const { data, error } = await supabase
      .from("vendor_reviews")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching review:", error);
    throw error;
  }
};

// Get review by vendor and user
export const getReviewByVendorAndUser = async (
  vendorId: string,
  userId: string,
): Promise<Review | null> => {
  try {
    const { data, error } = await supabase
      .from("vendor_reviews")
      .select("*")
      .eq("vendor_id", vendorId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching review:", error);
    throw error;
  }
};

// Create a new review
export const createReview = async (
  reviewData: ReviewFormData,
  userId: string,
): Promise<Review> => {
  try {
    // Format the visit_date if it's a Date object
    const formattedData = {
      ...reviewData,
      visit_date:
        reviewData.visit_date instanceof Date
          ? reviewData.visit_date.toISOString()
          : reviewData.visit_date,
    };

    const { data, error } = await supabase
      .from("vendor_reviews")
      .insert([
        {
          ...formattedData,
          user_id: userId,
          status: formattedData.status || "pending", // Default to pending for moderation
          is_verified: formattedData.is_verified || false,
          verification_type: formattedData.verification_type,
          verification_date:
            formattedData.verification_date ||
            (formattedData.is_verified ? new Date().toISOString() : null),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};

// Update a review
export const updateReview = async (
  id: string,
  reviewData: Partial<ReviewFormData>,
): Promise<Review> => {
  try {
    // Format the visit_date if it's a Date object
    const formattedData = {
      ...reviewData,
      visit_date:
        reviewData.visit_date instanceof Date
          ? reviewData.visit_date.toISOString()
          : reviewData.visit_date,
    };

    const { data, error } = await supabase
      .from("vendor_reviews")
      .update({
        ...formattedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};

// Moderate a review
export const moderateReview = async (
  id: string,
  status: ReviewStatus,
  moderatorId: string,
  moderationNotes?: string,
  verifyReview?: boolean,
): Promise<Review> => {
  try {
    const updateData: any = {
      status,
      moderation_notes: moderationNotes,
      moderated_by: moderatorId,
      moderated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // If verifying the review during moderation
    if (verifyReview) {
      updateData.is_verified = true;
      updateData.verification_type = "admin";
      updateData.verification_date = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("vendor_reviews")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error moderating review:", error);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("vendor_reviews")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};

// Get vendor average rating (only approved reviews)
export const getVendorAverageRating = async (
  vendorId: string,
): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from("vendor_reviews")
      .select("rating")
      .eq("vendor_id", vendorId)
      .eq("status", "approved");

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    const sum = data.reduce((acc, review) => acc + review.rating, 0);
    return sum / data.length;
  } catch (error) {
    console.error("Error calculating average rating:", error);
    throw error;
  }
};

// Get vendor rating distribution (only approved reviews)
export const getVendorRatingDistribution = async (
  vendorId: string,
): Promise<Record<number, number>> => {
  try {
    const { data, error } = await supabase
      .from("vendor_reviews")
      .select("rating")
      .eq("vendor_id", vendorId)
      .eq("status", "approved");

    if (error) throw error;

    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    if (data) {
      data.forEach((review) => {
        distribution[review.rating]++;
      });
    }

    return distribution;
  } catch (error) {
    console.error("Error calculating rating distribution:", error);
    throw error;
  }
};
