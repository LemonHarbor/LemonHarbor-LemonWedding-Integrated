import { supabase } from "@/lib/supabase";
import { Contract, ContractFormData } from "@/types/contract";

// Get all contracts
export const getContracts = async (): Promise<Contract[]> => {
  try {
    const { data, error } = await supabase
      .from("vendor_contracts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching contracts:", error);
    throw error;
  }
};

// Get contracts by vendor ID
export const getContractsByVendor = async (
  vendorId: string,
): Promise<Contract[]> => {
  try {
    const { data, error } = await supabase
      .from("vendor_contracts")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching vendor contracts:", error);
    throw error;
  }
};

// Get contract by ID
export const getContractById = async (id: string): Promise<Contract> => {
  try {
    const { data, error } = await supabase
      .from("vendor_contracts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching contract:", error);
    throw error;
  }
};

// Create a new contract
export const createContract = async (
  contractData: ContractFormData,
  file: File,
): Promise<Contract> => {
  try {
    // Upload file to storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `contracts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("vendor-files")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL for the file
    const { data: urlData } = supabase.storage
      .from("vendor-files")
      .getPublicUrl(filePath);

    // Create contract record
    const { data, error } = await supabase
      .from("vendor_contracts")
      .insert([
        {
          ...contractData,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating contract:", error);
    throw error;
  }
};

// Update a contract
export const updateContract = async (
  id: string,
  contractData: Partial<ContractFormData>,
  file?: File,
): Promise<Contract> => {
  try {
    let fileData = {};

    // If a new file is provided, upload it
    if (file) {
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `contracts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("vendor-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL for the file
      const { data: urlData } = supabase.storage
        .from("vendor-files")
        .getPublicUrl(filePath);

      fileData = {
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
      };
    }

    // Update contract record
    const { data, error } = await supabase
      .from("vendor_contracts")
      .update({
        ...contractData,
        ...fileData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating contract:", error);
    throw error;
  }
};

// Delete a contract
export const deleteContract = async (id: string): Promise<boolean> => {
  try {
    // Get the contract to find the file URL
    const contract = await getContractById(id);

    // Delete the contract record
    const { error } = await supabase
      .from("vendor_contracts")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // Extract the file path from the URL
    const fileUrl = contract.file_url;
    const filePath = fileUrl.split("/").pop();

    if (filePath) {
      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from("vendor-files")
        .remove([`contracts/${filePath}`]);

      if (storageError) {
        console.error("Error deleting file from storage:", storageError);
        // Continue even if file deletion fails
      }
    }

    return true;
  } catch (error) {
    console.error("Error deleting contract:", error);
    throw error;
  }
};

// Check for expiring contracts
export const getExpiringContracts = async (
  daysThreshold: number = 30,
): Promise<Contract[]> => {
  try {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    const { data, error } = await supabase
      .from("vendor_contracts")
      .select("*")
      .eq("status", "active")
      .lte("expiration_date", thresholdDate.toISOString().split("T")[0])
      .gte("expiration_date", today.toISOString().split("T")[0])
      .order("expiration_date", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching expiring contracts:", error);
    throw error;
  }
};

// Update contract status based on expiration date
export const updateContractStatuses = async (): Promise<void> => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Update expired contracts
    const { error } = await supabase
      .from("vendor_contracts")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("status", "active")
      .lt("expiration_date", today);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating contract statuses:", error);
    throw error;
  }
};
