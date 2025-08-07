import { supabase } from './supabase';
import { Exercise } from '../types';

export class DataService {
  // Get current user from localStorage
  private static getCurrentUser() {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Fetch all exercises with pagination for current user
  static async getExercises(limit: number = 50, offset: number = 0) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.log('No user logged in, returning empty array');
        return [];
      }

      console.log(`Fetching exercises for user ${currentUser.username}...`);
      
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', currentUser.id) // Use UUID relationship
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} exercises for user ${currentUser.username}`);
      return data || [];
    } catch (error) {
      console.error('Error fetching exercises:', error);
      return [];
    }
  }

  // Insert sample exercise data for testing with current user
  static async insertSampleExercises() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not logged in');
      }

      console.log(`Inserting sample exercises for user ${currentUser.username}...`);
      
      const sampleExercises = [
        {
          user_id: currentUser.id, // Use UUID relationship
          exercise: 'Bench Press',
          exercise_type: 'Strength',
          sets: 3,
          reps: 10,
          weight: 135,
          userweight: 180,
          time: 45,
          mood: 'Strong',
          created_at: new Date().toISOString()
        },
        {
          user_id: currentUser.id,
          exercise: 'Squats',
          exercise_type: 'Strength',
          sets: 4,
          reps: 12,
          weight: 185,
          userweight: 180,
          time: 60,
          mood: 'Good',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
        },
        {
          user_id: currentUser.id,
          exercise: 'Deadlift',
          exercise_type: 'Strength',
          sets: 3,
          reps: 8,
          weight: 225,
          userweight: 180,
          time: 90,
          mood: 'Excellent',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        },
        {
          user_id: currentUser.id,
          exercise: 'Pull-ups',
          exercise_type: 'Bodyweight',
          sets: 3,
          reps: 15,
          weight: 0, // Bodyweight
          userweight: 180,
          time: 30,
          mood: 'Tired',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
        },
        {
          user_id: currentUser.id,
          exercise: 'Overhead Press',
          exercise_type: 'Strength',
          sets: 3,
          reps: 8,
          weight: 95,
          userweight: 180,
          time: 40,
          mood: 'Focused',
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
        },
        {
          user_id: currentUser.id,
          exercise: 'Bent Over Rows',
          exercise_type: 'Strength',
          sets: 3,
          reps: 12,
          weight: 115,
          userweight: 180,
          time: 50,
          mood: 'Focused',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
        },
        {
          user_id: currentUser.id,
          exercise: 'Lunges',
          exercise_type: 'Strength',
          sets: 3,
          reps: 10,
          weight: 45,
          userweight: 180,
          time: 35,
          mood: 'Good',
          created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days ago
        }
      ];

      const { data, error } = await supabase
        .from('exercises')
        .insert(sampleExercises)
        .select();

      if (error) {
        console.error('Error inserting sample exercises:', error);
        throw error;
      }
      
      console.log(`Successfully inserted ${data?.length || 0} sample exercises for user ${currentUser.username}`);
      return data;
    } catch (error) {
      console.error('Error inserting sample exercises:', error);
      throw error;
    }
  }

  // Get table info to check if exercises table exists
  static async checkTableExists() {
    try {
      console.log('Checking if exercises table exists...');
      
      const { data, error } = await supabase
        .from('exercises')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Table check error:', error);
        return { exists: false, error: error.message };
      }
      
      return { exists: true, error: null };
    } catch (error) {
      console.error('Error checking table:', error);
      return { exists: false, error: 'Unknown error' };
    }
  }

  // Get all users in the exercises table
  static async getUsers() {
    try {
      console.log('Fetching all users from exercises table...');
      
      const { data, error } = await supabase
        .from('exercises')
        .select('user')
        .order('user');

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      const uniqueUsers = [...new Set(data?.map(ex => ex.user) || [])];
      console.log(`Found ${uniqueUsers.length} unique users:`, uniqueUsers);
      return uniqueUsers;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  // Calculate comprehensive stats from exercises table for current user
  static async getQuickStats() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.log('No user logged in, returning default stats');
        return {
          totalSets: 0,
          totalReps: 0,
          totalVolume: 0,
          streak: 0,
          totalWorkouts: 0,
          totalSessions: 0,
          averageWeight: 0,
          totalTime: 0
        };
      }

      console.log(`Calculating quick stats for user ${currentUser.username}...`);
      
      // Fetch all exercises for the current user
      const exercises = await this.getExercises(1000, 0);

      // Calculate stats from exercises table
      const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
      const totalReps = exercises.reduce((sum, ex) => sum + (ex.reps || 0), 0);
      const totalVolume = exercises.reduce((sum, ex) => sum + ((ex.weight || 0) * (ex.reps || 0)), 0);
      const totalTime = exercises.reduce((sum, ex) => sum + (ex.time || 0), 0);
      
      // Calculate average weight
      const exercisesWithWeight = exercises.filter(ex => ex.weight > 0);
      const averageWeight = exercisesWithWeight.length > 0 
        ? exercisesWithWeight.reduce((sum, ex) => sum + ex.weight, 0) / exercisesWithWeight.length 
        : 0;

      // Calculate streak based on exercise dates
      const streak = this.calculateStreakFromExercises(exercises);

      const stats = {
        totalSets,
        totalReps,
        totalVolume,
        streak,
        totalWorkouts: exercises.length,
        totalSessions: 0, // No sessions table
        averageWeight: Math.round(averageWeight),
        totalTime
      };

      console.log('Quick stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('Error calculating quick stats:', error);
      return {
        totalSets: 0,
        totalReps: 0,
        totalVolume: 0,
        streak: 0,
        totalWorkouts: 0,
        totalSessions: 0,
        averageWeight: 0,
        totalTime: 0
      };
    }
  }

  // Calculate workout streak from exercises
  private static calculateStreakFromExercises(exercises: Exercise[]): number {
    if (exercises.length === 0) return 0;

    const today = new Date();
    const exerciseDates = exercises
      .map(ex => new Date(ex.created_at))
      .map(date => date.toDateString()) // Get just the date part
      .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    let currentDate = new Date(today);

    for (const exerciseDate of exerciseDates) {
      const diffTime = Math.abs(currentDate.getTime() - new Date(exerciseDate).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        streak++;
        currentDate = new Date(exerciseDate);
      } else {
        break;
      }
    }

    return streak;
  }

  // Get recent workout summaries from exercises for current user
  static async getRecentWorkouts(limit: number = 5) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.log('No user logged in, returning empty workouts');
        return [];
      }

      console.log(`Fetching recent workouts for user ${currentUser.username}...`);
      
      const exercises = await this.getExercises(limit * 10, 0); // Get more exercises to group by date
      const summaries = [];

      // Group exercises by date
      const exercisesByDate = exercises.reduce((acc, exercise) => {
        const date = new Date(exercise.created_at).toDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(exercise);
        return acc;
      }, {} as Record<string, Exercise[]>);

      // Create summaries for each date
      Object.entries(exercisesByDate).slice(0, limit).forEach(([date, dayExercises]) => {
        const totalSets = dayExercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
        const totalReps = dayExercises.reduce((sum, ex) => sum + (ex.reps || 0), 0);
        const totalVolume = dayExercises.reduce((sum, ex) => sum + ((ex.weight || 0) * (ex.reps || 0)), 0);

        summaries.push({
          session: {
            id: date,
            user_id: currentUser.id,
            muscle_group: 'Mixed',
            mood_pre: dayExercises[0]?.mood || 'Not recorded',
            notes: `${dayExercises.length} exercises completed`,
            date: date,
            timestamp: dayExercises[0]?.created_at || new Date().toISOString()
          },
          exercises: dayExercises.map(ex => ({
            id: ex.created_at,
            session_id: date,
            name: ex.exercise
          })),
          totalExercises: dayExercises.length,
          totalSets,
          totalReps,
          totalVolume
        });
      });

      console.log(`Created ${summaries.length} workout summaries for user ${currentUser.username}`);
      return summaries;
    } catch (error) {
      console.error('Error fetching recent workouts:', error);
      return [];
    }
  }

  // Get exercises by muscle group (simplified) for current user
  static async getExercisesByMuscleGroup(muscleGroup: string) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.log('No user logged in, returning empty exercises');
        return [];
      }

      const exercises = await this.getExercises(1000, 0);
      return exercises.filter(ex => 
        ex.exercise.toLowerCase().includes(muscleGroup.toLowerCase())
      );
    } catch (error) {
      console.error('Error fetching exercises by muscle group:', error);
      return [];
    }
  }

  // Get user's workout history for current user
  static async getUserWorkoutHistory(limit: number = 20) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.log('No user logged in, returning empty history');
        return [];
      }

      const exercises = await this.getExercises(limit, 0);
      return exercises.map(exercise => ({
        id: exercise.created_at,
        user_id: exercise.user_id?.toString() || currentUser.id,
        exercise_type: exercise.exercise,
        duration: exercise.time,
        transcription: `${exercise.sets} sets of ${exercise.reps} reps`,
        created_at: exercise.created_at
      }));
    } catch (error) {
      console.error('Error fetching user workout history:', error);
      return [];
    }
  }
}