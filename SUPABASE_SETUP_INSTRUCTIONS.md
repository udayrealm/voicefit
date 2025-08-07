# Supabase Authentication Setup Instructions

## 🔧 Database Setup

### 1. Create Users Table
Run this SQL in your Supabase SQL Editor:

```sql
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
```

### 2. Test the Setup

After running the SQL:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Try logging in with demo credentials:**
   - Username: `demo` | Password: `password123`
   - Username: `test` | Password: `test123`

3. **Check the browser console** for authentication logs

## 🔍 Troubleshooting

### If login still doesn't work:

1. **Check Supabase connection:**
   - Verify your Supabase URL and key in `src/utils/supabase.ts`
   - Test the connection in Supabase dashboard

2. **Check database tables:**
   - Go to Supabase Dashboard → Table Editor
   - Verify the `users` table exists and has data

3. **Check browser console:**
   - Look for authentication error messages
   - Check network requests to Supabase

4. **Verify RLS policies:**
   - Make sure the "Allow all operations" policy is active
   - Or temporarily disable RLS for testing

### Common Issues:

1. **"User not found" error:**
   - The users table might not be created
   - Run the SQL script again

2. **"Invalid username or password" error:**
   - Check if demo users were inserted
   - Verify the password matches exactly

3. **Network errors:**
   - Check your internet connection
   - Verify Supabase URL and key

## 🚀 Next Steps

Once authentication is working:

1. **Test user registration** with new accounts
2. **Test user-specific data** in the app
3. **Implement proper password hashing** for production
4. **Add proper RLS policies** for security

## 📝 Demo Credentials

- **Username:** `demo` | **Password:** `password123`
- **Username:** `test` | **Password:** `test123`

These users will be automatically created when you run the SQL script.
