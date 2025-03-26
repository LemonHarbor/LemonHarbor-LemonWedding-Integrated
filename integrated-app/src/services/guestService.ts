import { supabase, guestsQuery } from "@/lib/supabase";
import { RealtimeGuest } from "@/lib/realtime";

export interface GuestFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  category: string;
  dietaryRestrictions?: string;
  plusOne: boolean;
  rsvpStatus: string;
  notes?: string;
}

// Create a new guest
export async function createGuest(guestData: GuestFormData) {
  try {
    const { firstName, lastName, ...rest } = guestData;

    const { data, error } = await guestsQuery.create({
      name: `${firstName} ${lastName}`.trim(),
      email: rest.email,
      phone: rest.phone || null,
      category: rest.category,
      rsvp_status: rest.rsvpStatus,
      dietary_restrictions: rest.dietaryRestrictions || null,
      plus_one: rest.plusOne,
      notes: rest.notes || null,
    });

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error creating guest:", error);
    throw error;
  }
}

// Update an existing guest
export async function updateGuest(id: string, guestData: GuestFormData) {
  try {
    const { firstName, lastName, ...rest } = guestData;

    const { data, error } = await guestsQuery.update(id, {
      name: `${firstName} ${lastName}`.trim(),
      email: rest.email,
      phone: rest.phone || null,
      category: rest.category,
      rsvp_status: rest.rsvpStatus,
      dietary_restrictions: rest.dietaryRestrictions || null,
      plus_one: rest.plusOne,
      notes: rest.notes || null,
      updated_at: new Date(),
    });

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error updating guest:", error);
    throw error;
  }
}

// Delete a guest
export async function deleteGuest(id: string) {
  try {
    const { error } = await guestsQuery.delete(id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting guest:", error);
    throw error;
  }
}

// Get all guests
export async function getAllGuests() {
  try {
    const { data, error } = await guestsQuery.getAll();

    if (error) throw error;
    return data as RealtimeGuest[];
  } catch (error) {
    console.error("Error fetching guests:", error);
    throw error;
  }
}

// Get a single guest by ID
export async function getGuestById(id: string) {
  try {
    const { data, error } = await guestsQuery.getById(id);

    if (error) throw error;
    return data as RealtimeGuest;
  } catch (error) {
    console.error("Error fetching guest:", error);
    throw error;
  }
}

// Update RSVP status
export async function updateRsvpStatus(id: string, status: string) {
  try {
    const { data, error } = await guestsQuery.update(id, {
      rsvp_status: status,
      updated_at: new Date(),
    });

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error updating RSVP status:", error);
    throw error;
  }
}
