export interface MicrophoneRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
}

export interface SendButtonProps {
  audioBlob: Blob | null;
  webhookURL: string;
}

// Database schema types based on the actual database structure
export interface Exercise {
  id?: string; // UUID primary key
  user_id: string; // UUID user ID (proper foreign key)
  user?: string; // String user identifier (text) - optional for backward compatibility
  created_at: string;
  exercise: string; // JSON field containing exercise name
  exercise_type: string; // Exercise type/category
  sets: number;
  reps: number;
  weight: number;
  userweight: number; // User's body weight
  time: number;
  mood: string; // JSON field containing mood
  whatsaid?: string; // What the user said during the workout
}

export interface ExerciseDefinition {
  id: string;
  session_id: string;
  name: string;
}

export interface Workout {
  id: string;
  user_id: string;
  exercise_type: string;
  duration: number;
  transcription: string;
  created_at: string;
}

export interface QuickStats {
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  streak: number;
  totalWorkouts: number;
  totalSessions: number;
  averageWeight: number;
  totalTime: number;
}

export interface WorkoutSummary {
  session: {
    id: string;
    user_id: string;
    muscle_group: string;
    mood_pre: string;
    notes: string;
    date: string;
    timestamp: string;
  };
  exercises: ExerciseDefinition[];
  totalExercises: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
}

// User authentication types
export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}

// Chat agent types
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  isLoading?: boolean;
}

export interface ChatAgentResponse {
  message: string;
  success: boolean;
  error?: string;
}