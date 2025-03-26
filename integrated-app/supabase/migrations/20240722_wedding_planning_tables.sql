-- Wedding planning tables

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    due_date date NOT NULL,
    priority text NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Guests table
CREATE TABLE IF NOT EXISTS public.guests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text,
    phone text,
    rsvp_status text DEFAULT 'pending' CHECK (rsvp_status IN ('confirmed', 'declined', 'pending')),
    dietary_restrictions text,
    table_assignment text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tables table
CREATE TABLE IF NOT EXISTS public.tables (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    shape text NOT NULL CHECK (shape IN ('round', 'rectangle', 'oval')),
    capacity integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Guest preferences and conflicts
CREATE TABLE IF NOT EXISTS public.guest_relationships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    guest_id uuid REFERENCES public.guests(id) ON DELETE CASCADE,
    related_guest_id uuid REFERENCES public.guests(id) ON DELETE CASCADE,
    relationship_type text NOT NULL CHECK (relationship_type IN ('preference', 'conflict')),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (guest_id, related_guest_id, relationship_type)
);

-- Budget categories table
CREATE TABLE IF NOT EXISTS public.budget_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    planned_amount numeric(10,2) NOT NULL,
    actual_amount numeric(10,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks"
    ON public.tasks
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks"
    ON public.tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks"
    ON public.tasks
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks"
    ON public.tasks
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for guests
DROP POLICY IF EXISTS "Users can view own guests" ON public.guests;
CREATE POLICY "Users can view own guests"
    ON public.guests
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own guests" ON public.guests;
CREATE POLICY "Users can insert own guests"
    ON public.guests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own guests" ON public.guests;
CREATE POLICY "Users can update own guests"
    ON public.guests
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own guests" ON public.guests;
CREATE POLICY "Users can delete own guests"
    ON public.guests
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for tables
DROP POLICY IF EXISTS "Users can view own tables" ON public.tables;
CREATE POLICY "Users can view own tables"
    ON public.tables
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tables" ON public.tables;
CREATE POLICY "Users can insert own tables"
    ON public.tables
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tables" ON public.tables;
CREATE POLICY "Users can update own tables"
    ON public.tables
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tables" ON public.tables;
CREATE POLICY "Users can delete own tables"
    ON public.tables
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for guest relationships
DROP POLICY IF EXISTS "Users can view own guest relationships" ON public.guest_relationships;
CREATE POLICY "Users can view own guest relationships"
    ON public.guest_relationships
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own guest relationships" ON public.guest_relationships;
CREATE POLICY "Users can insert own guest relationships"
    ON public.guest_relationships
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own guest relationships" ON public.guest_relationships;
CREATE POLICY "Users can delete own guest relationships"
    ON public.guest_relationships
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for budget categories
DROP POLICY IF EXISTS "Users can view own budget categories" ON public.budget_categories;
CREATE POLICY "Users can view own budget categories"
    ON public.budget_categories
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own budget categories" ON public.budget_categories;
CREATE POLICY "Users can insert own budget categories"
    ON public.budget_categories
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own budget categories" ON public.budget_categories;
CREATE POLICY "Users can update own budget categories"
    ON public.budget_categories
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own budget categories" ON public.budget_categories;
CREATE POLICY "Users can delete own budget categories"
    ON public.budget_categories
    FOR DELETE
    USING (auth.uid() = user_id);

-- Enable realtime for all tables
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table guests;
alter publication supabase_realtime add table tables;
alter publication supabase_realtime add table guest_relationships;
alter publication supabase_realtime add table budget_categories;