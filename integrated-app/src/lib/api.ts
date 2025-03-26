import { supabase } from "../../supabase/supabase";
import { Database } from "@/types/supabase";

// Task types
export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  category:
    | "general"
    | "venue"
    | "catering"
    | "decoration"
    | "attire"
    | "photography"
    | "music"
    | "transportation"
    | "accommodation"
    | "honeymoon"
    | "other";
  completed?: boolean;
  userId?: string;
}

// Guest types
export interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  rsvpStatus: "confirmed" | "declined" | "pending";
  dietaryRestrictions?: string;
  tableAssignment?: string;
  userId?: string;
}

// Table types
export interface Table {
  id: string;
  name: string;
  shape: "round" | "rectangle" | "oval";
  capacity: number;
  guests: string[];
  positionX?: number;
  positionY?: number;
  userId?: string;
}

// Guest relationship types
export interface GuestRelationship {
  id: string;
  guestId: string;
  relatedGuestId: string;
  relationshipType: "preference" | "conflict";
  userId?: string;
}

// Budget category types
export interface BudgetCategory {
  id: string;
  name: string;
  planned: number;
  actual: number;
  userId?: string;
}

// Expense types
export interface Expense {
  id: string;
  categoryId: string;
  amount: number;
  date: string;
  notes?: string;
  userId?: string;
}

// Tasks API
export const tasksApi = {
  async getTasks(): Promise<Task[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        console.error("No authenticated user found");
        return [];
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("due_date", { ascending: true });

      if (error) {
        console.error("Error fetching tasks:", error);
        return [];
      }

      return data.map((task) => ({
        id: task.id,
        title: task.title,
        dueDate: task.due_date,
        priority: task.priority as "high" | "medium" | "low",
        category: task.category as
          | "general"
          | "venue"
          | "catering"
          | "decoration"
          | "attire"
          | "photography"
          | "music"
          | "transportation"
          | "accommodation"
          | "honeymoon"
          | "other",
        completed: task.completed,
        userId: task.user_id,
      }));
    } catch (error) {
      console.error("Unexpected error fetching tasks:", error);
      return [];
    }
  },

  async createTask(task: Omit<Task, "id">): Promise<Task | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        console.error("No authenticated user found");
        return null;
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: task.title,
          due_date: task.dueDate,
          priority: task.priority,
          category: task.category || "general",
          completed: task.completed || false,
          user_id: userId,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating task:", error);
        return null;
      }

      return {
        id: data.id,
        title: data.title,
        dueDate: data.due_date,
        priority: data.priority as "high" | "medium" | "low",
        category: data.category as
          | "general"
          | "venue"
          | "catering"
          | "decoration"
          | "attire"
          | "photography"
          | "music"
          | "transportation"
          | "accommodation"
          | "honeymoon"
          | "other",
        completed: data.completed,
        userId: data.user_id,
      };
    } catch (error) {
      console.error("Unexpected error creating task:", error);
      return null;
    }
  },

  async updateTask(task: Task): Promise<Task | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        console.error("No authenticated user found");
        return null;
      }

      const { data, error } = await supabase
        .from("tasks")
        .update({
          title: task.title,
          due_date: task.dueDate,
          priority: task.priority,
          category: task.category,
          completed: task.completed,
          updated_at: new Date(),
        })
        .eq("id", task.id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating task:", error);
        return null;
      }

      return {
        id: data.id,
        title: data.title,
        dueDate: data.due_date,
        priority: data.priority as "high" | "medium" | "low",
        category: data.category as
          | "general"
          | "venue"
          | "catering"
          | "decoration"
          | "attire"
          | "photography"
          | "music"
          | "transportation"
          | "accommodation"
          | "honeymoon"
          | "other",
        completed: data.completed,
        userId: data.user_id,
      };
    } catch (error) {
      console.error("Unexpected error updating task:", error);
      return null;
    }
  },

  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        console.error("No authenticated user found");
        return false;
      }

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error deleting task:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Unexpected error deleting task:", error);
      return false;
    }
  },

  // Mock data for development/testing
  getMockTasks(): Task[] {
    return [
      {
        id: "1",
        title: "Book venue",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        priority: "high",
        category: "venue",
        completed: false,
      },
      {
        id: "2",
        title: "Send invitations",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        priority: "medium",
        category: "general",
        completed: false,
      },
      {
        id: "3",
        title: "Order flowers",
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        priority: "medium",
        category: "decoration",
        completed: false,
      },
      {
        id: "4",
        title: "Confirm catering menu",
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        priority: "high",
        category: "catering",
        completed: true,
      },
      {
        id: "5",
        title: "Book photographer",
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        priority: "medium",
        category: "photography",
        completed: true,
      },
    ];
  },
};

