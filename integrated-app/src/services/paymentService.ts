import { supabase } from "@/lib/supabase";
import { Payment, PaymentFormData } from "@/types/payment";

// Get all payments
export const getPayments = async (): Promise<Payment[]> => {
  try {
    const { data, error } = await supabase
      .from("vendor_payments")
      .select("*")
      .order("due_date", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
};

// Get payments by vendor ID
export const getPaymentsByVendor = async (
  vendorId: string,
): Promise<Payment[]> => {
  try {
    const { data, error } = await supabase
      .from("vendor_payments")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("due_date", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching vendor payments:", error);
    throw error;
  }
};

// Create a new payment
export const createPayment = async (
  paymentData: PaymentFormData,
): Promise<Payment> => {
  try {
    const { data, error } = await supabase
      .from("vendor_payments")
      .insert([paymentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

// Update a payment
export const updatePayment = async (
  id: string,
  paymentData: Partial<PaymentFormData>,
): Promise<Payment> => {
  try {
    const { data, error } = await supabase
      .from("vendor_payments")
      .update({
        ...paymentData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating payment:", error);
    throw error;
  }
};

// Delete a payment
export const deletePayment = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("vendor_payments")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting payment:", error);
    throw error;
  }
};

// Get payment summary by vendor
export const getPaymentSummaryByVendor = async (
  vendorId: string,
): Promise<any> => {
  try {
    const payments = await getPaymentsByVendor(vendorId);

    // Calculate total contract value (sum of all payments)
    const totalContractValue = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    // Calculate paid amount
    const paidAmount = payments
      .filter((payment) => payment.status === "paid")
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate pending amount
    const pendingAmount = payments
      .filter((payment) => payment.status === "pending")
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Get upcoming payments (pending and due date in the future)
    const upcomingPayments = payments
      .filter(
        (payment) =>
          payment.status === "pending" &&
          new Date(payment.due_date) > new Date(),
      )
      .sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
      );

    // Get overdue payments (pending and due date in the past)
    const overduePayments = payments
      .filter(
        (payment) =>
          payment.status === "pending" &&
          new Date(payment.due_date) < new Date(),
      )
      .sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
      );

    return {
      totalContractValue,
      paidAmount,
      pendingAmount,
      remainingBalance: totalContractValue - paidAmount,
      paymentProgress:
        totalContractValue > 0 ? (paidAmount / totalContractValue) * 100 : 0,
      upcomingPayments,
      overduePayments,
      nextPayment: upcomingPayments[0] || null,
      isOverdue: overduePayments.length > 0,
    };
  } catch (error) {
    console.error("Error getting payment summary:", error);
    throw error;
  }
};
