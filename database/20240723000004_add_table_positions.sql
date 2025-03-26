-- Add table_positions column to tables table
ALTER TABLE tables ADD COLUMN IF NOT EXISTS position_x FLOAT;
ALTER TABLE tables ADD COLUMN IF NOT EXISTS position_y FLOAT;

-- Realtime is already enabled for tables