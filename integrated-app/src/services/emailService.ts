import { supabase } from "@/lib/supabase";

// Email types
export type EmailType = "rsvp_reminder" | "seating_update" | "invitation";

// Email recipient interface
export interface EmailRecipient {
  email: string;
  name: string;
}

// Email data interfaces
export interface RsvpReminderData {
  eventName: string;
  rsvpDeadline: string;
  rsvpLink: string;
}

export interface SeatingUpdateData {
  eventName: string;
  tableName: string;
  seatNumber: string;
  viewLink: string;
}

export interface InvitationData {
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  rsvpDeadline: string;
  rsvpLink: string;
  accessCode: string;
}

// Email log interface
export interface EmailLog {
  id: string;
  recipient_email: string;
  email_type: EmailType;
  sent_at: string;
  status: "sent" | "failed";
  error_message?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Send an email notification
 * @param emailType Type of email to send
 * @param recipient Recipient information
 * @param data Email data specific to the email type
 * @returns Promise with the result of the email sending operation
 */
export const sendEmail = async (
  emailType: EmailType,
  recipient: EmailRecipient,
  data: RsvpReminderData | SeatingUpdateData | InvitationData,
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    // Call the Supabase Edge Function to send the email
    const { data: responseData, error } = await supabase.functions.invoke(
      "supabase-functions-send-email",
      {
        body: { emailType, recipient, data },
      },
    );

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error: error.message };
    }

    return responseData;
  } catch (error) {
    console.error("Error in sendEmail:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send RSVP reminder to a guest
 * @param guest Guest to send reminder to
 * @param eventName Name of the wedding/event
 * @param rsvpDeadline Deadline for RSVP
 * @returns Promise with the result of the email sending operation
 */
export const sendRsvpReminder = async (
  guest: { email: string; name: string },
  eventName: string,
  rsvpDeadline: string,
): Promise<{ success: boolean; message?: string; error?: string }> => {
  const baseUrl = window.location.origin;
  const rsvpLink = `${baseUrl}/guest-area?email=${encodeURIComponent(guest.email)}`;

  return sendEmail(
    "rsvp_reminder",
    { email: guest.email, name: guest.name },
    {
      eventName,
      rsvpDeadline,
      rsvpLink,
    },
  );
};

/**
 * Send seating update notification to a guest
 * @param guest Guest to notify
 * @param eventName Name of the wedding/event
 * @param tableName Name of the table
 * @param seatNumber Seat number or identifier
 * @returns Promise with the result of the email sending operation
 */
export const sendSeatingUpdate = async (
  guest: { email: string; name: string },
  eventName: string,
  tableName: string,
  seatNumber: string,
): Promise<{ success: boolean; message?: string; error?: string }> => {
  const baseUrl = window.location.origin;
  const viewLink = `${baseUrl}/guest-area?email=${encodeURIComponent(guest.email)}`;

  return sendEmail(
    "seating_update",
    { email: guest.email, name: guest.name },
    {
      eventName,
      tableName,
      seatNumber,
      viewLink,
    },
  );
};

/**
 * Send invitation email to a guest
 * @param guest Guest to invite
 * @param eventDetails Event details
 * @returns Promise with the result of the email sending operation
 */
export const sendInvitation = async (
  guest: { email: string; name: string },
  eventDetails: {
    eventName: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    rsvpDeadline: string;
    accessCode: string;
  },
): Promise<{ success: boolean; message?: string; error?: string }> => {
  const baseUrl = window.location.origin;
  const rsvpLink = `${baseUrl}/guest-area?email=${encodeURIComponent(guest.email)}&code=${eventDetails.accessCode}`;

  return sendEmail(
    "invitation",
    { email: guest.email, name: guest.name },
    {
      ...eventDetails,
      rsvpLink,
    },
  );
};

/**
 * Get email logs for a specific recipient
 * @param email Email address to filter logs by
 * @returns Promise with email logs
 */
export const getEmailLogs = async (email?: string): Promise<EmailLog[]> => {
  try {
    let query = supabase
      .from("email_logs")
      .select("*")
      .order("sent_at", { ascending: false });

    if (email) {
      query = query.eq("recipient_email", email);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching email logs:", error);
    return [];
  }
};

/**
 * Send bulk RSVP reminders to multiple guests
 * @param guests Array of guests to send reminders to
 * @param eventName Name of the wedding/event
 * @param rsvpDeadline Deadline for RSVP
 * @returns Promise with the results of the email sending operations
 */
export const sendBulkRsvpReminders = async (
  guests: Array<{ email: string; name: string }>,
  eventName: string,
  rsvpDeadline: string,
): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  errors: any[];
}> => {
  const results = [];
  const errors = [];
  let sent = 0;
  let failed = 0;

  for (const guest of guests) {
    try {
      const result = await sendRsvpReminder(guest, eventName, rsvpDeadline);
      results.push(result);

      if (result.success) {
        sent++;
      } else {
        failed++;
        errors.push({ guest, error: result.error });
      }
    } catch (error) {
      failed++;
      errors.push({ guest, error: error.message });
    }
  }

  return {
    success: failed === 0,
    sent,
    failed,
    errors,
  };
};