// Guests API
export const guestsApi = {
  async getGuests(): Promise<Guest[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        console.error("No authenticated user found");
        return [];
      }

      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("user_id", userId)
        .order("name");

      if (error) {
        console.error("Error fetching guests:", error);
        return [];
      }

      return data.map((guest) => ({
        id: guest.id,
        name: guest.name,
        email: guest.email || "",
        phone: guest.phone,
        rsvpStatus: guest.rsvp_status as "confirmed" | "declined" | "pending",
        dietaryRestrictions: guest.dietary_restrictions,
        tableAssignment: guest.table_assignment,
        userId: guest.user_id,
      }));
    } catch (error) {
      console.error("Unexpected error fetching guests:", error);
      return [];
    }
  },

  async createGuest(guest: Omit<Guest, "id">): Promise<Guest | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        console.error("No authenticated user found");
        return null;
      }

      const { data, error } = await supabase
        .from("guests")
        .insert({
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          rsvp_status: guest.rsvpStatus,
          dietary_restrictions: guest.dietaryRestrictions,
          table_assignment: guest.tableAssignment,
          user_id: userId,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating guest:", error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email || "",
        phone: data.phone,
        rsvpStatus: data.rsvp_status as "confirmed" | "declined" | "pending",
        dietaryRestrictions: data.dietary_restrictions,
        tableAssignment: data.table_assignment,
        userId: data.user_id,
      };
    } catch (error) {
      console.error("Unexpected error creating guest:", error);
      return null;
    }
  },

  async updateGuest(guest: Guest): Promise<Guest | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        console.error("No authenticated user found");
        return null;
      }

      const { data, error } = await supabase
        .from("guests")
        .update({
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          rsvp_status: guest.rsvpStatus,
          dietary_restrictions: guest.dietaryRestrictions,
          table_assignment: guest.tableAssignment,
          updated_at: new Date(),
        })
        .eq("id", guest.id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating guest:", error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email || "",
        phone: data.phone,
        rsvpStatus: data.rsvp_status as "confirmed" | "declined" | "pending",
        dietaryRestrictions: data.dietary_restrictions,
        tableAssignment: data.table_assignment,
        userId: data.user_id,
      };
    } catch (error) {
      console.error("Unexpected error updating guest:", error);
      return null;
    }
  },

  async deleteGuest(guestId: string): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        console.error("No authenticated user found");
        return false;
      }

      const { error } = await supabase
        .from("guests")
        .delete()
        .eq("id", guestId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error deleting guest:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Unexpected error deleting guest:", error);
      return false;
    }
  },

  async importGuests(guests: Omit<Guest, "id" | "userId">[]): Promise<Guest[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        console.error("No user ID found for importing guests");
        return [];
      }

      const guestsToInsert = guests.map((guest) => ({
        name: guest.name,
        email: guest.email,
        phone: guest.phone,
        rsvp_status: guest.rsvpStatus,
        dietary_restrictions: guest.dietaryRestrictions,
        table_assignment: guest.tableAssignment,
        user_id: userId,
      }));

      const { data, error } = await supabase
        .from("guests")
        .insert(guestsToInsert)
        .select();

      if (error) {
        console.error("Error importing guests:", error);
        return [];
      }

      return data.map((guest) => ({
        id: guest.id,
        name: guest.name,
        email: guest.email || "",
        phone: guest.phone,
        rsvpStatus: guest.rsvp_status as "confirmed" | "declined" | "pending",
        dietaryRestrictions: guest.dietary_restrictions,
        tableAssignment: guest.table_assignment,
        userId: guest.user_id,
      }));
    } catch (error) {
      console.error("Unexpected error importing guests:", error);
      return [];
    }
  },

  async sendRsvpReminders(guestIds: string[]): Promise<boolean> {
    try {
      // Validate input
      if (!guestIds || guestIds.length === 0) {
        console.error("No guest IDs provided for sending reminders");
        return false;
      }

      // Get authentication token
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();
      const authHeader = session?.session?.access_token;

      if (sessionError || !authHeader) {
        console.error(
          "Authentication error:",
          sessionError || "No token found",
        );
        return false;
      }

      // Call the Edge Function to send reminders with proper error handling
      const response = await supabase.functions.invoke("send_rsvp_reminders", {
        body: { guestIds },
        headers: {
          Authorization: `Bearer ${authHeader}`,
          "Content-Type": "application/json",
        },
      });

      if (response.error) {
        console.error("Error sending RSVP reminders:", response.error);
        throw new Error(response.error.message || "Failed to send reminders");
      }

      // Log success for debugging
      console.log(`Successfully sent reminders to ${guestIds.length} guests`);

      // Create entries in email_logs table for tracking
      await this.logEmailReminders(guestIds, "rsvp_reminder");

      return true;
    } catch (error) {
      console.error("Unexpected error sending RSVP reminders:", error);
      throw error; // Re-throw to allow proper error handling in the component
    }
  },

  /**
   * Helper method to log email reminders in the database
   * @param guestIds Array of guest IDs who received emails
   * @param emailType Type of email sent
   * @returns Promise resolving to true if successful
   */
  async logEmailReminders(
    guestIds: string[],
    emailType: string,
  ): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        console.error("No authenticated user found for logging emails");
        return false;
      }

      const emailLogs = guestIds.map((guestId) => ({
        guest_id: guestId,
        email_type: emailType,
        sent_at: new Date(),
        user_id: userId,
        status: "sent",
      }));

      // Insert logs in batches to avoid potential size limitations
      const batchSize = 50;
      for (let i = 0; i < emailLogs.length; i += batchSize) {
        const batch = emailLogs.slice(i, i + batchSize);
        const { error } = await supabase.from("email_logs").insert(batch);

        if (error) {
          console.error("Error logging email reminders:", error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Unexpected error logging email reminders:", error);
      return false;
    }
  },

  async getRsvpStats(): Promise<RsvpStats> {
    try {
      const guests = await this.getGuests();

      // Calculate RSVP statistics
      const stats = {
        attending: 0,
        declined: 0,
        pending: 0,
        total: guests.length,
      };

      // Count guests by RSVP status
      guests.forEach((guest) => {
        switch (guest.rsvpStatus) {
          case "confirmed":
            stats.attending++;
            break;
          case "declined":
            stats.declined++;
            break;
          case "pending":
            stats.pending++;
            break;
        }
      });

      return stats;
    } catch (error) {
      console.error("Error fetching RSVP stats:", error);
      return {
        attending: 0,
        declined: 0,
        pending: 0,
        total: 0,
      };
    }
  },

  async getEmailLogs(guestId?: string): Promise<any[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        console.error("No authenticated user found");
        return [];
      }

      let query = supabase
        .from("email_logs")
        .select("*, guests(name, email)")
        .eq("user_id", userId)
        .order("sent_at", { ascending: false });

      if (guestId) {
        query = query.eq("guest_id", guestId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching email logs:", error);
        return [];
      }

      return data;
    } catch (error) {
      console.error("Unexpected error fetching email logs:", error);
      return [];
    }
  },
};

