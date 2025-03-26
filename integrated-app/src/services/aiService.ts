import { supabase } from "@/lib/supabase";
import { Guest } from "@/types/guest";
import { Table } from "@/types/table";
import { Seat } from "@/types/seat";

// Define types for optimization parameters
export interface OptimizationParams {
  prioritizeFamilies?: boolean;
  avoidConflicts?: boolean;
  balanceTables?: boolean;
  respectDietaryRestrictions?: boolean;
  keepCouplesAndFamiliesTogether?: boolean;
}

// Define types for guest relationships
export interface GuestRelationship {
  guestId: string;
  relatedGuestId: string;
  relationshipType: "family" | "friend" | "couple" | "conflict";
  strength: number; // 1-10 scale
}

// Define the result of optimization
export interface OptimizationResult {
  success: boolean;
  message: string;
  seatAssignments: {
    guestId: string;
    tableId: string;
    seatId: string;
  }[];
  score: number;
}

/**
 * Optimize seating arrangements based on guest relationships and preferences
 */
export const optimizeSeating = async (
  params: OptimizationParams = {},
): Promise<OptimizationResult> => {
  try {
    // Fetch all guests, tables, seats, and relationships from the database
    const { data: guests, error: guestsError } = await supabase
      .from("guests")
      .select("*")
      .eq("rsvp_status", "confirmed");

    if (guestsError) throw guestsError;

    const { data: tables, error: tablesError } = await supabase
      .from("tables")
      .select("*");

    if (tablesError) throw tablesError;

    const { data: seats, error: seatsError } = await supabase
      .from("seats")
      .select("*");

    if (seatsError) throw seatsError;

    // Fetch guest relationships from the database
    const relationships = await getGuestRelationships(guests);

    // Run the optimization algorithm
    const result = runOptimizationAlgorithm(
      guests,
      tables,
      seats,
      relationships,
      params,
    );

    // Apply the optimized seating arrangement to the database
    await applySeatingArrangement(result.seatAssignments);

    return result;
  } catch (error) {
    console.error("Seating optimization error:", error);
    return {
      success: false,
      message: `Optimization failed: ${error.message}`,
      seatAssignments: [],
      score: 0,
    };
  }
};

/**
 * Get relationships between guests from the database
 */
const getGuestRelationships = async (
  guests: any[],
): Promise<GuestRelationship[]> => {
  try {
    // Fetch relationships from the database
    const { data, error } = await supabase
      .from("guest_relationships")
      .select("*");

    if (error) throw error;

    // Map database relationships to the format expected by the optimization algorithm
    const relationships: GuestRelationship[] = data.map((rel) => ({
      guestId: rel.guest_id,
      relatedGuestId: rel.related_guest_id,
      relationshipType: rel.relationship_type as
        | "family"
        | "friend"
        | "couple"
        | "conflict",
      strength: rel.strength,
    }));

    return relationships;
  } catch (error) {
    console.error("Error fetching guest relationships:", error);

    // Fallback to generating sample relationships if database fetch fails
    return generateSampleRelationships(guests);
  }
};

/**
 * Generate sample relationships between guests for demonstration purposes
 * This is used as a fallback if no relationships are defined in the database
 */
