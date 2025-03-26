import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Vendor } from "@/types/vendor";
import { getRecommendedVendors } from "@/services/recommendationService";

// Hook for real-time vendor recommendations
export function useRealtimeRecommendations(
  preferences: any = {},
  limit: number = 6,
) {
  const [recommendations, setRecommendations] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial data
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const data = await getRecommendedVendors(preferences, limit);
        setRecommendations(data);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching vendor recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();

    // Set up real-time subscription for vendor reviews
    // When reviews change, we might want to update recommendations
    const subscription = supabase
      .channel(`vendor-recommendations`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vendor_reviews",
        },
        () => {
          // Refresh recommendations when reviews change
          fetchRecommendations();
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [preferences, limit, toast]);

  return { recommendations, loading, error };
}
