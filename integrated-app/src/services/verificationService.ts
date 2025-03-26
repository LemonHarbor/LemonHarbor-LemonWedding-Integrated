import { supabase } from "@/lib/supabase";
import { Review, VerificationType } from "@/types/review";

// Verify a review
export const verifyReview = async (
  reviewId: string,
  verificationType: VerificationType,
  adminId?: string,
): Promise<Review> => {
  try {
    const { data, error } = await supabase
      .from("vendor_reviews")
      .update({
        is_verified: true,
        verification_type: verificationType,
        verification_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(adminId && { moderated_by: adminId }),
      })
      .eq("id", reviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error verifying review:", error);
    throw error;
  }
};

// Remove verification from a review
export const unverifyReview = async (reviewId: string): Promise<Review> => {
  try {
    const { data, error } = await supabase
      .from("vendor_reviews")
      .update({
        is_verified: false,
        verification_type: null,
        verification_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error removing verification from review:", error);
    throw error;
  }
};

// Check if a user has booked a vendor (for automatic verification)
export const checkUserBookedVendor = async (
  userId: string,
  vendorId: string,
): Promise<boolean> => {
  try {
    // Check if there are any appointments with this vendor
    const { data: appointments, error: appointmentsError } = await supabase
      .from("vendor_appointments")
      .select("id")
      .eq("vendor_id", vendorId)
      .eq("user_id", userId)
      .limit(1);

    if (appointmentsError) throw appointmentsError;

    // Check if there are any contracts with this vendor
    const { data: contracts, error: contractsError } = await supabase
      .from("vendor_contracts")
      .select("id")
      .eq("vendor_id", vendorId)
      .eq("user_id", userId)
      .limit(1);

    if (contractsError) throw contractsError;

    // Check if there are any payments to this vendor
    const { data: payments, error: paymentsError } = await supabase
      .from("vendor_payments")
      .select("id")
      .eq("vendor_id", vendorId)
      .eq("user_id", userId)
      .limit(1);

    if (paymentsError) throw paymentsError;

    return (
      (appointments && appointments.length > 0) ||
      (contracts && contracts.length > 0) ||
      (payments && payments.length > 0)
    );
  } catch (error) {
    console.error("Error checking if user booked vendor:", error);
    return false;
  }
};

// Auto-verify a review based on user's booking history
export const autoVerifyReview = async (
  reviewId: string,
  userId: string,
  vendorId: string,
): Promise<Review | null> => {
  try {
    const hasBooked = await checkUserBookedVendor(userId, vendorId);

    if (!hasBooked) return null;

    // Determine verification type
    let verificationType: VerificationType = "booking";

    // Check for contracts specifically
    const { data: contracts } = await supabase
      .from("vendor_contracts")
      .select("id")
      .eq("vendor_id", vendorId)
      .eq("user_id", userId)
      .limit(1);

    if (contracts && contracts.length > 0) {
      verificationType = "contract";
    }

    return await verifyReview(reviewId, verificationType);
  } catch (error) {
    console.error("Error auto-verifying review:", error);
    return null;
  }
};

// Get all verified reviews
export const getVerifiedReviews = async (): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from("vendor_reviews")
      .select("*")
      .eq("is_verified", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching verified reviews:", error);
    throw error;
  }
};