const generateSampleRelationships = (guests: any[]): GuestRelationship[] => {
  const relationships: GuestRelationship[] = [];

  // Group guests by category (family, friends, etc.)
  const familyGuests = guests.filter((g) => g.category === "family");
  const friendGuests = guests.filter((g) => g.category === "friend");
  const colleagueGuests = guests.filter((g) => g.category === "colleague");

  // Create family relationships (stronger bonds)
  for (let i = 0; i < familyGuests.length; i++) {
    for (let j = i + 1; j < familyGuests.length; j++) {
      relationships.push({
        guestId: familyGuests[i].id,
        relatedGuestId: familyGuests[j].id,
        relationshipType: "family",
        strength: Math.floor(Math.random() * 5) + 6, // 6-10 strength
      });
    }
  }

  // Create friend relationships (medium bonds)
  for (let i = 0; i < friendGuests.length; i++) {
    for (let j = i + 1; j < friendGuests.length; j++) {
      if (Math.random() > 0.3) {
        // Not all friends know each other
        relationships.push({
          guestId: friendGuests[i].id,
          relatedGuestId: friendGuests[j].id,
          relationshipType: "friend",
          strength: Math.floor(Math.random() * 5) + 3, // 3-7 strength
        });
      }
    }
  }

  // Create some couples (strongest bonds)
  const potentialCouples = [...familyGuests, ...friendGuests];
  for (let i = 0; i < potentialCouples.length; i += 2) {
    if (i + 1 < potentialCouples.length && Math.random() > 0.7) {
      relationships.push({
        guestId: potentialCouples[i].id,
        relatedGuestId: potentialCouples[i + 1].id,
        relationshipType: "couple",
        strength: 10, // Maximum strength
      });
    }
  }

  // Create some conflicts (negative relationships)
  for (let i = 0; i < guests.length; i++) {
    for (let j = i + 1; j < guests.length; j++) {
      if (Math.random() > 0.95) {
        // 5% chance of conflict
        relationships.push({
          guestId: guests[i].id,
          relatedGuestId: guests[j].id,
          relationshipType: "conflict",
          strength: Math.floor(Math.random() * 5) + 1, // 1-5 strength (of conflict)
        });
      }
    }
  }

  return relationships;
};

/**
 * Run the optimization algorithm to find the best seating arrangement
 */
const runOptimizationAlgorithm = (
  guests: any[],
  tables: any[],
  seats: any[],
  relationships: GuestRelationship[],
  params: OptimizationParams,
): OptimizationResult => {
  // Initialize variables for the algorithm
  let bestArrangement: { guestId: string; tableId: string; seatId: string }[] =
    [];
  let bestScore = -Infinity;

  // Create a map of available seats per table
  const tableSeats = new Map<string, string[]>();
  tables.forEach((table) => {
    const tableId = table.id;
    const tableSeatsArray = seats
      .filter((seat) => seat.table_id === tableId)
      .map((seat) => seat.id);
    tableSeats.set(tableId, tableSeatsArray);
  });

  // Create a copy of guests to work with
  const guestsToAssign = [...guests];

  // Sort guests by priority (couples first, then families, then friends)
  if (params.keepCouplesAndFamiliesTogether) {
    // Find couples based on relationships
    const coupleRelationships = relationships.filter(
      (r) => r.relationshipType === "couple",
    );
    const coupleIds = new Set<string>();
    coupleRelationships.forEach((r) => {
      coupleIds.add(r.guestId);
      coupleIds.add(r.relatedGuestId);
    });

    // Sort so couples are adjacent in the array
    guestsToAssign.sort((a, b) => {
      const aIsCouple = coupleIds.has(a.id) ? 1 : 0;
      const bIsCouple = coupleIds.has(b.id) ? 1 : 0;
      return bIsCouple - aIsCouple;
    });
  }

  // Sort by dietary restrictions if needed
  if (params.respectDietaryRestrictions) {
    guestsToAssign.sort((a, b) => {
      const aHasDietary = a.dietary_restrictions ? 1 : 0;
      const bHasDietary = b.dietary_restrictions ? 1 : 0;
      return bHasDietary - aHasDietary;
    });
  }

  // For this implementation, we'll use a greedy algorithm
  // In a real app, you might use a more sophisticated algorithm like simulated annealing
  const arrangement = assignSeatsGreedy(
    guestsToAssign,
    tables,
    tableSeats,
    relationships,
    params,
  );

  // Calculate the score of this arrangement
  const score = calculateArrangementScore(arrangement, relationships, params);

  // For demonstration purposes, we'll just return this arrangement
  return {
    success: true,
    message: "Seating optimization completed successfully",
    seatAssignments: arrangement,
    score: score,
  };
};

/**
 * Assign seats using a greedy algorithm
 */
