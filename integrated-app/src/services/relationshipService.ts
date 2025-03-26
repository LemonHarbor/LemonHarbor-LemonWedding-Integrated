import { supabase } from "@/lib/supabase";
import { GuestRelationship, RelationshipFormData } from "@/types/relationship";

// Get all relationships for a guest
export const getGuestRelationships = async (guestId: string) => {
  try {
    const { data, error } = await supabase
      .from("guest_relationships")
      .select("*")
      .or(`guest_id.eq.${guestId},related_guest_id.eq.${guestId}`);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching guest relationships:", error);
    throw error;
  }
};

// Create a new relationship between guests
export const createRelationship = async (
  relationshipData: RelationshipFormData,
) => {
  try {
    // Check if relationship already exists in either direction
    const { data: existingRelationship, error: checkError } = await supabase
      .from("guest_relationships")
      .select("*")
      .or(
        `and(guest_id.eq.${relationshipData.guest_id},related_guest_id.eq.${relationshipData.related_guest_id}),` +
          `and(guest_id.eq.${relationshipData.related_guest_id},related_guest_id.eq.${relationshipData.guest_id})`,
      )
      .maybeSingle();

    if (checkError) throw checkError;

    // If relationship exists, update it
    if (existingRelationship) {
      const { data, error } = await supabase
        .from("guest_relationships")
        .update({
          relationship_type: relationshipData.relationship_type,
          strength: relationshipData.strength,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRelationship.id)
        .select();

      if (error) throw error;
      return data[0];
    }

    // Otherwise create a new relationship
    const { data, error } = await supabase
      .from("guest_relationships")
      .insert([
        {
          guest_id: relationshipData.guest_id,
          related_guest_id: relationshipData.related_guest_id,
          relationship_type: relationshipData.relationship_type,
          strength: relationshipData.strength,
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error creating relationship:", error);
    throw error;
  }
};

// Update an existing relationship
export const updateRelationship = async (
  id: string,
  relationshipData: Partial<RelationshipFormData>,
) => {
  try {
    const { data, error } = await supabase
      .from("guest_relationships")
      .update({
        ...relationshipData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error updating relationship:", error);
    throw error;
  }
};

// Delete a relationship
export const deleteRelationship = async (id: string) => {
  try {
    const { error } = await supabase
      .from("guest_relationships")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting relationship:", error);
    throw error;
  }
};

// Get all relationships
export const getAllRelationships = async () => {
  try {
    const { data, error } = await supabase
      .from("guest_relationships")
      .select("*");

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching all relationships:", error);
    throw error;
  }
};
