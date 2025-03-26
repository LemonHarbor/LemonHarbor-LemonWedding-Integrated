-- Benutzerrollen und Berechtigungen
CREATE TABLE IF NOT EXISTS public.roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL CHECK (name IN ('couple', 'best_man', 'maid_of_honor', 'guest')),
    permissions jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Benutzereinstellungen
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    language text DEFAULT 'de' CHECK (language IN ('de', 'en', 'fr', 'es')),
    dark_mode boolean DEFAULT false,
    notification_preferences jsonb DEFAULT '{}',
    wedding_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Ausgaben-Tabelle für die Budget-Funktion
CREATE TABLE IF NOT EXISTS public.expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    category_id uuid REFERENCES public.budget_categories(id) ON DELETE CASCADE,
    amount numeric(10,2) NOT NULL,
    description text,
    date date NOT NULL,
    receipt_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Einladungs-Tabelle für die digitalen Einladungen
CREATE TABLE IF NOT EXISTS public.invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    guest_id uuid REFERENCES public.guests(id) ON DELETE CASCADE,
    access_code text UNIQUE NOT NULL,
    viewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Email-Logs Tabelle (falls nicht bereits vorhanden)
CREATE TABLE IF NOT EXISTS public.email_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    guest_id uuid REFERENCES public.guests(id) ON DELETE CASCADE,
    email text NOT NULL,
    email_type text NOT NULL,
    sent_at timestamp with time zone DEFAULT now()
);

-- RLS-Policies für die neuen Tabellen
-- Roles Tabelle
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all roles"
    ON public.roles
    FOR SELECT
    USING (true);

-- User Roles Tabelle
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles"
    ON public.user_roles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roles"
    ON public.user_roles
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roles"
    ON public.user_roles
    FOR DELETE
    USING (auth.uid() = user_id);

-- User Settings Tabelle
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
    ON public.user_settings
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON public.user_settings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON public.user_settings
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
    ON public.user_settings
    FOR DELETE
    USING (auth.uid() = user_id);

-- Expenses Tabelle
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses"
    ON public.expenses
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
    ON public.expenses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
    ON public.expenses
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
    ON public.expenses
    FOR DELETE
    USING (auth.uid() = user_id);

-- Invitations Tabelle
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invitations"
    ON public.invitations
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invitations"
    ON public.invitations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invitations"
    ON public.invitations
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invitations"
    ON public.invitations
    FOR DELETE
    USING (auth.uid() = user_id);

-- Email Logs Tabelle
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email logs"
    ON public.email_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email logs"
    ON public.email_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Realtime aktivieren für alle neuen Tabellen
ALTER PUBLICATION supabase_realtime ADD TABLE roles;
ALTER PUBLICATION supabase_realtime ADD TABLE user_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE user_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE invitations;
ALTER PUBLICATION supabase_realtime ADD TABLE email_logs;

-- Indizes für häufig abgefragte Felder
CREATE INDEX IF NOT EXISTS roles_name_idx ON roles(name);
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_id_idx ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_category_id_idx ON expenses(category_id);
CREATE INDEX IF NOT EXISTS invitations_user_id_idx ON invitations(user_id);
CREATE INDEX IF NOT EXISTS invitations_guest_id_idx ON invitations(guest_id);
CREATE INDEX IF NOT EXISTS invitations_access_code_idx ON invitations(access_code);
CREATE INDEX IF NOT EXISTS email_logs_user_id_idx ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS email_logs_guest_id_idx ON email_logs(guest_id);