const assignSeatsGreedy = (
  guests: any[],
  tables: any[],
  tableSeats: Map<string, string[]>,
  relationships: GuestRelationship[],
  params: OptimizationParams,
) => {
  const arrangement: { guestId: string; tableId: string; seatId: string }[] =
    [];
  const assignedGuests = new Set<string>();
  const guestTableAssignments = new Map<string, string>(); // guestId -> tableId

  // First pass: assign couples and families to the same tables
  if (params.keepCouplesAndFamiliesTogether) {
    // Find all couples
    const coupleRelationships = relationships.filter(
      (r) => r.relationshipType === "couple",
    );

    for (const coupleRel of coupleRelationships) {
      // Skip if either guest is already assigned
      if (
        assignedGuests.has(coupleRel.guestId) ||
        assignedGuests.has(coupleRel.relatedGuestId)
      ) {
        continue;
      }

      // Find a table with at least 2 seats available
      for (const [tableId, seatIds] of tableSeats.entries()) {
        if (seatIds.length >= 2) {
          // Assign both guests to this table
          const seat1 = seatIds.pop()!;
          const seat2 = seatIds.pop()!;

          arrangement.push({
            guestId: coupleRel.guestId,
            tableId,
            seatId: seat1,
          });
          arrangement.push({
            guestId: coupleRel.relatedGuestId,
            tableId,
            seatId: seat2,
          });

          assignedGuests.add(coupleRel.guestId);
          assignedGuests.add(coupleRel.relatedGuestId);

          guestTableAssignments.set(coupleRel.guestId, tableId);
          guestTableAssignments.set(coupleRel.relatedGuestId, tableId);

          break;
        }
      }
    }

    // Now handle family relationships similarly
    if (params.prioritizeFamilies) {
      const familyRelationships = relationships.filter(
        (r) => r.relationshipType === "family" && r.strength >= 8,
      );

      for (const familyRel of familyRelationships) {
        // Skip if either guest is already assigned
        if (
          assignedGuests.has(familyRel.guestId) ||
          assignedGuests.has(familyRel.relatedGuestId)
        ) {
          continue;
        }

        // Find a table with at least 2 seats available
        for (const [tableId, seatIds] of tableSeats.entries()) {
          if (seatIds.length >= 2) {
            // Assign both guests to this table
            const seat1 = seatIds.pop()!;
            const seat2 = seatIds.pop()!;

            arrangement.push({
              guestId: familyRel.guestId,
              tableId,
              seatId: seat1,
            });
            arrangement.push({
              guestId: familyRel.relatedGuestId,
              tableId,
              seatId: seat2,
            });

            assignedGuests.add(familyRel.guestId);
            assignedGuests.add(familyRel.relatedGuestId);

            guestTableAssignments.set(familyRel.guestId, tableId);
            guestTableAssignments.set(familyRel.relatedGuestId, tableId);

            break;
          }
        }
      }
    }
  }

  // Second pass: assign remaining guests
  for (const guest of guests) {
    // Skip already assigned guests
    if (assignedGuests.has(guest.id)) {
      continue;
    }

    // Find the best table for this guest
    let bestTableId = null;
    let bestScore = -Infinity;

    for (const [tableId, seatIds] of tableSeats.entries()) {
      if (seatIds.length === 0) continue; // Skip full tables

      // Calculate score for placing this guest at this table
      let tableScore = 0;

      // Check relationships with guests already at this table
      for (const [
        guestId,
        assignedTableId,
      ] of guestTableAssignments.entries()) {
        if (assignedTableId === tableId) {
          // Find relationship between these guests
          const rel = relationships.find(
            (r) =>
              (r.guestId === guest.id && r.relatedGuestId === guestId) ||
              (r.guestId === guestId && r.relatedGuestId === guest.id),
          );

          if (rel) {
            if (rel.relationshipType === "conflict" && params.avoidConflicts) {
              tableScore -= rel.strength * 10; // Heavy penalty for conflicts
            } else if (rel.relationshipType !== "conflict") {
              tableScore += rel.strength;
            }
          }
        }
      }

      // Consider dietary restrictions
      if (params.respectDietaryRestrictions && guest.dietary_restrictions) {
        // In a real app, you might check if others at the table have similar restrictions
        // For now, we'll just slightly prefer less-filled tables for guests with restrictions
        tableScore +=
          (tables.find((t) => t.id === tableId)?.capacity - seatIds.length) / 2;
      }

      // Consider table balance if requested
      if (params.balanceTables) {
        // Prefer tables that are less full
        const tableCapacity =
          tables.find((t) => t.id === tableId)?.capacity || 8;
        const filledRatio = 1 - seatIds.length / tableCapacity;
        tableScore += filledRatio * 3; // Bonus for balancing tables
      }

      if (tableScore > bestScore) {
        bestScore = tableScore;
        bestTableId = tableId;
      }
    }

    // Assign guest to the best table
    if (bestTableId && tableSeats.get(bestTableId)?.length > 0) {
      const seatId = tableSeats.get(bestTableId)!.pop()!;
      arrangement.push({ guestId: guest.id, tableId: bestTableId, seatId });
      assignedGuests.add(guest.id);
      guestTableAssignments.set(guest.id, bestTableId);
    }
  }

  return arrangement;
};

