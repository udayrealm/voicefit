export interface MicrophoneRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
}

export interface SendButtonProps {
  audioBlob: Blob | null;
  webhookURL: string;
}

// Database schema types based on the actual database structure
export interface Exercise {
  user_id: number; // Numeric user ID (int8)
  user: string; // String user identifier (text)
  created_at: string;
  exercise: string; // JSON field containing exercise name
  sets: number;
  reps: number;
  weight: number;
  time: number;
  mood: string; // JSON field containing mood
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