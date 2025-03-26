import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Review } from "@/types/review";
import {
  getReviewsByVendor,
  getPendingReviews,
} from "@/services/reviewService";

// Hook for real-time review updates
export function useRealtimeReviews(
  vendorId?: string,
  includeNonApproved = false,
  sortBy: "recent" | "helpful" | "rating" = "recent",
) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!vendorId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    // Fetch initial data
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await getReviewsByVendor(
          vendorId,
          includeNonApproved,
          sortBy,
        );
        setReviews(data);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching vendor reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`vendor-reviews-${vendorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vendor_reviews",
          filter: `vendor_id=eq.${vendorId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === "INSERT") {
            // Only add if it's approved or we're including non-approved
            if (includeNonApproved || newRecord.status === "approved") {
              setReviews((current) => [newRecord, ...current]);
              toast({
                title: "Review Added",
                description: "A new review has been added.",
              });
            }
          } else if (eventType === "UPDATE") {
            setReviews((current) =>
              current.map((review) =>
                review.id === oldRecord.id ? newRecord : review,
              ),
            );
            toast({
              title: "Review Updated",
              description: "A review has been updated.",
            });
          } else if (eventType === "DELETE") {
            setReviews((current) =>
              current.filter((review) => review.id !== oldRecord.id),
            );
            toast({
              title: "Review Removed",
              description: "A review has been removed.",
            });
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [vendorId, includeNonApproved, sortBy, toast]);

  return { reviews, loading, error };
}

// Hook for pending reviews (for moderation)
export function usePendingReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial data
    const fetchPendingReviews = async () => {
      try {
        setLoading(true);
        const data = await getPendingReviews();
        setReviews(data);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching pending reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingReviews();

    // Set up real-time subscription for pending reviews
    const subscription = supabase
      .channel(`pending-reviews`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vendor_reviews",
          filter: `status=eq.pending`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === "INSERT" && newRecord.status === "pending") {
            setReviews((current) => [newRecord, ...current]);
            toast({
              title: "New Pending Review",
              description: "A new review needs moderation.",
            });
          } else if (eventType === "UPDATE") {
            // If status changed from pending to something else, remove it
            if (
              oldRecord.status === "pending" &&
              newRecord.status !== "pending"
            ) {
              setReviews((current) =>
                current.filter((review) => review.id !== oldRecord.id),
              );
            }
            // If it's still pending, update it
            else if (newRecord.status === "pending") {
              setReviews((current) =>
                current.map((review) =>
                  review.id === oldRecord.id ? newRecord : review,
                ),
              );
            }
          } else if (eventType === "DELETE") {
            setReviews((current) =>
              current.filter((review) => review.id !== oldRecord.id),
            );
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  return { reviews, loading, error };
}
