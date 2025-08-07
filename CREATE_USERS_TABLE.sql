-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (for demo purposes)
-- In production, you should implement proper RLS policies
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);

-- Insert demo users if they don't exist
INSERT INTO users (username, email, password, created_at)
VALUES 
    ('demo', 'demo@example.com', 'password123', NOW()),
    ('test', 'test@example.com', 'test123', NOW())
ON CONFLICT (username) DO NOTHING;

-- Update exercises table to reference users table
-- First, add a user_id column if it doesn't exist
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON exercises(user_id);
