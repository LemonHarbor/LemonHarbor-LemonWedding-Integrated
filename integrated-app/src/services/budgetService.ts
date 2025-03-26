import { supabase } from "@/lib/supabase";

// Types
interface Expense {
  id?: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "cancelled";
  vendor?: string;
  notes?: string;
  receipt_url?: string;
}

interface BudgetCategory {
  id?: string;
  name: string;
  percentage: number;
  amount: number;
  recommended: number;
  color: string;
}

// Expense CRUD operations
export const getExpenses = async () => {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
};

export const getExpenseById = async (id: string) => {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const createExpense = async (expense: Expense) => {
  const { data, error } = await supabase
    .from("expenses")
    .insert([expense])
    .select();
  if (error) throw error;
  return data[0];
};

export const updateExpense = async (id: string, expense: Partial<Expense>) => {
  const { data, error } = await supabase
    .from("expenses")
    .update(expense)
    .eq("id", id)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteExpense = async (id: string) => {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
  return true;
};

// Budget category operations
export const getBudgetCategories = async () => {
  const { data, error } = await supabase
    .from("budget_categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
};

export const createBudgetCategory = async (category: BudgetCategory) => {
  const { data, error } = await supabase
    .from("budget_categories")
    .insert([category])
    .select();
  if (error) throw error;
  return data[0];
};

export const updateBudgetCategory = async (
  id: string,
  category: Partial<BudgetCategory>,
) => {
  const { data, error } = await supabase
    .from("budget_categories")
    .update(category)
    .eq("id", id)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteBudgetCategory = async (id: string) => {
  const { error } = await supabase
    .from("budget_categories")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return true;
};

export const updateTotalBudget = async (totalBudget: number) => {
  // In a real app, this would update a settings table or user preferences
  console.log("Updating total budget to:", totalBudget);
  return totalBudget;
};

// Upload receipt
export const uploadReceipt = async (file: File, expenseId: string) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${expenseId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `receipts/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("receipts").getPublicUrl(filePath);

  // Update the expense with the receipt URL
  await updateExpense(expenseId, { receipt_url: data.publicUrl });

  return data.publicUrl;
};
