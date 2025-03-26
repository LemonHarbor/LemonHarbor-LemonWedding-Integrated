import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { TimelineMilestone, TimelineTask } from "@/services/timelineService";

// Hook for real-time timeline updates
export function useRealtimeTimeline(userId: string) {
  const [milestones, setMilestones] = useState<TimelineMilestone[]>([]);
  const [weddingDate, setWeddingDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Fetch initial data
    const fetchTimeline = async () => {
      try {
        setLoading(true);

        // Get wedding date from user preferences
        const { data: prefData, error: prefError } = await supabase
          .from("user_preferences")
          .select("wedding_date")
          .eq("user_id", userId)
          .single();

        if (prefError && prefError.code !== "PGRST116") throw prefError;
        if (prefData?.wedding_date) {
          setWeddingDate(new Date(prefData.wedding_date));
        }

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
        const formattedMilestones = milestonesData.map((milestone) => ({
          id: milestone.id,
          title: milestone.title,
          dueDate: milestone.due_date,
          tasks: tasksByMilestone[milestone.id] || [],
        }));

        setMilestones(formattedMilestones);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching timeline:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();

    // Set up real-time subscriptions
    const preferencesChannel = supabase
      .channel("preferences-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_preferences",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new && payload.new.wedding_date) {
            setWeddingDate(new Date(payload.new.wedding_date));
          }
        },
      )
      .subscribe();

    const milestonesChannel = supabase
      .channel("milestones-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "timeline_milestones",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refetch all data when milestones change
          fetchTimeline();
        },
      )
      .subscribe();

    const tasksChannel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "timeline_tasks" },
        (payload) => {
          if (payload.eventType === "UPDATE" && payload.new) {
            // Update a single task without refetching everything
            setMilestones((prev) =>
              prev.map((milestone) => {
                if (milestone.id === payload.new.milestone_id) {
                  return {
                    ...milestone,
                    tasks: milestone.tasks.map((task) => {
                      if (task.id === payload.new.id) {
                        return {
                          ...task,
                          name: payload.new.name,
                          completed: payload.new.completed,
                          skipped: payload.new.skipped,
                        };
                      }
                      return task;
                    }),
                  };
                }
                return milestone;
              }),
            );
          } else {
            // For inserts and deletes, refetch all data
            fetchTimeline();
          }
        },
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      preferencesChannel.unsubscribe();
      milestonesChannel.unsubscribe();
      tasksChannel.unsubscribe();
    };
  }, [userId, toast]);

  return { milestones, weddingDate, loading, error };
}