// Tables API
export const tablesApi = {
  async getTables(): Promise<Table[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        console.error("No authenticated user found");
        return [];
      }

      const { data: tablesData, error: tablesError } = await supabase
        .from("tables")
        .select("*")
        .eq("user_id", userId);

      if (tablesError) {
        console.error("Error fetching tables:", tablesError);
        return [];
      }

      // Get all guests with table assignments for this user
      const { data: guestsData, error: guestsError } = await supabase
        .from("guests")
        .select("id, table_assignment")
        .eq("user_id", userId)
        .not("table_assignment", "is", null);

      if (guestsError) {
        console.error("Error fetching guests for tables:", guestsError);
        return [];
      }

      // Group guests by table assignment
      const guestsByTable: Record<string, string[]> = {};
      guestsData.forEach((guest) => {
        if (guest.table_assignment) {
          if (!guestsByTable[guest.table_assignment]) {
            guestsByTable[guest.table_assignment] = [];
          }
          guestsByTable[guest.table_assignment].push(guest.id);
        }
      });

      return tablesData.map((table) => ({
        id: table.id,
        name: table.name,
        shape: table.shape as "round" | "rectangle" | "oval",
        capacity: table.capacity,
        positionX: table.position_x,
        positionY: table.position_y,
        guests: guestsByTable[table.name] || [],
        userId: table.user_id,
      }));
    } catch (error) {
      console.error("Unexpected error fetching tables:", error);
      return [];
    }
  },

  async createTable(
    table: Omit<Table, "id" | "guests">,
  ): Promise<Table | null> {
    const { data, error } = await supabase
      .from("tables")
      .insert({
        name: table.name,
        shape: table.shape,
        capacity: table.capacity,
        user_id: supabase.auth.getUser().then((res) => res.data.user?.id),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating table:", error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      shape: data.shape as "round" | "rectangle" | "oval",
      capacity: data.capacity,
      guests: [],
      userId: data.user_id,
    };
  },

  async updateTable(table: Omit<Table, "guests">): Promise<Table | null> {
    const { data, error } = await supabase
      .from("tables")
      .update({
        name: table.name,
        shape: table.shape,
        capacity: table.capacity,
        position_x: table.positionX,
        position_y: table.positionY,
        updated_at: new Date(),
      })
      .eq("id", table.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating table:", error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      shape: data.shape as "round" | "rectangle" | "oval",
      capacity: data.capacity,
      positionX: data.position_x,
      positionY: data.position_y,
      guests: [], // We'll need to fetch guests separately
      userId: data.user_id,
    };
  },

  async deleteTable(tableId: string): Promise<boolean> {
    const { error } = await supabase.from("tables").delete().eq("id", tableId);

    if (error) {
      console.error("Error deleting table:", error);
      return false;
    }

    return true;
  },

  async assignGuestToTable(
    guestId: string,
    tableName: string,
  ): Promise<boolean> {
    const { error } = await supabase
      .from("guests")
      .update({ table_assignment: tableName })
      .eq("id", guestId);

    if (error) {
      console.error("Error assigning guest to table:", error);
      return false;
    }

    return true;
  },

  async removeGuestFromTable(guestId: string): Promise<boolean> {
    const { error } = await supabase
      .from("guests")
      .update({ table_assignment: null })
      .eq("id", guestId);

    if (error) {
      console.error("Error removing guest from table:", error);
      return false;
    }

    return true;
  },
};

