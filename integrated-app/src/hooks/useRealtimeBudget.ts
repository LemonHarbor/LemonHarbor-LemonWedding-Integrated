import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

// Hook for real-time budget category updates
export function useRealtimeBudgetCategories(initialCategories: any[] = []) {
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial data
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("budget_categories")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching budget categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();

    // Set up real-time subscription
    const subscription = supabase
      .channel("budget-categories-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "budget_categories" },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          // Handle different event types
          if (eventType === "INSERT") {
            setCategories((prev) => [newRecord, ...prev]);
            toast({
              title: "New Category Added",
              description: `Category "${newRecord.name}" has been added.`,
            });
          } else if (eventType === "UPDATE") {
            setCategories((prev) =>
              prev.map((category) =>
                category.id === newRecord.id ? newRecord : category,
              ),
            );
            toast({
              title: "Category Updated",
              description: `Category "${newRecord.name}" has been updated.`,
            });
          } else if (eventType === "DELETE") {
            setCategories((prev) =>
              prev.filter((category) => category.id !== oldRecord.id),
            );
            toast({
              title: "Category Removed",
              description: `Category "${oldRecord.name}" has been removed.`,
            });
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  return { categories, loading, error };
}

// Hook for real-time expense updates
export function useRealtimeExpenses(initialExpenses: any[] = []) {
  const [expenses, setExpenses] = useState<any[]>(initialExpenses);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial data
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("expenses")
          .select("*")
          .order("date", { ascending: false });

        if (error) throw error;
        setExpenses(data || []);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching expenses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();

    // Set up real-time subscription
    const subscription = supabase
      .channel("expenses-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          // Handle different event types
          if (eventType === "INSERT") {
            setExpenses((prev) => [newRecord, ...prev]);
            toast({
              title: "New Expense Added",
              description: `Expense "${newRecord.name}" has been added.`,
            });
          } else if (eventType === "UPDATE") {
            setExpenses((prev) =>
              prev.map((expense) =>
                expense.id === newRecord.id ? newRecord : expense,
              ),
            );
            toast({
              title: "Expense Updated",
              description: `Expense "${newRecord.name}" has been updated.`,
            });
          } else if (eventType === "DELETE") {
            setExpenses((prev) =>
              prev.filter((expense) => expense.id !== oldRecord.id),
            );
            toast({
              title: "Expense Removed",
              description: `Expense "${oldRecord.name}" has been removed.`,
            });
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  return { expenses, loading, error };
}
