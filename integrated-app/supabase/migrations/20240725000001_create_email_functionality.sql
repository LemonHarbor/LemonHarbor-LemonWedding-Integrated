-- Create email functionality for guest management

-- Enable the pgcrypto extension for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add a function to send email reminders
CREATE OR REPLACE FUNCTION send_rsvp_reminder()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a record in the email_logs table
    INSERT INTO email_logs (email, email_type, guest_id, user_id, sent_at)
    VALUES (NEW.email, 'rsvp_reminder', NEW.id, NEW.user_id, NOW());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger for the send_rsvp_reminder function
DROP TRIGGER IF EXISTS rsvp_reminder_trigger ON guests;
CREATE TRIGGER rsvp_reminder_trigger
    AFTER UPDATE OF rsvp_status ON guests
    FOR EACH ROW
    WHEN (OLD.rsvp_status = 'pending' AND NEW.rsvp_status = 'pending')
    EXECUTE FUNCTION send_rsvp_reminder();

-- Add realtime support for guests table
alter publication supabase_realtime add table guests;
