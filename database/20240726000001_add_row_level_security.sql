-- Enable Row Level Security on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks table
DROP POLICY IF EXISTS "Users can only see their own tasks" ON tasks;
CREATE POLICY "Users can only see their own tasks"
ON tasks
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only insert their own tasks" ON tasks;
CREATE POLICY "Users can only insert their own tasks"
ON tasks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only update their own tasks" ON tasks;
CREATE POLICY "Users can only update their own tasks"
ON tasks
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only delete their own tasks" ON tasks;
CREATE POLICY "Users can only delete their own tasks"
ON tasks
FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for guests table
DROP POLICY IF EXISTS "Users can only see their own guests" ON guests;
CREATE POLICY "Users can only see their own guests"
ON guests
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only insert their own guests" ON guests;
CREATE POLICY "Users can only insert their own guests"
ON guests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only update their own guests" ON guests;
CREATE POLICY "Users can only update their own guests"
ON guests
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only delete their own guests" ON guests;
CREATE POLICY "Users can only delete their own guests"
ON guests
FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for tables table
DROP POLICY IF EXISTS "Users can only see their own tables" ON tables;
CREATE POLICY "Users can only see their own tables"
ON tables
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only insert their own tables" ON tables;
CREATE POLICY "Users can only insert their own tables"
ON tables
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only update their own tables" ON tables;
CREATE POLICY "Users can only update their own tables"
ON tables
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only delete their own tables" ON tables;
CREATE POLICY "Users can only delete their own tables"
ON tables
FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for guest_relationships table
DROP POLICY IF EXISTS "Users can only see their own guest relationships" ON guest_relationships;
CREATE POLICY "Users can only see their own guest relationships"
ON guest_relationships
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only insert their own guest relationships" ON guest_relationships;
CREATE POLICY "Users can only insert their own guest relationships"
ON guest_relationships
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only update their own guest relationships" ON guest_relationships;
CREATE POLICY "Users can only update their own guest relationships"
ON guest_relationships
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only delete their own guest relationships" ON guest_relationships;
CREATE POLICY "Users can only delete their own guest relationships"
ON guest_relationships
FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for budget_categories table
DROP POLICY IF EXISTS "Users can only see their own budget categories" ON budget_categories;
CREATE POLICY "Users can only see their own budget categories"
ON budget_categories
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only insert their own budget categories" ON budget_categories;
CREATE POLICY "Users can only insert their own budget categories"
ON budget_categories
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only update their own budget categories" ON budget_categories;
CREATE POLICY "Users can only update their own budget categories"
ON budget_categories
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only delete their own budget categories" ON budget_categories;
CREATE POLICY "Users can only delete their own budget categories"
ON budget_categories
FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for expenses table
DROP POLICY IF EXISTS "Users can only see their own expenses" ON expenses;
CREATE POLICY "Users can only see their own expenses"
ON expenses
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only insert their own expenses" ON expenses;
CREATE POLICY "Users can only insert their own expenses"
ON expenses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only update their own expenses" ON expenses;
CREATE POLICY "Users can only update their own expenses"
ON expenses
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only delete their own expenses" ON expenses;
CREATE POLICY "Users can only delete their own expenses"
ON expenses
FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for email_logs table
DROP POLICY IF EXISTS "Users can only see their own email logs" ON email_logs;
CREATE POLICY "Users can only see their own email logs"
ON email_logs
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only insert their own email logs" ON email_logs;
CREATE POLICY "Users can only insert their own email logs"
ON email_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only update their own email logs" ON email_logs;
CREATE POLICY "Users can only update their own email logs"
ON email_logs
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only delete their own email logs" ON email_logs;
CREATE POLICY "Users can only delete their own email logs"
ON email_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Add indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS guests_user_id_idx ON guests(user_id);
CREATE INDEX IF NOT EXISTS tables_user_id_idx ON tables(user_id);
CREATE INDEX IF NOT EXISTS guest_relationships_user_id_idx ON guest_relationships(user_id);
CREATE INDEX IF NOT EXISTS budget_categories_user_id_idx ON budget_categories(user_id);
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS email_logs_user_id_idx ON email_logs(user_id);

-- Add index for table_assignment in guests table for faster table lookups
CREATE INDEX IF NOT EXISTS guests_table_assignment_idx ON guests(table_assignment);

-- Add index for rsvp_status in guests table for faster RSVP stats
CREATE INDEX IF NOT EXISTS guests_rsvp_status_idx ON guests(rsvp_status);