// Guest relationships API
export const guestRelationshipsApi = {
  async getGuestRelationships(): Promise<GuestRelationship[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        console.error("No authenticated user found");
        return [];
      }

      const { data, error } = await supabase
        .from("guest_relationships")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching guest relationships:", error);
        return [];
      }

      return data.map((relationship) => ({
        id: relationship.id,
        guestId: relationship.guest_id,
        relatedGuestId: relationship.related_guest_id,
        relationshipType: relationship.relationship_type as
          | "preference"
          | "conflict",
        userId: relationship.user_id,
      }));
    } catch (error) {
      console.error("Unexpected error fetching guest relationships:", error);
      return [];
    }
  },

  async createGuestRelationship(
    relationship: Omit<GuestRelationship, "id">,
  ): Promise<GuestRelationship | null> {
    const { data, error } = await supabase
      .from("guest_relationships")
      .insert({
        guest_id: relationship.guestId,
        related_guest_id: relationship.relatedGuestId,
        relationship_type: relationship.relationshipType,
        user_id: supabase.auth.getUser().then((res) => res.data.user?.id),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating guest relationship:", error);
      return null;
    }

    return {
      id: data.id,
      guestId: data.guest_id,
      relatedGuestId: data.related_guest_id,
      relationshipType: data.relationship_type as "preference" | "conflict",
      userId: data.user_id,
    };
  },

  async deleteGuestRelationship(relationshipId: string): Promise<boolean> {
    const { error } = await supabase
      .from("guest_relationships")
      .delete()
      .eq("id", relationshipId);

    if (error) {
      console.error("Error deleting guest relationship:", error);
      return false;
    }

    return true;
  },
};

