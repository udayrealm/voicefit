import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface Exercise {
  id?: string;
  user_id: number;
  user: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  time: number;
  mood: string;
  created_at?: string;
}

interface AnalyticsData {
  totalExercises: number;
  totalVolume: number;
  averageWeight: number;
  totalTime: number;
  moodDistribution: Record<string, number>;
  exerciseFrequency: Record<string, number>;
  weeklyProgress: Array<{ week: string; volume: number; exercises: number }>;
  monthlyTrends: Array<{ month: string; volume: number; exercises: number }>;
}

const WorkoutAnalytics: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalExercises: 0,
    totalVolume: 0,
    averageWeight: 0,
    totalTime: 0,
    moodDistribution: {},
    exerciseFrequency: {},
    weeklyProgress: [],
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('all');

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    if (exercises.length > 0) {
      calculateAnalytics();
    }
  }, [exercises, selectedTimeframe]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching exercises:', error);
        return;
      }

      setExercises(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    const now = new Date();
    const filteredExercises = exercises.filter(exercise => {
      if (selectedTimeframe === 'all') return true;
      
      const exerciseDate = new Date(exercise.created_at || '');
      const diffTime = now.getTime() - exerciseDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return selectedTimeframe === 'week' ? diffDays <= 7 : diffDays <= 30;
    });

    // Basic stats
    const totalExercises = filteredExercises.length;
    const totalVolume = filteredExercises.reduce((sum, ex) => sum + (ex.weight * ex.reps), 0);
    const totalTime = filteredExercises.reduce((sum, ex) => sum + ex.time, 0);
    
    const exercisesWithWeight = filteredExercises.filter(ex => ex.weight > 0);
    const averageWeight = exercisesWithWeight.length > 0 
      ? exercisesWithWeight.reduce((sum, ex) => sum + ex.weight, 0) / exercisesWithWeight.length 
      : 0;

    // Mood distribution
    const moodDistribution = filteredExercises.reduce((acc, ex) => {
      acc[ex.mood] = (acc[ex.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Exercise frequency
    const exerciseFrequency = filteredExercises.reduce((acc, ex) => {
      acc[ex.exercise] = (acc[ex.exercise] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Weekly progress
    const weeklyProgress = calculateWeeklyProgress(filteredExercises);

    // Monthly trends
    const monthlyTrends = calculateMonthlyTrends(filteredExercises);

    setAnalytics({
      totalExercises,
      totalVolume,
      averageWeight: Math.round(averageWeight),
      totalTime,
      moodDistribution,
      exerciseFrequency,
      weeklyProgress,
      monthlyTrends
    });
  };

  const calculateWeeklyProgress = (exerciseData: Exercise[]) => {
    const weeks: Record<string, { volume: number; exercises: number }> = {};
    
    exerciseData.forEach(exercise => {
      const date = new Date(exercise.created_at || '');
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { volume: 0, exercises: 0 };
      }
      
      weeks[weekKey].volume += exercise.weight * exercise.reps;
      weeks[weekKey].exercises += 1;
    });

    return Object.entries(weeks)
      .map(([week, data]) => ({ week, ...data }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8); // Last 8 weeks
  };

  const calculateMonthlyTrends = (exerciseData: Exercise[]) => {
    const months: Record<string, { volume: number; exercises: number }> = {};
    
    exerciseData.forEach(exercise => {
      const date = new Date(exercise.created_at || '');
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!months[monthKey]) {
        months[monthKey] = { volume: 0, exercises: 0 };
      }
      
      months[monthKey].volume += exercise.weight * exercise.reps;
      months[monthKey].exercises += 1;
    });

    return Object.entries(months)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  };

  const getMoodColor = (mood: string) => {
    const colors = {
      motivated: 'bg-green-500',
      tired: 'bg-red-500',
      focused: 'bg-blue-500',
      energized: 'bg-yellow-500',
      strong: 'bg-purple-500'
    };
    return colors[mood as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Workout Analytics</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedTimeframe('week')}
              className={`px-4 py-2 rounded-md ${
                selectedTimeframe === 'week' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setSelectedTimeframe('month')}
              className={`px-4 py-2 rounded-md ${
                selectedTimeframe === 'month' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setSelectedTimeframe('all')}
              className={`px-4 py-2 rounded-md ${
                selectedTimeframe === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Exercises</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalExercises}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalVolume} lbs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalTime} min</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Weight</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.averageWeight} lbs</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mood Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Mood Distribution</h3>
            <div className="space-y-3">
              {Object.entries(analytics.moodDistribution).map(([mood, count]) => (
                <div key={mood} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${getMoodColor(mood)} mr-3`}></div>
                    <span className="capitalize">{mood}</span>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
              {Object.keys(analytics.moodDistribution).length === 0 && (
                <p className="text-gray-500 text-center py-4">No mood data available</p>
              )}
            </div>
          </div>

          {/* Exercise Frequency */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Most Popular Exercises</h3>
            <div className="space-y-3">
              {Object.entries(analytics.exerciseFrequency)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([exercise, count]) => (
                  <div key={exercise} className="flex items-center justify-between">
                    <span className="capitalize">{exercise}</span>
                    <span className="font-semibold">{count} times</span>
                  </div>
                ))}
              {Object.keys(analytics.exerciseFrequency).length === 0 && (
                <p className="text-gray-500 text-center py-4">No exercise data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Progress Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Weekly Progress */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
            <div className="space-y-2">
              {analytics.weeklyProgress.map((week, index) => (
                <div key={week.week} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Week {index + 1}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm">{week.exercises} exercises</span>
                    <span className="text-sm font-semibold">{week.volume} lbs</span>
                  </div>
                </div>
              ))}
              {analytics.weeklyProgress.length === 0 && (
                <p className="text-gray-500 text-center py-4">No weekly data available</p>
              )}
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
            <div className="space-y-2">
              {analytics.monthlyTrends.map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{month.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm">{month.exercises} exercises</span>
                    <span className="text-sm font-semibold">{month.volume} lbs</span>
                  </div>
                </div>
              ))}
              {analytics.monthlyTrends.length === 0 && (
                <p className="text-gray-500 text-center py-4">No monthly data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutAnalytics; 