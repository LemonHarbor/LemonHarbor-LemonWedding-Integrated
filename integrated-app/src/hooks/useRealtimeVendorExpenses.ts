import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

// Hook for real-time vendor expense updates
export function useRealtimeVendorExpenses(vendorId?: string) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!vendorId) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    // Fetch initial data
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("expenses")
          .select("*")
          .eq("vendor_id", vendorId)
          .order("date", { ascending: false });

        if (error) throw error;
        setExpenses(data || []);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching vendor expenses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`vendor-expenses-${vendorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `vendor_id=eq.${vendorId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === "INSERT") {
            setExpenses((current) => [newRecord, ...current]);
          } else if (eventType === "UPDATE") {
            setExpenses((current) =>
              current.map((expense) =>
                expense.id === oldRecord.id ? newRecord : expense,
              ),
            );
          } else if (eventType === "DELETE") {
            setExpenses((current) =>
              current.filter((expense) => expense.id !== oldRecord.id),
            );
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [vendorId, toast]);

  return { expenses, loading, error };
}
