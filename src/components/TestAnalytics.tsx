import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface Exercise {
  id?: string;
  user_id: number;
  user: string;
  exercise: string;
  exercise_type: string;
  sets: number;
  reps: number;
  weight: number;
  userweight: number;
  time: number;
  mood: string;
  created_at: string;
}

interface StrengthMetrics {
  totalVolume: number;
  estimated1RM: number;
  strengthToBodyweightRatio: number;
  progressionData: Array<{
    date: string;
    exercise: string;
    weight: number;
    reps: number;
    volume: number;
  }>;
}

interface CardioMetrics {
  timeByType: Record<string, number>;
  consistencyStreak: number;
  mostFrequentType: string;
  timeDistribution: Array<{
    exercise: string;
    time: number;
    type: string;
  }>;
  weeklyTimeByType: Record<string, Record<string, number>>;
}

interface MoodMetrics {
  moodTrends: Array<{
    date: string;
    mood: string;
    exerciseType: string;
  }>;
  moodByExerciseType: Record<string, Record<string, number>>;
  moodVsIntensity: Array<{
    volume: number;
    mood: string;
    exerciseType: string;
  }>;
}

const TestAnalytics: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('all');
  const [strengthMetrics, setStrengthMetrics] = useState<StrengthMetrics>({
    totalVolume: 0,
    estimated1RM: 0,
    strengthToBodyweightRatio: 0,
    progressionData: []
  });
  const [cardioMetrics, setCardioMetrics] = useState<CardioMetrics>({
    timeByType: {},
    consistencyStreak: 0,
    mostFrequentType: '',
    timeDistribution: [],
    weeklyTimeByType: {}
  });
  const [moodMetrics, setMoodMetrics] = useState<MoodMetrics>({
    moodTrends: [],
    moodByExerciseType: {},
    moodVsIntensity: []
  });

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    if (exercises.length > 0) {
      calculateAllMetrics();
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

  const calculateAllMetrics = () => {
    const now = new Date();
    const filteredExercises = exercises.filter(exercise => {
      if (selectedTimeframe === 'all') return true;
      
      const exerciseDate = new Date(exercise.created_at);
      const diffTime = now.getTime() - exerciseDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return selectedTimeframe === 'week' ? diffDays <= 7 : diffDays <= 30;
    });

    calculateStrengthMetrics(filteredExercises);
    calculateCardioMetrics(filteredExercises);
    calculateMoodMetrics(filteredExercises);
  };

  const calculateStrengthMetrics = (exerciseData: Exercise[]) => {
    const strengthExercises = exerciseData.filter(ex => 
      ex.exercise_type?.toLowerCase().includes('strength') || 
      (ex.weight > 0 && ex.sets > 0 && ex.reps > 0)
    );

    // Total Volume
    const totalVolume = strengthExercises.reduce((sum, ex) => 
      sum + (ex.sets * ex.reps * ex.weight), 0
    );

    // Estimated 1RM using Epley formula
    const oneRepMaxes = strengthExercises.map(ex => 
      ex.weight * (1 + ex.reps / 30)
    );
    const estimated1RM = oneRepMaxes.length > 0 
      ? Math.round(oneRepMaxes.reduce((sum, rm) => sum + rm, 0) / oneRepMaxes.length)
      : 0;

    // Strength to Bodyweight Ratio
    const avgUserWeight = exerciseData.reduce((sum, ex) => sum + ex.userweight, 0) / exerciseData.length;
    const strengthToBodyweightRatio = avgUserWeight > 0 ? totalVolume / avgUserWeight : 0;

    // Progression Data
    const progressionData = strengthExercises
      .map(ex => ({
        date: new Date(ex.created_at).toLocaleDateString(),
        exercise: ex.exercise,
        weight: ex.weight,
        reps: ex.reps,
        volume: ex.sets * ex.reps * ex.weight
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setStrengthMetrics({
      totalVolume,
      estimated1RM,
      strengthToBodyweightRatio: Math.round(strengthToBodyweightRatio * 100) / 100,
      progressionData
    });
  };

  const calculateCardioMetrics = (exerciseData: Exercise[]) => {
    // Time by Type
    const timeByType = exerciseData.reduce((acc, ex) => {
      const type = ex.exercise_type || 'Other';
      acc[type] = (acc[type] || 0) + ex.time;
      return acc;
    }, {} as Record<string, number>);

    // Weekly Time Distribution
    const weeklyTimeByType: Record<string, Record<string, number>> = {};
    exerciseData.forEach(ex => {
      const type = ex.exercise_type || 'Other';
      const date = new Date(ex.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyTimeByType[weekKey]) {
        weeklyTimeByType[weekKey] = {};
      }
      weeklyTimeByType[weekKey][type] = (weeklyTimeByType[weekKey][type] || 0) + ex.time;
    });

    // Consistency Streak
    const exerciseDates = exerciseData
      .map(ex => new Date(ex.created_at).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    let currentDate = new Date();
    
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

    // Most Frequent Type
    const typeCounts = exerciseData.reduce((acc, ex) => {
      const type = ex.exercise_type || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentType = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    // Time Distribution
    const timeDistribution = exerciseData
      .filter(ex => ex.time > 0)
      .map(ex => ({
        exercise: ex.exercise,
        time: ex.time,
        type: ex.exercise_type || 'Other'
      }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 10);

    setCardioMetrics({
      timeByType,
      consistencyStreak: streak,
      mostFrequentType,
      timeDistribution,
      weeklyTimeByType
    });
  };

  const calculateMoodMetrics = (exerciseData: Exercise[]) => {
    // Mood Trends
    const moodTrends = exerciseData
      .filter(ex => ex.mood)
      .map(ex => ({
        date: new Date(ex.created_at).toLocaleDateString(),
        mood: ex.mood,
        exerciseType: ex.exercise_type || 'Other'
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Mood by Exercise Type
    const moodByExerciseType = exerciseData.reduce((acc, ex) => {
      if (!ex.mood) return acc;
      
      const type = ex.exercise_type || 'Other';
      if (!acc[type]) acc[type] = {};
      acc[type][ex.mood] = (acc[type][ex.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, Record<string, number>>);

    // Mood vs Intensity
    const moodVsIntensity = exerciseData
      .filter(ex => ex.mood)
      .map(ex => ({
        volume: ex.sets * ex.reps * ex.weight + ex.time,
        mood: ex.mood,
        exerciseType: ex.exercise_type || 'Other'
      }));

    setMoodMetrics({
      moodTrends,
      moodByExerciseType,
      moodVsIntensity
    });
  };

  const getMoodColor = (mood: string) => {
    const colors = {
      motivated: 'bg-green-500',
      tired: 'bg-red-500',
      focused: 'bg-blue-500',
      energized: 'bg-yellow-500',
      strong: 'bg-purple-500',
      exhausted: 'bg-red-600'
    };
    return colors[mood as keyof typeof colors] || 'bg-gray-500';
  };

  const getExerciseTypeColor = (type: string) => {
    const colors = {
      Strength: 'bg-blue-500',
      Cardio: 'bg-red-500',
      Bodyweight: 'bg-green-500',
      Flexibility: 'bg-purple-500',
      Sports: 'bg-orange-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const formatWeekRange = (weekKey: string) => {
    const startDate = new Date(weekKey);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🧠 Test Analytics</h1>
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

        {/* 🔩 Strength Analytics */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🔩 Strength Analytics</h2>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{strengthMetrics.totalVolume.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Volume (lbs)</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{strengthMetrics.estimated1RM}</div>
              <div className="text-sm text-gray-600">Avg Estimated 1RM (lbs)</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{strengthMetrics.strengthToBodyweightRatio}</div>
              <div className="text-sm text-gray-600">Strength/Bodyweight Ratio</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">{strengthMetrics.progressionData.length}</div>
              <div className="text-sm text-gray-600">Strength Sessions</div>
            </div>
          </div>

          {/* Progression Chart */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">📈 Strength Progression</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                {strengthMetrics.progressionData.slice(-10).map((progression, index) => (
                  <div key={index} className="flex items-center justify-between bg-white rounded p-3">
                    <div>
                      <span className="font-medium">{progression.exercise}</span>
                      <span className="text-sm text-gray-500 ml-2">{progression.date}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{progression.volume} lbs</div>
                      <div className="text-sm text-gray-500">
                        {progression.weight} lbs × {progression.reps} reps
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 💨 Cardio / Core / Mobility Analytics */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">💨 Cardio / Core / Mobility Analytics</h2>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{cardioMetrics.consistencyStreak}</div>
              <div className="text-sm text-gray-600">Consistency Streak (days)</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 capitalize">{cardioMetrics.mostFrequentType}</div>
              <div className="text-sm text-gray-600">Most Frequent Type</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(cardioMetrics.timeByType).reduce((sum, time) => sum + time, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Time (min)</div>
            </div>
          </div>

          {/* Weekly Time Distribution */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">📅 Weekly Time Distribution by Exercise Type</h3>
            <div className="space-y-4">
              {Object.entries(cardioMetrics.weeklyTimeByType)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .slice(0, 8)
                .map(([weekKey, typeData]) => (
                  <div key={weekKey} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-blue-600">{formatWeekRange(weekKey)}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(typeData).map(([type, time]) => (
                        <div key={type} className="bg-white rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium capitalize">{type}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getExerciseTypeColor(type)}`}>
                              {type}
                            </span>
                          </div>
                          <div className="text-xl font-bold text-gray-800">{time} min</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ 
                                width: `${(time / Math.max(...Object.values(typeData))) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Time Distribution by Exercise */}
          <div>
            <h3 className="text-lg font-semibold mb-3">⏱️ Time Distribution by Exercise</h3>
            <div className="space-y-2">
              {cardioMetrics.timeDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-3">
                  <div>
                    <span className="font-medium capitalize">{item.exercise}</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium text-white ${getExerciseTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{item.time} min</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 😃 Mood/Well-being Tracking */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">😃 Mood/Well-being Tracking</h2>
          
          {/* Mood Trends */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">📈 Mood Trends Over Time</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                {moodMetrics.moodTrends.slice(-10).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between bg-white rounded p-3">
                    <div>
                      <span className="font-medium">{trend.date}</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium text-white ${getMoodColor(trend.mood)}`}>
                        {trend.mood}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 capitalize">{trend.exerciseType}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mood by Exercise Type */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">💬 Mood by Exercise Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(moodMetrics.moodByExerciseType).map(([type, moods]) => (
                <div key={type} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 capitalize">{type}</h4>
                  <div className="space-y-2">
                    {Object.entries(moods).map(([mood, count]) => (
                      <div key={mood} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${getMoodColor(mood)} mr-2`}></div>
                          <span className="capitalize">{mood}</span>
                        </div>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mood vs Intensity */}
          <div>
            <h3 className="text-lg font-semibold mb-3">📊 Mood vs. Workout Intensity</h3>
            <div className="space-y-2">
              {moodMetrics.moodVsIntensity.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-3">
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getMoodColor(item.mood)}`}>
                      {item.mood}
                    </span>
                    <span className="ml-2 text-sm text-gray-500 capitalize">{item.exerciseType}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{item.volume} intensity</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 📅 Calendar Heatmap */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 Activity Calendar</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (34 - i));
                const dateStr = date.toDateString();
                const hasActivity = exercises.some(ex => 
                  new Date(ex.created_at).toDateString() === dateStr
                );
                
                return (
                  <div
                    key={i}
                    className={`w-12 h-12 rounded ${
                      hasActivity ? 'bg-green-500' : 'bg-gray-200'
                    } flex items-center justify-center text-xs hover:scale-110 transition-transform`}
                    title={`${date.toLocaleDateString()} - ${hasActivity ? 'Active Day' : 'No Activity'}`}
                  >
                    <div className="text-center">
                      <div className="font-semibold">{date.getDate()}</div>
                      <div className="text-xs opacity-75">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                <span className="text-sm">No Activity</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-sm">Active Day</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAnalytics; 