// Budget categories API
export const budgetApi = {
  async getExpenses(): Promise<Expense[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        console.error("No authenticated user found");
        return [];
      }

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching expenses:", error);
        return [];
      }

      return data.map((expense) => ({
        id: expense.id,
        categoryId: expense.category_id,
        amount: parseFloat(expense.amount),
        date: expense.date,
        notes: expense.notes,
        userId: expense.user_id,
      }));
    } catch (error) {
      console.error("Unexpected error fetching expenses:", error);
      return [];
    }
  },

  async createExpense(expense: Omit<Expense, "id">): Promise<Expense | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        console.error("No authenticated user found");
        return null;
      }

      const { data, error } = await supabase
        .from("expenses")
        .insert({
          category_id: expense.categoryId,
          amount: expense.amount,
          date: expense.date,
          notes: expense.notes,
          user_id: userId,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating expense:", error);
        return null;
      }

      // Update the actual amount in the budget category
      const { data: categoryData, error: categoryError } = await supabase
        .from("budget_categories")
        .select("actual_amount")
        .eq("id", expense.categoryId)
        .single();

      if (categoryError) {
        console.error("Error fetching category for update:", categoryError);
        return null;
      }

      const currentActual = parseFloat(categoryData.actual_amount);
      const newActual = currentActual + expense.amount;

      const { error: updateError } = await supabase
        .from("budget_categories")
        .update({ actual_amount: newActual })
        .eq("id", expense.categoryId);

      if (updateError) {
        console.error("Error updating category actual amount:", updateError);
      }

      return {
        id: data.id,
        categoryId: data.category_id,
        amount: parseFloat(data.amount),
        date: data.date,
        notes: data.notes,
        userId: data.user_id,
      };
    } catch (error) {
      console.error("Unexpected error creating expense:", error);
      return null;
    }
  },

  async deleteExpense(
    expenseId: string,
    categoryId: string,
    amount: number,
  ): Promise<boolean> {
    try {
      // First, update the category's actual amount by subtracting the expense amount
      const { data: categoryData, error: categoryError } = await supabase
        .from("budget_categories")
        .select("actual_amount")
        .eq("id", categoryId)
        .single();

      if (categoryError) {
        console.error("Error fetching category for update:", categoryError);
        return false;
      }

      const currentActual = parseFloat(categoryData.actual_amount);
      const newActual = Math.max(0, currentActual - amount); // Ensure we don't go below 0

      const { error: updateError } = await supabase
        .from("budget_categories")
        .update({ actual_amount: newActual })
        .eq("id", categoryId);

      if (updateError) {
        console.error("Error updating category actual amount:", updateError);
        return false;
      }

      // Then delete the expense
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

      if (error) {
        console.error("Error deleting expense:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Unexpected error deleting expense:", error);
      return false;
    }
  },

  async getBudgetCategories(): Promise<BudgetCategory[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        console.error("No authenticated user found");
        return [];
      }

      const { data, error } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("user_id", userId)
        .order("name");

      if (error) {
        console.error("Error fetching budget categories:", error);
        return [];
      }

      return data.map((category) => ({
        id: category.id,
        name: category.name,
        planned: parseFloat(category.planned_amount),
        actual: parseFloat(category.actual_amount),
        userId: category.user_id,
      }));
    } catch (error) {
      console.error("Unexpected error fetching budget categories:", error);
      return [];
    }
  },

  async createBudgetCategory(
    category: Omit<BudgetCategory, "id">,
  ): Promise<BudgetCategory | null> {
    const { data, error } = await supabase
      .from("budget_categories")
      .insert({
        name: category.name,
        planned_amount: category.planned,
        actual_amount: category.actual,
        user_id: supabase.auth.getUser().then((res) => res.data.user?.id),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating budget category:", error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      planned: parseFloat(data.planned_amount),
      actual: parseFloat(data.actual_amount),
      userId: data.user_id,
    };
  },

  async updateBudgetCategory(
    category: BudgetCategory,
  ): Promise<BudgetCategory | null> {
    const { data, error } = await supabase
      .from("budget_categories")
      .update({
        name: category.name,
        planned_amount: category.planned,
        actual_amount: category.actual,
        updated_at: new Date(),
      })
      .eq("id", category.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating budget category:", error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      planned: parseFloat(data.planned_amount),
      actual: parseFloat(data.actual_amount),
      userId: data.user_id,
    };
  },

  async deleteBudgetCategory(categoryId: string): Promise<boolean> {
    const { error } = await supabase
      .from("budget_categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      console.error("Error deleting budget category:", error);
      return false;
    }

    return true;
  },
};
