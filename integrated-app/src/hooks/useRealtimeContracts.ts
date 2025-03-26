import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Contract } from "@/types/contract";
import { getContractsByVendor } from "@/services/contractService";

// Hook for real-time contract updates
export function useRealtimeContracts(vendorId?: string) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!vendorId) {
      setContracts([]);
      setLoading(false);
      return;
    }

    // Fetch initial data
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const data = await getContractsByVendor(vendorId);
        setContracts(data);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching vendor contracts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`vendor-contracts-${vendorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vendor_contracts",
          filter: `vendor_id=eq.${vendorId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === "INSERT") {
            setContracts((current) => [newRecord, ...current]);
            toast({
              title: "Contract Added",
              description: `A new contract "${newRecord.name}" has been added.`,
            });
          } else if (eventType === "UPDATE") {
            setContracts((current) =>
              current.map((contract) =>
                contract.id === oldRecord.id ? newRecord : contract,
              ),
            );
            toast({
              title: "Contract Updated",
              description: `Contract "${newRecord.name}" has been updated.`,
            });
          } else if (eventType === "DELETE") {
            setContracts((current) =>
              current.filter((contract) => contract.id !== oldRecord.id),
            );
            toast({
              title: "Contract Removed",
              description: `Contract "${oldRecord.name}" has been removed.`,
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

  return { contracts, loading, error };
}
