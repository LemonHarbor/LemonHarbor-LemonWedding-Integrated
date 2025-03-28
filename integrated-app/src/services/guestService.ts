import { supabase } from "@/lib/supabase";
import { guestsApi } from "@/lib/api";
import type { Guest } from "@/lib/api";

export interface GuestFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  category: string;
  dietaryRestrictions?: string;
  plusOne: boolean;
  plusOneName?: string;
  rsvpStatus: "confirmed" | "declined" | "pending";
  rsvpDeadline?: Date;
  rsvpResponseDate?: Date;
  notes?: string;
}

// Create a new guest
export async function createGuest(guestData: GuestFormData) {
  try {
    const guest = await guestsApi.createGuest({
      name: `${guestData.firstName} ${guestData.lastName}`.trim(),
      email: guestData.email,
      phone: guestData.phone,
      rsvpStatus: guestData.rsvpStatus,
      dietaryRestrictions: guestData.dietaryRestrictions,
      tableAssignment: undefined,
    });

    if (!guest) throw new Error("Failed to create guest");
    return guest;
  } catch (error) {
    console.error("Error creating guest:", error);
    throw error;
  }
}

// Update an existing guest
export async function updateGuest(id: string, guestData: GuestFormData) {
  try {
    const guest = await guestsApi.updateGuest({
      id,
      name: `${guestData.firstName} ${guestData.lastName}`.trim(),
      email: guestData.email,
      phone: guestData.phone,
      rsvpStatus: guestData.rsvpStatus,
      dietaryRestrictions: guestData.dietaryRestrictions,
      tableAssignment: undefined,
    });

    if (!guest) throw new Error("Failed to update guest");
    return guest;
  } catch (error) {
    console.error("Error updating guest:", error);
    throw error;
  }
}

// Delete a guest
export async function deleteGuest(id: string) {
  try {
    return await guestsApi.deleteGuest(id);
  } catch (error) {
    console.error("Error deleting guest:", error);
    throw error;
  }
}

// Get all guests
export async function getAllGuests() {
  try {
    return await guestsApi.getGuests();
  } catch (error) {
    console.error("Error fetching guests:", error);
    throw error;
  }
}

// Get a single guest by ID
export async function getGuestById(id: string) {
  try {
    const guests = await guestsApi.getGuests();
    return guests.find(g => g.id === id) || null;
  } catch (error) {
    console.error("Error fetching guest:", error);
    throw error;
  }
}

// Update RSVP status with additional tracking
export async function updateRsvpStatus(id: string, status: "confirmed" | "declined" | "pending", responseDate: Date = new Date()) {
  try {
    const guest = await getGuestById(id);
    if (!guest) throw new Error("Guest not found");
    
    return await guestsApi.updateGuest({
      ...guest,
      rsvpStatus: status
    });
  } catch (error) {
    console.error("Error updating RSVP status:", error);
    throw error;
  }
}

// Get guests who haven't responded by deadline
export async function getPendingRsvps(deadline: Date) {
  try {
    const guests = await guestsApi.getGuests();
    return guests.filter(guest => 
      guest.rsvpStatus === "pending" && 
      guest.rsvpResponseDate && 
      new Date(guest.rsvpResponseDate) < deadline
    );
  } catch (error) {
    console.error("Error fetching pending RSVPs:", error);
    throw error;
  }
}

// Send RSVP reminder emails
export async function sendRsvpReminder(guestIds: string[]) {
  try {
    return await guestsApi.sendRsvpReminders(guestIds);
  } catch (error) {
    console.error("Error sending RSVP reminders:", error);
    throw error;
  }
}
