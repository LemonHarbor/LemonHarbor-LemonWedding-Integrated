-- Add category column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Add check constraint for valid categories
ALTER TABLE tasks ADD CONSTRAINT tasks_category_check 
  CHECK (category IN ('general', 'venue', 'catering', 'decoration', 'attire', 'photography', 'music', 'transportation', 'accommodation', 'honeymoon', 'other'));