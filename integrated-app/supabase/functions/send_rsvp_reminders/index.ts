// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/manual/examples/supabase-edge-functions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

interface Guest {
  id: string;
  name: string;
  email: string;
  rsvp_status: string;
}

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get("SUPABASE_URL") ?? "",
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies will be applied.
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // Get the user ID from the request
    const { user_id, guestIds } = await req.json();

    if (!user_id && !guestIds) {
      throw new Error("Either user_id or guestIds is required");
    }

    // Get all guests with pending RSVP status for this user
    let query = supabaseClient
      .from("guests")
      .select("id, name, email, rsvp_status")
      .eq("rsvp_status", "pending")
      .not("email", "is", null);

    // Filter by user_id if provided
    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    // Filter by guestIds if provided
    if (guestIds && Array.isArray(guestIds) && guestIds.length > 0) {
      query = query.in("id", guestIds);
    }

    const { data: pendingGuests, error: guestsError } = await query;

    if (guestsError) {
      throw guestsError;
    }

    if (!pendingGuests || pendingGuests.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No pending guests with email addresses found",
          count: 0,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          status: 200,
        },
      );
    }

    // In a real implementation, you would use a service like SendGrid, Mailgun, etc.
    // For this example, we'll just simulate sending emails
    const sentEmails = pendingGuests.map((guest: Guest) => {
      // In a real implementation, you would send an actual email here
      console.log(`Sending reminder email to ${guest.name} at ${guest.email}`);

      // You could also log this activity in a separate table
      return {
        guest_id: guest.id,
        email: guest.email,
        sent_at: new Date().toISOString(),
      };
    });

    // Log the email sending activity in the email_logs table
    const emailLogs = sentEmails.map((email) => ({
      ...email,
      user_id,
      email_type: "rsvp_reminder",
    }));

    const { error: logError } = await supabaseClient
      .from("email_logs")
      .insert(emailLogs);

    if (logError) {
      console.error("Error logging emails:", logError);
      // Continue even if logging fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "RSVP reminders sent successfully",
        count: sentEmails.length,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 400,
    });
  }
});
