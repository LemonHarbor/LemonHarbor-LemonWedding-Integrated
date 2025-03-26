import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Payment } from "@/types/payment";

// Hook for real-time vendor payment updates
export function useRealtimeVendorPayments(vendorId?: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!vendorId) {
      setPayments([]);
      setLoading(false);
      return;
    }

    // Fetch initial data
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("vendor_payments")
          .select("*")
          .eq("vendor_id", vendorId)
          .order("due_date", { ascending: true });

        if (error) throw error;
        setPayments(data || []);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching vendor payments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`vendor-payments-${vendorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vendor_payments",
          filter: `vendor_id=eq.${vendorId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === "INSERT") {
            setPayments((current) => [...current, newRecord]);
            toast({
              title: "Payment Added",
              description: `A new payment of ${newRecord.amount} has been added.`,
            });
          } else if (eventType === "UPDATE") {
            setPayments((current) =>
              current.map((payment) =>
                payment.id === oldRecord.id ? newRecord : payment,
              ),
            );
            toast({
              title: "Payment Updated",
              description: `Payment details have been updated.`,
            });
          } else if (eventType === "DELETE") {
            setPayments((current) =>
              current.filter((payment) => payment.id !== oldRecord.id),
            );
            toast({
              title: "Payment Removed",
              description: `A payment has been removed.`,
            });
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [vendorId, toast]);

  return { payments, loading, error };
}