/**
 * Calculate a score for a given seating arrangement
 */
const calculateArrangementScore = (
  arrangement: { guestId: string; tableId: string; seatId: string }[],
  relationships: GuestRelationship[],
  params: OptimizationParams,
): number => {
  let score = 0;

  // Create a map of guest -> table assignments for quick lookup
  const guestTableMap = new Map<string, string>();
  arrangement.forEach((a) => guestTableMap.set(a.guestId, a.tableId));

  // Score based on relationships
  for (const rel of relationships) {
    const table1 = guestTableMap.get(rel.guestId);
    const table2 = guestTableMap.get(rel.relatedGuestId);

    if (!table1 || !table2) continue; // Skip if either guest wasn't assigned

    if (rel.relationshipType === "conflict" && params.avoidConflicts) {
      // Penalty if conflicting guests are at the same table
      if (table1 === table2) {
        score -= rel.strength * 10;
      }
    } else if (
      rel.relationshipType === "couple" &&
      params.keepCouplesAndFamiliesTogether
    ) {
      // Big bonus if couples are at the same table
      if (table1 === table2) {
        score += rel.strength * 5;
      } else {
        score -= rel.strength * 5; // Big penalty if separated
      }
    } else if (rel.relationshipType === "family" && params.prioritizeFamilies) {
      // Bonus if family members are at the same table
      if (table1 === table2) {
        score += rel.strength * 2;
      }
    } else if (rel.relationshipType === "friend") {
      // Small bonus if friends are at the same table
      if (table1 === table2) {
        score += rel.strength;
      }
    }
  }

  // Score based on table balance
  if (params.balanceTables) {
    const tableCounts = new Map<string, number>();
    arrangement.forEach((a) => {
      tableCounts.set(a.tableId, (tableCounts.get(a.tableId) || 0) + 1);
    });

    // Calculate standard deviation of table counts
    const counts = Array.from(tableCounts.values());
    const avg = counts.reduce((sum, count) => sum + count, 0) / counts.length;
    const variance =
      counts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) /
      counts.length;
    const stdDev = Math.sqrt(variance);

    // Lower standard deviation means more balanced tables
    score -= stdDev * 5;
  }

  return score;
};

/**
 * Apply the optimized seating arrangement to the database
 */
const applySeatingArrangement = async (
  seatAssignments: { guestId: string; tableId: string; seatId: string }[],
): Promise<void> => {
  // First, clear all existing assignments
  const { error: clearError } = await supabase
    .from("seats")
    .update({ guest_id: null })
    .neq("id", "placeholder"); // Update all seats

  if (clearError) throw clearError;

  // Apply new assignments one by one
  for (const assignment of seatAssignments) {
    const { error } = await supabase
      .from("seats")
      .update({ guest_id: assignment.guestId })
      .eq("id", assignment.seatId);

    if (error) throw error;
  }
};
