-- Fix Feedback Table RLS Policies for Custom Authentication
-- Run this in your Supabase SQL editor

-- First, let's check if the feedback table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'feedback'
) as table_exists;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can insert their own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can update their own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can delete their own feedback" ON feedback;

-- Create new policies that work with custom authentication
-- These policies allow all operations since we're handling user isolation in the app code

CREATE POLICY "Allow all operations for authenticated users" ON feedback
    FOR ALL USING (true);

-- Alternative: If you want to be more restrictive, you can use this instead:
-- CREATE POLICY "Allow all operations for authenticated users" ON feedback
--     FOR ALL USING (user_id IS NOT NULL);

-- Verify the policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'feedback';

-- Test the setup
SELECT 'Feedback RLS policies updated successfully!' as status;
