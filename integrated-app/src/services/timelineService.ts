import { supabase } from "@/lib/supabase";
import { addMonths, format, differenceInMonths } from "date-fns";

export interface TimelineTask {
  id: string;
  name: string;
  completed: boolean;
  skipped: boolean;
  isCustom?: boolean;
}

export interface TimelineMilestone {
  id: string;
  title: string;
  dueDate: string;
  tasks: TimelineTask[];
}

// Save timeline to the database
export const saveTimeline = async (
  weddingDate: Date,
  milestones: TimelineMilestone[],
  userId: string,
): Promise<boolean> => {
  try {
    // First, delete any existing timeline for this user
    await supabase.from("timeline_milestones").delete().eq("user_id", userId);

    // Save wedding date in user preferences
    await supabase
      .from("user_preferences")
      .upsert({
        user_id: userId,
        wedding_date: weddingDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    // Save all milestones and their tasks
    for (const milestone of milestones) {
      // Insert milestone
      const { data: milestoneData, error: milestoneError } = await supabase
        .from("timeline_milestones")
        .insert({
          id: milestone.id,
          user_id: userId,
          title: milestone.title,
          due_date: milestone.dueDate,
          created_at: new Date().toISOString(),
        })
        .select();

      if (milestoneError) throw milestoneError;

      // Insert all tasks for this milestone
      const tasksToInsert = milestone.tasks.map((task) => ({
        id: task.id,
        milestone_id: milestone.id,
        name: task.name,
        completed: task.completed,
        skipped: task.skipped,
        is_custom: task.isCustom || false,
        created_at: new Date().toISOString(),
      }));

      if (tasksToInsert.length > 0) {
        const { error: tasksError } = await supabase
          .from("timeline_tasks")
          .insert(tasksToInsert);

        if (tasksError) throw tasksError;
      }
    }

    return true;
  } catch (error) {
    console.error("Error saving timeline:", error);
    throw error;
  }
};

// Load timeline from the database
export const loadTimeline = async (
  userId: string,
): Promise<{
  weddingDate: Date | null;
  milestones: TimelineMilestone[];
}> => {
  try {
    // Get wedding date from user preferences
    const { data: prefData, error: prefError } = await supabase
      .from("user_preferences")
      .select("wedding_date")
      .eq("user_id", userId)
      .single();

    if (prefError && prefError.code !== "PGRST116") throw prefError;

    const weddingDate = prefData?.wedding_date
      ? new Date(prefData.wedding_date)
      : null;

    // Get all milestones for this user
    const { data: milestonesData, error: milestonesError } = await supabase
      .from("timeline_milestones")
      .select("*")
      .eq("user_id", userId)
      .order("due_date", { ascending: true });

    if (milestonesError) throw milestonesError;

    // Get all tasks for these milestones
    const milestoneIds = milestonesData.map((m) => m.id);
    let tasksData = [];

    if (milestoneIds.length > 0) {
      const { data, error: tasksError } = await supabase
        .from("timeline_tasks")
        .select("*")
        .in("milestone_id", milestoneIds);

      if (tasksError) throw tasksError;
      tasksData = data || [];
    }

    // Organize tasks by milestone
    const tasksByMilestone = tasksData.reduce((acc, task) => {
      if (!acc[task.milestone_id]) {
        acc[task.milestone_id] = [];
      }
      acc[task.milestone_id].push({
        id: task.id,
        name: task.name,
        completed: task.completed,
        skipped: task.skipped,
        isCustom: task.is_custom,
      });
      return acc;
    }, {});

    // Combine milestones with their tasks
    const milestones = milestonesData.map((milestone) => ({
      id: milestone.id,
      title: milestone.title,
      dueDate: milestone.due_date,
      tasks: tasksByMilestone[milestone.id] || [],
    }));

    return { weddingDate, milestones };
  } catch (error) {
    console.error("Error loading timeline:", error);
    throw error;
  }
};

// Get completed tasks for a user
export const getCompletedTasks = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("timeline_tasks")
      .select("id")
      .eq("completed", true)
      .in(
        "milestone_id",
        supabase.from("timeline_milestones").select("id").eq("user_id", userId),
      );

    if (error) throw error;
    return data.map((task) => task.id);
  } catch (error) {
    console.error("Error getting completed tasks:", error);
    return [];
  }
};

// Generate a timeline based on the wedding date and completed tasks
export const generateTimeline = async (
  weddingDate: Date,
  completedTasks: string[] = [],
): Promise<TimelineMilestone[]> => {
  // Calculate months until wedding
  const today = new Date();
  const monthsUntilWedding = differenceInMonths(weddingDate, today);

  // Determine planning timeframe
  let timeframe: "long" | "medium" | "short" = "medium";
  if (monthsUntilWedding > 12) {
    timeframe = "long";
  } else if (monthsUntilWedding >= 6) {
    timeframe = "medium";
  } else {
    timeframe = "short";
  }

  // Generate milestones based on timeframe
  const milestones = generateMilestones(weddingDate, timeframe, completedTasks);

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return milestones;
};

