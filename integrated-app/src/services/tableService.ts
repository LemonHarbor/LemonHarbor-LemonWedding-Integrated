import { supabase, tablesQuery, seatsQuery } from "@/lib/supabase";
import { RealtimeTable, RealtimeSeat } from "@/lib/realtime";

export interface TableFormData {
  name: string;
  shape: "round" | "rectangle" | "custom";
  capacity: number;
  location?: string;
  notes?: string;
  groupId?: string;
}

export interface GroupData {
  name: string;
  color: string;
  type: string;
}

// Create a new table with seats
export async function createTable(tableData: TableFormData) {
  try {
    // First create the table
    const { data: tableResult, error: tableError } = await tablesQuery.create({
      name: tableData.name,
      shape: tableData.shape,
      capacity: tableData.capacity,
      position: { x: 400, y: 300 }, // Default position
      dimensions:
        tableData.shape === "round"
          ? { width: 200, height: 200 }
          : { width: 300, height: 150 },
      rotation: 0,
    });

    if (tableError) throw tableError;
    const newTable = tableResult[0];

    // Then create seats for the table
    const seats = Array.from({ length: tableData.capacity }, (_, i) => ({
      table_id: newTable.id,
      position: { x: 0, y: 0 }, // Position will be calculated in the frontend
    }));

    const { data: seatsResult, error: seatsError } =
      await seatsQuery.create(seats);

    if (seatsError) throw seatsError;

    return { table: newTable, seats: seatsResult };
  } catch (error) {
    console.error("Error creating table:", error);
    throw error;
  }
}

// Update an existing table
export async function updateTable(id: string, tableData: TableFormData) {
  try {
    // Update the table
    const { data: tableResult, error: tableError } = await tablesQuery.update(
      id,
      {
        name: tableData.name,
        shape: tableData.shape,
        capacity: tableData.capacity,
        updated_at: new Date(),
      },
    );

    if (tableError) throw tableError;

    // Get current seats
    const { data: currentSeats, error: seatsQueryError } =
      await seatsQuery.getByTableId(id);

    if (seatsQueryError) throw seatsQueryError;

    // If capacity increased, add more seats
    if (tableData.capacity > currentSeats.length) {
      const newSeats = Array.from(
        { length: tableData.capacity - currentSeats.length },
        (_, i) => ({
          table_id: id,
          position: { x: 0, y: 0 }, // Position will be calculated in the frontend
        }),
      );

      if (newSeats.length > 0) {
        const { error: insertError } = await seatsQuery.create(newSeats);

        if (insertError) throw insertError;
      }
    }
    // If capacity decreased, remove excess seats (preferably empty ones first)
    else if (tableData.capacity < currentSeats.length) {
      // Sort seats: empty seats first, then by creation date (newest first)
      const sortedSeats = [...currentSeats].sort((a, b) => {
        // Empty seats first
        if (!a.guest_id && b.guest_id) return -1;
        if (a.guest_id && !b.guest_id) return 1;
        // Then by creation date (newest first)
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      // Get IDs of seats to remove
      const seatsToRemove = sortedSeats
        .slice(tableData.capacity)
        .map((seat) => seat.id);

      if (seatsToRemove.length > 0) {
        // Delete each seat individually
        for (const seatId of seatsToRemove) {
          const { error: deleteError } = await seatsQuery.delete(seatId);
          if (deleteError) throw deleteError;
        }
      }
    }

    return tableResult[0];
  } catch (error) {
    console.error("Error updating table:", error);
    throw error;
  }
}

// Update table position and rotation
export async function updateTablePosition(
  id: string,
  position: { x: number; y: number },
  rotation: number,
) {
  try {
    const { data, error } = await tablesQuery.updatePosition(
      id,
      position,
      rotation,
    );

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error updating table position:", error);
    throw error;
  }
}

// Delete a table (will cascade delete seats)
export async function deleteTable(id: string) {
  try {
    const { error } = await tablesQuery.delete(id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting table:", error);
    throw error;
  }
}

// Get all tables with their seats
export async function getAllTables() {
  try {
    const { data: tables, error: tablesError } = await tablesQuery.getAll();

    if (tablesError) throw tablesError;

    const { data: seats, error: seatsError } = await seatsQuery.getAll();

    if (seatsError) throw seatsError;

    // Group seats by table_id
    const seatsByTable = seats.reduce((acc, seat) => {
      if (!acc[seat.table_id]) {
        acc[seat.table_id] = [];
      }
      acc[seat.table_id].push(seat);
      return acc;
    }, {});

    // Add seats to each table
    const tablesWithSeats = tables.map((table) => ({
      ...table,
      seats: seatsByTable[table.id] || [],
    }));

    return tablesWithSeats;
  } catch (error) {
    console.error("Error fetching tables:", error);
    throw error;
  }
}

// Assign a guest to a seat
export async function assignGuestToSeat(seatId: string, guestId: string) {
  try {
    // First check if the guest is already assigned to another seat
    const { data: existingSeats, error: checkError } = await supabase
      .from("seats")
      .select("id")
      .eq("guest_id", guestId);

    if (checkError) throw checkError;

    // If guest is already assigned, remove them from that seat
    if (existingSeats && existingSeats.length > 0) {
      for (const seat of existingSeats) {
        const { error: clearError } = await seatsQuery.removeGuest(seat.id);
        if (clearError) throw clearError;
      }
    }

    // Now assign the guest to the new seat
    const { data, error } = await seatsQuery.assignGuest(seatId, guestId);

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error assigning guest to seat:", error);
    throw error;
  }
}

// Remove a guest from a seat
export async function removeGuestFromSeat(seatId: string) {
  try {
    const { data, error } = await seatsQuery.removeGuest(seatId);

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error removing guest from seat:", error);
    throw error;
  }
}

// Group management functions
export async function createGroup(groupData: GroupData) {
  try {
    const { data, error } = await supabase
      .from("guest_groups")
      .insert([
        {
          name: groupData.name,
          color: groupData.color,
          type: groupData.type,
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
}

export async function getAllGroups() {
  try {
    const { data, error } = await supabase
      .from("guest_groups")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw error;
  }
}

export async function deleteGroup(groupId: string) {
  try {
    // First, unassign this group from any tables
    const { error: updateError } = await supabase
      .from("tables")
      .update({ group_id: null })
      .eq("group_id", groupId);

    if (updateError) throw updateError;

    // Then delete the group
    const { error } = await supabase
      .from("guest_groups")
      .delete()
      .eq("id", groupId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
}

export async function assignTableToGroup(
  tableId: string,
  groupId: string | null,
) {
  try {
    const { data, error } = await supabase
      .from("tables")
      .update({ group_id: groupId })
      .eq("id", tableId)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error assigning table to group:", error);
    throw error;
  }
}
