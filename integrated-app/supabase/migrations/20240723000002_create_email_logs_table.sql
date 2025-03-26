-- Create email logs table to track sent reminders
CREATE TABLE IF NOT EXISTS public.email_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    guest_id uuid REFERENCES public.guests(id) ON DELETE CASCADE,
    email text NOT NULL,
    email_type text NOT NULL DEFAULT 'rsvp_reminder',
    sent_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for email logs
DROP POLICY IF EXISTS "Users can view own email logs" ON public.email_logs;
CREATE POLICY "Users can view own email logs"
    ON public.email_logs
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own email logs" ON public.email_logs;
CREATE POLICY "Users can insert own email logs"
    ON public.email_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Enable realtime for email_logs table
alter publication supabase_realtime add table email_logs;