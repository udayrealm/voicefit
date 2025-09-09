# VoiceFit

A voice-powered workout tracking application that allows users to record their workouts by speaking. The app features a modern mobile-first UI with navigation between different screens.

## Features

- **Modern Mobile UI**: Clean, responsive design with bottom navigation
- **Voice Recording**: Record workouts using the microphone button
- **Automatic Transcription**: Voice processing via n8n webhook
- **Workout Tracking**: Store and view exercise data in Supabase
- **Analytics**: View workout statistics and progress
- **Real-time Updates**: Live data from Supabase database
- **Chat Agent**: AI-powered fitness assistant for workout guidance and questions

## Screens

### Home Screen
- Session notes and integration status
- Quick stats (streak, total workouts)
- Recent workouts overview
- System status

### Record Screen
- Voice recording functionality
- Today's workout summary
- Exercise details with progress tracking
- Real-time stats (sets, reps, volume)
   - Submit your workout

### Analytics Screen
- Workout performance metrics
- Progress tracking with visual indicators
- Recent workout history
- Performance statistics

### Profile Screen
- User profile information
- App settings and preferences
- Integration status
- Support and help options

### Chat Agent Screen
- AI-powered fitness assistant
- Text and voice message support
- Real-time responses via n8n webhook
- Workout guidance and fitness advice

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

3. Configure your environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_N8N_WEBHOOK_URL`: Your n8n webhook URL for transcription
   - Chat Agent: Uses the integrated n8n webhook at `https://yousefakil1996.app.n8n.cloud/webhook/4091fa09-fb9a-4039-9411-7104d213f601/chat`

4. Create the required tables in Supabase:
   ```sql
   -- Exercises table
   CREATE TABLE exercises (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     session_id UUID,
     name TEXT,
     sets INTEGER,
     reps INTEGER,
     weight INTEGER,
     time INTEGER,
     mood TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Workout sessions table
   CREATE TABLE workout_sessions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID,
     muscle_group TEXT,
     mood_pre TEXT,
     notes TEXT,
     date DATE,
     timestamp TIMESTAMP
   );
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. **Navigation**: Use the bottom navigation bar to switch between screens
2. **Recording**: Tap the microphone button on the Record screen to start/stop recording
3. **Sending**: Use the "Send Test to n8n Webhook" button to process recordings
4. **Viewing Data**: Check the Home and Analytics screens for workout statistics
5. **Settings**: Access app settings and integration status in the Profile screen
6. **Chat Agent**: Access the AI fitness assistant via the Chat tab for workout guidance and questions

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Voice Processing**: n8n workflows
- **Build Tool**: Vite
- **State Management**: React hooks

## Backend Integration

The app maintains all existing backend functionality:
- Voice recording using MediaRecorder API
- Audio processing via n8n webhook
- Data storage in Supabase
- Real-time data fetching and updates

## Development

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

The application is now running on `http://localhost:5173`