// Generate milestones based on timeframe
const generateMilestones = (
  weddingDate: Date,
  timeframe: "long" | "medium" | "short",
  completedTasks: string[],
): TimelineMilestone[] => {
  const milestones: TimelineMilestone[] = [];
  const today = new Date();

  // Helper function to create a milestone
  const createMilestone = (
    id: string,
    title: string,
    monthsBeforeWedding: number,
    tasks: { id: string; name: string }[],
  ): TimelineMilestone => {
    const dueDate = addMonths(weddingDate, -monthsBeforeWedding);
    // If due date is in the past, use today's date
    const adjustedDueDate = dueDate < today ? today : dueDate;

    return {
      id,
      title,
      dueDate: adjustedDueDate.toISOString(),
      tasks: tasks.map((task) => ({
        id: task.id,
        name: task.name,
        completed: completedTasks.includes(task.id),
        skipped: false,
      })),
    };
  };

  // Define all possible milestones
  const allMilestones = [
    // 12+ months before
    createMilestone("initial-planning", "Initial Planning", 12, [
      { id: "budget", name: "Set your wedding budget" },
      { id: "guestList", name: "Create initial guest list" },
      { id: "date", name: "Choose wedding date" },
      { id: "venue", name: "Research and book venue" },
      { id: "weddingParty", name: "Choose wedding party members" },
    ]),

    // 9-12 months before
    createMilestone("vendors", "Book Key Vendors", 10, [
      { id: "photographer", name: "Book photographer" },
      { id: "catering", name: "Book caterer" },
      { id: "florist", name: "Research florists" },
      { id: "dj", name: "Book DJ or band" },
      { id: "officiant", name: "Book officiant" },
    ]),

    // 8-10 months before
    createMilestone("attire", "Wedding Attire", 9, [
      { id: "dress", name: "Shop for wedding dress" },
      { id: "suit", name: "Shop for suit/tuxedo" },
      { id: "bridesmaids", name: "Choose bridesmaid dresses" },
      { id: "groomsmen", name: "Choose groomsmen attire" },
    ]),

    // 6-8 months before
    createMilestone("details", "Wedding Details", 7, [
      { id: "registry", name: "Create wedding registry" },
      { id: "website", name: "Set up wedding website" },
      { id: "hotels", name: "Reserve hotel room blocks" },
      { id: "transportation", name: "Arrange transportation" },
      { id: "honeymoon", name: "Plan honeymoon" },
    ]),

    // 4-6 months before
    createMilestone("invitations", "Invitations & Stationery", 5, [
      { id: "saveTheDate", name: "Send save-the-dates" },
      { id: "invitations", name: "Order invitations" },
      { id: "menu", name: "Finalize menu with caterer" },
      { id: "cake", name: "Order wedding cake" },
      { id: "favors", name: "Choose wedding favors" },
    ]),

    // 2-4 months before
    createMilestone("finalDetails", "Final Details", 3, [
      { id: "sendInvitations", name: "Send invitations" },
      { id: "finalFitting", name: "Schedule final dress fitting" },
      { id: "rings", name: "Purchase wedding rings" },
      { id: "license", name: "Apply for marriage license" },
      { id: "vows", name: "Write vows" },
    ]),

    // 1 month before
    createMilestone("lastMonth", "Last Month Preparations", 1, [
      { id: "rsvp", name: "Follow up on RSVPs" },
      { id: "seating", name: "Create seating chart" },
      { id: "timeline", name: "Finalize wedding day timeline" },
      { id: "vendors-confirm", name: "Confirm details with all vendors" },
      { id: "payments", name: "Make final payments" },
      { id: "rehearsal", name: "Plan rehearsal dinner" },
    ]),

    // Week of wedding
    createMilestone("weekOf", "Week of Wedding", 0, [
      { id: "packup", name: "Pack for honeymoon" },
      { id: "beauty", name: "Hair and beauty appointments" },
      { id: "pickup", name: "Pick up attire" },
      { id: "rehearsal-dinner", name: "Attend rehearsal dinner" },
      { id: "emergency-kit", name: "Prepare wedding day emergency kit" },
    ]),
  ];

  // Filter milestones based on timeframe
  let filteredMilestones = [];

  if (timeframe === "long") {
    // Include all milestones for long-term planning
    filteredMilestones = allMilestones;
  } else if (timeframe === "medium") {
    // For medium-term planning, exclude some early milestones if they're in the past
    filteredMilestones = allMilestones.filter(
      (milestone) => new Date(milestone.dueDate) >= today,
    );

    // Add a "Catch Up" milestone if needed
    if (filteredMilestones.length < allMilestones.length) {
      const missedTasks = allMilestones
        .filter((milestone) => new Date(milestone.dueDate) < today)
        .flatMap((milestone) =>
          milestone.tasks
            .filter((task) => !completedTasks.includes(task.id))
            .map((task) => ({ id: task.id, name: task.name })),
        );

      if (missedTasks.length > 0) {
        filteredMilestones.unshift(
          createMilestone(
            "catch-up",
            "Catch Up Tasks",
            differenceInMonths(weddingDate, today),
            missedTasks,
          ),
        );
      }
    }
  } else {
    // For short-term planning, focus on the most critical tasks
    // Include only upcoming milestones and create a "Priority Tasks" milestone
    filteredMilestones = allMilestones.filter(
      (milestone) => new Date(milestone.dueDate) >= today,
    );

    // Collect critical tasks from past milestones
    const criticalTasks = allMilestones
      .filter((milestone) => new Date(milestone.dueDate) < today)
      .flatMap((milestone) =>
        milestone.tasks
          .filter(
            (task) =>
              !completedTasks.includes(task.id) &&
              [
                "venue",
                "photographer",
                "catering",
                "officiant",
                "license",
              ].includes(task.id),
          )
          .map((task) => ({ id: task.id, name: `PRIORITY: ${task.name}` })),
      );

    if (criticalTasks.length > 0) {
      filteredMilestones.unshift(
        createMilestone(
          "priority",
          "Priority Tasks",
          differenceInMonths(weddingDate, today),
          criticalTasks,
        ),
      );
    }
  }

  return filteredMilestones;
};
