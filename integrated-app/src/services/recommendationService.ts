import { supabase } from "@/lib/supabase";
import { Vendor } from "@/types/vendor";
import { getVendorsByCategory } from "./vendorService";
import { getVendorAverageRating } from "./reviewService";

export interface VendorPreferences {
  budget?: { min: number; max: number };
  categories?: string[];
  style?: string[];
  rating?: number;
}

// Get recommended vendors based on user preferences
export const getRecommendedVendors = async (
  preferences: VendorPreferences,
  limit: number = 6,
): Promise<Vendor[]> => {
  try {
    // Start with a base query
    let query = supabase.from("vendors").select("*").eq("status", "active");

    // Apply category filter if specified
    if (preferences.categories && preferences.categories.length > 0) {
      query = query.in("category", preferences.categories);
    }

    // Fetch vendors
    const { data, error } = await query.limit(limit * 2); // Fetch more to allow for rating filtering

    if (error) throw error;

    // Apply additional filters that can't be done in the query
    let filteredVendors = data || [];

    // Get ratings for all vendors
    const vendorsWithRatings: Array<{ vendor: Vendor; rating: number }> = [];

    for (const vendor of filteredVendors) {
      const rating = await getVendorAverageRating(vendor.id);
      vendorsWithRatings.push({ vendor, rating });
    }

    // Filter by rating if specified
    if (preferences.rating && preferences.rating > 0) {
      vendorsWithRatings.filter((item) => item.rating >= preferences.rating);
    }

    // Sort by rating (highest first)
    vendorsWithRatings.sort((a, b) => b.rating - a.rating);

    // Extract just the vendors from the sorted array
    const sortedVendors = vendorsWithRatings.map((item) => item.vendor);

    return sortedVendors.slice(0, limit);
  } catch (error) {
    console.error("Error getting recommended vendors:", error);
    throw error;
  }
};

// Get similar vendors to a specific vendor
export const getSimilarVendors = async (
  vendorId: string,
  limit: number = 3,
): Promise<Vendor[]> => {
  try {
    // Get the original vendor
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("*")
      .eq("id", vendorId)
      .single();

    if (vendorError) throw vendorError;

    // Get vendors in the same category
    const similarVendors = await getVendorsByCategory(vendor.category);

    // Filter out the original vendor
    const filteredVendors = similarVendors.filter((v) => v.id !== vendorId);

    // Get ratings for all vendors
    const vendorsWithRatings: Array<{ vendor: Vendor; rating: number }> = [];

    for (const vendor of filteredVendors) {
      const rating = await getVendorAverageRating(vendor.id);
      vendorsWithRatings.push({ vendor, rating });
    }

    // Sort by rating (highest first)
    vendorsWithRatings.sort((a, b) => b.rating - a.rating);

    // Extract just the vendors from the sorted array
    const sortedVendors = vendorsWithRatings.map((item) => item.vendor);

    return sortedVendors.slice(0, limit);
  } catch (error) {
    console.error("Error getting similar vendors:", error);
    throw error;
  }
};

// Get popular vendors by category
export const getPopularVendorsByCategory = async (
  category: string,
  limit: number = 3,
): Promise<Vendor[]> => {
  try {
    // Get vendors in the category
    const vendors = await getVendorsByCategory(category);

    // Get ratings for all vendors
    const vendorsWithRatings: Array<{ vendor: Vendor; rating: number }> = [];

    for (const vendor of vendors) {
      const rating = await getVendorAverageRating(vendor.id);
      vendorsWithRatings.push({ vendor, rating });
    }

    // Sort by rating (highest first)
    vendorsWithRatings.sort((a, b) => b.rating - a.rating);

    // Extract just the vendors from the sorted array
    const sortedVendors = vendorsWithRatings.map((item) => item.vendor);

    return sortedVendors.slice(0, limit);
  } catch (error) {
    console.error("Error getting popular vendors by category:", error);
    throw error;
  }
};
