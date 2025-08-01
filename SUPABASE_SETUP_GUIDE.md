# 🔧 Supabase Setup Guide

## 🚨 Current Issue
Your app is experiencing connection timeouts to Supabase. The hardcoded credentials in `src/utils/supabase.ts` are likely invalid or pointing to a non-existent project.

## 📋 Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `voice-fit-app` (or any name you prefer)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you
6. Click "Create new project"
7. Wait for the project to be created (2-3 minutes)

### 2. Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### 3. Create Environment File

1. In your project root, create a `.env` file:
```bash
# Create .env file
touch .env
```

2. Add your credentials to `.env`:
```env
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Run this SQL to create the exercises table:

```sql
-- Create exercises table
CREATE TABLE exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id INTEGER DEFAULT 1,
  user TEXT DEFAULT 'user1',
  exercise TEXT NOT NULL,
  sets INTEGER DEFAULT 0,
  reps INTEGER DEFAULT 0,
  weight INTEGER DEFAULT 0,
  time INTEGER DEFAULT 0,
  mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for development)
CREATE POLICY "Allow all operations" ON exercises
  FOR ALL USING (true);

-- Insert some sample data
INSERT INTO exercises (exercise, sets, reps, weight, time, mood, user) VALUES
  ('Bench Press', 3, 10, 135, 45, 'Strong', 'user1'),
  ('Squats', 4, 12, 185, 60, 'Good', 'user1'),
  ('Deadlift', 3, 8, 225, 90, 'Excellent', 'user1');
```

### 5. Test the Connection

1. Restart your development server:
```bash
npm run dev
```

2. Navigate to the Database Test page in your app
3. Check the connection status
4. Try the "Insert Sample Data" button

## 🔍 Troubleshooting

### Connection Still Failing?

1. **Check your `.env` file**:
   - Make sure it's in the project root
   - No spaces around the `=` sign
   - No quotes around values

2. **Verify Supabase project**:
   - Go to your Supabase dashboard
   - Check if the project is active
   - Verify the URL and key match

3. **Check browser console**:
   - Open Developer Tools (F12)
   - Look for connection errors
   - Check Network tab for failed requests

4. **Test with curl**:
```bash
curl -X GET "https://your-project-url.supabase.co/rest/v1/exercises?select=count" \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

### Common Errors

| Error | Solution |
|-------|----------|
| `net::ERR_CONNECTION_TIMED_OUT` | Check if Supabase URL is correct |
| `Invalid API key` | Verify your anon key is correct |
| `relation "exercises" does not exist` | Run the SQL to create the table |
| `permission denied` | Check RLS policies in Supabase |

### Environment Variables Not Loading?

1. Make sure your `.env` file is in the project root
2. Restart the development server after creating `.env`
3. Check that variable names start with `VITE_`

## ✅ Success Indicators

When everything is working correctly, you should see:

1. **Console logs**:
   ```
   ✅ Supabase connection test successful
   ```

2. **Database Test page**:
   - ✅ Connected to Supabase
   - ✅ Exercises table exists
   - Sample data displays correctly

3. **Home screen**:
   - Shows actual workout data instead of zeros
   - Connection banner shows "Connected to Supabase Database"

## 🚀 Next Steps

Once the connection is working:

1. **Test the app features**:
   - Record voice workouts
   - View analytics
   - Check data persistence

2. **Add more data**:
   - Use the "Insert Sample Data" button
   - Record real workouts through the app

3. **Customize**:
   - Modify the database schema if needed
   - Add more tables for additional features

## 📞 Need Help?

If you're still having issues:

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Verify your project is in the correct region
3. Make sure your database password is strong enough
4. Try creating a new project if the current one has issues

The key is getting valid Supabase credentials and creating the proper database tables. Once that's done, your app should work perfectly! 