import { supabase } from './supabase';
import { Exercise } from '../types';

export class DataService {
  // Default user identifier
  private static DEFAULT_USER = 'user1';

  // Fetch all exercises with pagination for default user
  static async getExercises(limit: number = 50, offset: number = 0, user: string = this.DEFAULT_USER) {
    try {
      console.log(`Fetching exercises for user ${user}...`);
      
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('user', user) // Changed from 'user_id' to 'user'
        .order('user_id', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} exercises for user ${user}`);
      return data || [];
    } catch (error) {
      console.error('Error fetching exercises:', error);
      return [];
    }
  }

  // Insert sample exercise data for testing with default user
  static async insertSampleExercises(user: string = this.DEFAULT_USER) {
    try {
      console.log(`Inserting sample exercises for user ${user}...`);
      
      const sampleExercises = [
        {
          user_id: 1, // Keep numeric user_id for database compatibility
          user: user, // Add string user field
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
          user_id: 1,
          user: user,
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
          user_id: 1,
          user: user,
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
          user_id: 1,
          user: user,
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
          user_id: 1,
          user: user,
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
          user_id: 1,
          user: user,
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
          user_id: 1,
          user: user,
          exercise: 'Lunges',
          sets: 3,
          reps: 10,
          weight: 45,
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
      
      console.log(`Successfully inserted ${data?.length || 0} sample exercises for user ${user}`);
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

  // Calculate comprehensive stats from exercises table only for default user
  static async getQuickStats(user: string = this.DEFAULT_USER) {
    try {
      console.log(`Calculating quick stats for user ${user}...`);
      
      // Fetch all exercises for the user
      const exercises = await this.getExercises(1000, 0, user);

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

  // Get recent workout summaries from exercises only for default user
  static async getRecentWorkouts(limit: number = 5, user: string = this.DEFAULT_USER) {
    try {
      console.log(`Fetching recent workouts for user ${user}...`);
      
      const exercises = await this.getExercises(limit * 10, 0, user); // Get more exercises to group by date
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
            user_id: dayExercises[0]?.user || user,
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

      console.log(`Created ${summaries.length} workout summaries for user ${user}`);
      return summaries;
    } catch (error) {
      console.error('Error fetching recent workouts:', error);
      return [];
    }
  }

  // Get exercises by muscle group (simplified) for default user
  static async getExercisesByMuscleGroup(muscleGroup: string, user: string = this.DEFAULT_USER) {
    try {
      const exercises = await this.getExercises(1000, 0, user);
      return exercises.filter(ex => 
        ex.exercise.toLowerCase().includes(muscleGroup.toLowerCase())
      );
    } catch (error) {
      console.error('Error fetching exercises by muscle group:', error);
      return [];
    }
  }

  // Get user's workout history for default user
  static async getUserWorkoutHistory(user: string = this.DEFAULT_USER, limit: number = 20) {
    try {
      const exercises = await this.getExercises(limit, 0, user);
      return exercises.map(exercise => ({
        id: exercise.created_at,
        user_id: exercise.user || exercise.user_id?.toString() || user,
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