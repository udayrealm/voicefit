# 🔗 Supabase Connection Flow

## 📍 **Connection Points in Your Application**

### **1. Supabase Client Setup**
**File:** `src/utils/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://slhpxggeimhqfzojievts.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaHB4Z2dlaW1ocWZvemppZXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNTE3NzUsImV4cCI6MjA2NjgyNzc3NX0.OQ_AOlYeFOuXwgftwpJnG2ft3KHKhCy8Mnyy8AiYgxE';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### **2. Data Service Layer**
**File:** `src/utils/dataService.ts`
```typescript
import { supabase } from './supabase';

export class DataService {
  // All database operations go through this service
  static async getExercises(limit: number = 50) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }
}
```

### **3. Component Usage**
**File:** `src/components/AnalyticsScreen.tsx`
```typescript
import { DataService } from '../utils/dataService';

const AnalyticsScreen: React.FC = () => {
  const fetchAnalytics = async () => {
    const [exercisesData, sessionsData] = await Promise.all([
      DataService.getExercises(100),
      DataService.getWorkoutSessions(50)
    ]);
    // Use the data...
  };
};
```

## 🔄 **Complete Data Flow**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Analytics     │───▶│   DataService    │───▶│   Supabase      │───▶│   Database      │
│   Screen        │    │                  │    │   Client        │    │   (PostgreSQL)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
   Displays data         Processes data         Executes queries         Stores data
   to user              and calculations       and returns results      in tables
```

## 📊 **Database Tables Being Accessed**

### **1. `exercises` Table**
```sql
-- Structure
{
  user_id: number,
  created_at: string,
  exercise: string,
  sets: number,
  reps: number,
  weight: number,
  time: number,
  mood: string
}

-- Queries Used
SELECT * FROM exercises 
ORDER BY created_at DESC 
LIMIT 100;
```

### **2. `workout_sessions` Table**
```sql
-- Structure
{
  id: string,
  user_id: string,
  muscle_group: string,
  mood_pre: string,
  notes: string,
  date: string,
  timestamp: string
}

-- Queries Used
SELECT * FROM workout_sessions 
ORDER BY date DESC 
LIMIT 50;
```

## 🔧 **Connection Configuration**

### **Environment Variables (Optional)**
If you want to use environment variables instead of hardcoded values:

1. Create `.env` file in root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. The connection will automatically use these values if available.

### **Current Hardcoded Values**
- **URL:** `https://slhpxggeimhqfzojievts.supabase.co`
- **Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaHB4Z2dlaW1ocWZvemppZXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNTE3NzUsImV4cCI6MjA2NjgyNzc3NX0.OQ_AOlYeFOuXwgftwpJnG2ft3KHKhCy8Mnyy8AiYgxE`

## 🚀 **How to Test the Connection**

1. **Navigate to Analytics Screen** - This will trigger data fetching
2. **Check Browser Console** - Look for any connection errors
3. **Use Database Test Component** - Navigate to `/database` to see raw data
4. **Check Network Tab** - See actual HTTP requests to Supabase

## ⚠️ **Common Connection Issues**

1. **CORS Errors** - Supabase handles this automatically
2. **Authentication Errors** - Using anon key, so should work
3. **Table Not Found** - Check if tables exist in your Supabase project
4. **Rate Limiting** - Supabase has generous limits for anon users

## 🔍 **Debugging Connection**

Add this to your component to test the connection:

```typescript
useEffect(() => {
  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Supabase connection error:', error);
      } else {
        console.log('Supabase connection successful:', data);
      }
    } catch (err) {
      console.error('Connection test failed:', err);
    }
  };
  
  testConnection();
}, []);
```

## 📱 **Components Using Supabase**

1. **AnalyticsScreen** - Fetches exercises and sessions for analytics
2. **HomeScreen** - Fetches quick stats and recent workouts
3. **DatabaseTest** - Raw data display for debugging
4. **RecordScreen** - (Previously had data fetching, now removed)

The connection is working if you can see data in the Analytics screen or Database Test component! 