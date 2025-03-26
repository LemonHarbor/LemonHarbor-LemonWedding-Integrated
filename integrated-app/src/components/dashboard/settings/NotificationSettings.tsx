import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../../../../supabase/auth";
import { supabase } from "../../../../supabase/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/useTranslation";
import { Bell, Mail } from "lucide-react";

const notificationFormSchema = z.object({
  // Email notifications
  emailReminders: z.boolean().default(true),
  emailRsvpUpdates: z.boolean().default(true),
  emailTaskReminders: z.boolean().default(true),
  emailBudgetAlerts: z.boolean().default(true),
  emailWeeklyUpdates: z.boolean().default(false),

  // In-app notifications
  inAppReminders: z.boolean().default(true),
  inAppRsvpUpdates: z.boolean().default(true),
  inAppTaskReminders: z.boolean().default(true),
  inAppBudgetAlerts: z.boolean().default(true),
  inAppChatMessages: z.boolean().default(true),
  inAppCollaboratorUpdates: z.boolean().default(true),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

export default function NotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // Default values from user metadata or set defaults
  const defaultValues: NotificationFormValues = {
    // Email notifications
    emailReminders: user?.user_metadata?.notifications?.emailReminders ?? true,
    emailRsvpUpdates:
      user?.user_metadata?.notifications?.emailRsvpUpdates ?? true,
    emailTaskReminders:
      user?.user_metadata?.notifications?.emailTaskReminders ?? true,
    emailBudgetAlerts:
      user?.user_metadata?.notifications?.emailBudgetAlerts ?? true,
    emailWeeklyUpdates:
      user?.user_metadata?.notifications?.emailWeeklyUpdates ?? false,

    // In-app notifications
    inAppReminders: user?.user_metadata?.notifications?.inAppReminders ?? true,
    inAppRsvpUpdates:
      user?.user_metadata?.notifications?.inAppRsvpUpdates ?? true,
    inAppTaskReminders:
      user?.user_metadata?.notifications?.inAppTaskReminders ?? true,
    inAppBudgetAlerts:
      user?.user_metadata?.notifications?.inAppBudgetAlerts ?? true,
    inAppChatMessages:
      user?.user_metadata?.notifications?.inAppChatMessages ?? true,
    inAppCollaboratorUpdates:
      user?.user_metadata?.notifications?.inAppCollaboratorUpdates ?? true,
  };

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues,
  });

  async function onSubmit(data: NotificationFormValues) {
    setIsLoading(true);
    try {
      // Get current user metadata
      const currentMetadata = user?.user_metadata || {};

      // Update user metadata with notification preferences
      const { error } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          notifications: data,
        },
      });

      if (error) throw error;

      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast({
        title: "Error",
        description:
          "Failed to update notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notification Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure how you want to receive notifications and updates.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Email Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="inapp" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>In-App Notifications</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="emailReminders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Event Reminders
                        </FormLabel>
                        <FormDescription>
                          Receive email reminders for important dates and
                          deadlines.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailRsvpUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          RSVP Updates
                        </FormLabel>
                        <FormDescription>
                          Get email notifications when guests RSVP to your
                          wedding.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailTaskReminders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Task Reminders
                        </FormLabel>
                        <FormDescription>
                          Receive email reminders for upcoming tasks and to-dos.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailBudgetAlerts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Budget Alerts
                        </FormLabel>
                        <FormDescription>
                          Get email alerts when you approach or exceed your
                          budget limits.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailWeeklyUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Weekly Summary
                        </FormLabel>
                        <FormDescription>
                          Receive a weekly email summary of your wedding
                          planning progress.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="inapp" className="mt-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="inAppReminders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Event Reminders
                        </FormLabel>
                        <FormDescription>
                          Receive in-app notifications for important dates and
                          deadlines.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inAppRsvpUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          RSVP Updates
                        </FormLabel>
                        <FormDescription>
                          Get in-app notifications when guests RSVP to your
                          wedding.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inAppTaskReminders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Task Reminders
                        </FormLabel>
                        <FormDescription>
                          Receive in-app reminders for upcoming tasks and
                          to-dos.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inAppBudgetAlerts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Budget Alerts
                        </FormLabel>
                        <FormDescription>
                          Get in-app alerts when you approach or exceed your
                          budget limits.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inAppChatMessages"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Chat Messages
                        </FormLabel>
                        <FormDescription>
                          Receive in-app notifications for new chat messages
                          from vendors or collaborators.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inAppCollaboratorUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Collaborator Updates
                        </FormLabel>
                        <FormDescription>
                          Get notified when collaborators make changes to your
                          wedding plans.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button type="submit" disabled={isLoading} className="mt-6">
            {isLoading ? "Saving..." : "Save preferences"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
