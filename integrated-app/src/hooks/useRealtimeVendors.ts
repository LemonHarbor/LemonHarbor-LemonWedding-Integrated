import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Vendor } from "@/types/vendor";
import { getVendorsWithExpenseSummaries } from "@/services/vendorService";

// Hook for real-time vendor updates
export function useRealtimeVendors(category?: string) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial data
    const fetchVendors = async () => {
      try {
        setLoading(true);

        // Get vendors with expense summaries
        const vendorsWithSummaries = await getVendorsWithExpenseSummaries();

        // Filter by category if needed
        let filteredVendors = vendorsWithSummaries;
        if (category) {
          filteredVendors = vendorsWithSummaries.filter(
            (vendor) => vendor.category === category,
          );
        }

        setVendors(filteredVendors || []);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching vendors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();

    // Set up real-time subscription
    const subscription = supabase
      .channel("vendors-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vendors" },
        async (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          // Refresh the entire vendor list to get updated expense summaries
          if (
            eventType === "INSERT" ||
            eventType === "UPDATE" ||
            eventType === "DELETE"
          ) {
            try {
              const vendorsWithSummaries =
                await getVendorsWithExpenseSummaries();

              // Filter by category if needed
              let filteredVendors = vendorsWithSummaries;
              if (category) {
                filteredVendors = vendorsWithSummaries.filter(
                  (vendor) => vendor.category === category,
                );
              }

              setVendors(filteredVendors);

              // Show appropriate toast message
              if (eventType === "INSERT") {
                toast({
                  title: "New Vendor Added",
                  description: `${newRecord.name} has been added to your vendors.`,
                });
              } else if (eventType === "UPDATE") {
                toast({
                  title: "Vendor Updated",
                  description: `${newRecord.name} has been updated.`,
                });
              } else if (eventType === "DELETE") {
                toast({
                  title: "Vendor Removed",
                  description: `${oldRecord.name} has been removed from your vendors.`,
                });
              }
            } catch (err) {
              console.error("Error refreshing vendors:", err);
            }
          }
        },
      )
      .subscribe();

    // Also subscribe to changes in the expenses table
    const expensesSubscription = supabase
      .channel("expenses-changes-for-vendors")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        async () => {
          // Refresh vendor list with updated expense summaries
          try {
            const vendorsWithSummaries = await getVendorsWithExpenseSummaries();

            // Filter by category if needed
            let filteredVendors = vendorsWithSummaries;
            if (category) {
              filteredVendors = vendorsWithSummaries.filter(
                (vendor) => vendor.category === category,
              );
            }

            setVendors(filteredVendors);
          } catch (err) {
            console.error(
              "Error refreshing vendors after expense change:",
              err,
            );
          }
        },
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      subscription.unsubscribe();
      expensesSubscription.unsubscribe();
    };
  }, [category, toast]);

  return { vendors, loading, error };
}
