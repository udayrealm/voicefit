import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DataService } from '../utils/dataService';
import { Exercise } from '../types';

// Chart Components
const VolumeChart: React.FC<{ data: Array<{ exercise: string; volume: number }> }> = ({ data }) => {
  const maxVolume = Math.max(...data.map(d => d.volume));
  
  return (
    <div className="space-y-2">
      {data.slice(0, 5).map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-20 text-xs font-medium text-gray-600 truncate">
            {item.exercise}
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(item.volume / maxVolume) * 100}%` }}
            ></div>
          </div>
          <div className="w-16 text-xs font-semibold text-gray-800">
            {item.volume.toLocaleString()} lbs
          </div>
        </div>
      ))}
    </div>
  );
};

const TimeDistributionChart: React.FC<{ data: Record<string, number> }> = ({ data }) => {
  const total = Object.values(data).reduce((sum, time) => sum + time, 0);
  
  return (
    <div className="space-y-2">
      {Object.entries(data).slice(0, 5).map(([type, time], index) => {
        const percentage = total > 0 ? (time / total) * 100 : 0;
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
        
        return (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-xs font-medium text-gray-600 truncate">
              {type}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="w-16 text-xs font-semibold text-gray-800">
              {time} min
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MoodTrendChart: React.FC<{ data: Array<{ date: string; mood: string }> }> = ({ data }) => {
  const moodColors = {
    motivated: 'bg-green-500',
    energized: 'bg-yellow-500',
    focused: 'bg-blue-500',
    strong: 'bg-purple-500',
    tired: 'bg-orange-500',
    exhausted: 'bg-red-500'
  };
  
  return (
    <div className="flex space-x-1">
      {data.slice(-7).map((item, index) => (
        <div key={index} className="flex-1">
          <div className={`h-8 rounded ${moodColors[item.mood as keyof typeof moodColors] || 'bg-gray-300'}`}></div>
          <div className="text-xs text-gray-500 mt-1 text-center">{item.date}</div>
        </div>
      ))}
    </div>
  );
};

const ActivityHeatmap: React.FC<{ exercises: Exercise[] }> = ({ exercises }) => {
  const getActivityLevel = (date: Date) => {
    const dateStr = date.toDateString();
    const dayExercises = exercises.filter(ex => 
      new Date(ex.created_at).toDateString() === dateStr
    );
    
    if (dayExercises.length === 0) return 0;
    if (dayExercises.length >= 3) return 3;
    if (dayExercises.length >= 2) return 2;
    return 1;
  };
  
  const getColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-gray-200';
      case 1: return 'bg-green-300';
      case 2: return 'bg-green-400';
      case 3: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  // Generate dates for the last 5 weeks (35 days)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 34; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    
    return dates;
  };

  const dates = generateDates();
  
  return (
    <div className="space-y-2">
      {/* Week labels */}
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="w-8 text-center">{day}</div>
        ))}
      </div>
      
      {/* Heatmap grid */}
      <div className="grid grid-cols-7 gap-1">
        {dates.map((date, i) => {
          const level = getActivityLevel(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={i}
              className={`w-8 h-8 rounded ${getColor(level)} transition-all duration-200 hover:scale-110 relative ${
                isToday ? 'ring-2 ring-blue-400' : ''
              }`}
              title={`${date.toLocaleDateString()} - Level ${level} (${level === 0 ? 'No Activity' : level === 1 ? 'Light' : level === 2 ? 'Moderate' : 'Heavy'} Activity)`}
            >
              {/* Show date number for today */}
              {isToday && (
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                  {date.getDate()}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Date range info */}
      <div className="text-xs text-gray-500 mt-2 text-center">
        {dates[0].toLocaleDateString()} - {dates[dates.length - 1].toLocaleDateString()}
      </div>
    </div>
  );
};

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
  strengthGains: {
    weeklyGrowth: number;
    monthlyGrowth: number;
    bestExercise: string;
    improvementRate: number;
    avgReps: number;
    mostImproved: string;
  };
  maxWeight: number;
  volumeChartData: Array<{ exercise: string; volume: number }>;
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
  totalTime: number;
  longestWorkout: { exercise: string; time: number } | null;
  cardioInsights: {
    weeklyProgress: number;
    enduranceScore: number;
    varietyScore: number;
    consistencyScore: number;
  };
  longestSession: Exercise | null;
  cardioFrequency: number;
  cardioMoodData: Array<{ date: string; mood: string; time: number }>;
}

interface CoreMetrics {
  totalReps: number;
  mostPerformed: string;
  avgDuration: number;
  weeklyCoreSessions: number;
  repsChartData: Array<{ exercise: string; reps: number }>;
  coreExercises: number;
}

interface MobilityMetrics {
  totalTime: number;
  mobilityFrequency: number;
  mobilityMoodData: Array<{ date: string; mood: string; time: number }>;
  bestMobilityDay: { date: string; mood: string; time: number } | null;
  mobilityTypeDistribution: Record<string, number>;
  averageMoodAfterMobility: number;
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
  bestDay: string;
  wellnessInsights: {
    averageMood: string;
    moodImprovement: number;
    stressRelief: number;
    energyLevels: number;
  };
}

const TestAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('all');
  const [strengthMetrics, setStrengthMetrics] = useState<StrengthMetrics>({
    totalVolume: 0,
    estimated1RM: 0,
    strengthToBodyweightRatio: 0,
    progressionData: [],
    strengthGains: {
      weeklyGrowth: 0,
      monthlyGrowth: 0,
      bestExercise: '',
      improvementRate: 0,
      avgReps: 0,
      mostImproved: ''
    },
    maxWeight: 0,
    volumeChartData: []
  });
  const [cardioMetrics, setCardioMetrics] = useState<CardioMetrics>({
    timeByType: {},
    consistencyStreak: 0,
    mostFrequentType: '',
    timeDistribution: [],
    weeklyTimeByType: {},
    totalTime: 0,
    longestWorkout: null,
    cardioInsights: {
      weeklyProgress: 0,
      enduranceScore: 0,
      varietyScore: 0,
      consistencyScore: 0
    },
    longestSession: null,
    cardioFrequency: 0,
    cardioMoodData: []
  });
  const [coreMetrics, setCoreMetrics] = useState<CoreMetrics>({
    totalReps: 0,
    mostPerformed: '',
    avgDuration: 0,
    weeklyCoreSessions: 0,
    repsChartData: [],
    coreExercises: 0
  });
  const [mobilityMetrics, setMobilityMetrics] = useState<MobilityMetrics>({
    totalTime: 0,
    mobilityFrequency: 0,
    mobilityMoodData: [],
    bestMobilityDay: null,
    mobilityTypeDistribution: {},
    averageMoodAfterMobility: 0
  });
  const [moodMetrics, setMoodMetrics] = useState<MoodMetrics>({
    moodTrends: [],
    moodByExerciseType: {},
    moodVsIntensity: [],
    bestDay: '',
    wellnessInsights: {
      averageMood: '',
      moodImprovement: 0,
      stressRelief: 0,
      energyLevels: 0
    }
  });

  useEffect(() => {
    if (user) {
      fetchExercises();
    }
  }, [user]);

  useEffect(() => {
    if (exercises.length > 0) {
      calculateAllMetrics();
    }
  }, [exercises, selectedTimeframe]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const exercisesData = await DataService.getExercises(1000);
      console.log(`Fetched exercises for user ${user?.username}:`, exercisesData);
      setExercises(exercisesData);
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
    calculateCoreMetrics(filteredExercises);
    calculateMobilityMetrics(filteredExercises);
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
    const avgUserWeight = exerciseData.reduce((sum, ex) => sum + (ex.userweight || 0), 0) / exerciseData.length;
    const strengthToBodyweightRatio = avgUserWeight > 0 ? totalVolume / avgUserWeight : 0;

    // Average Reps
    const avgReps = strengthExercises.length > 0 
      ? Math.round(strengthExercises.reduce((sum, ex) => sum + ex.reps, 0) / strengthExercises.length)
      : 0;

    // Max Weight Lifted
    const maxWeight = strengthExercises.length > 0 
      ? Math.max(...strengthExercises.map(ex => ex.weight))
      : 0;

    // Volume by Exercise
    const volumeByExercise = strengthExercises.reduce((acc, ex) => {
      const volume = ex.sets * ex.reps * ex.weight;
      acc[ex.exercise] = (acc[ex.exercise] || 0) + volume;
      return acc;
    }, {} as Record<string, number>);

    const volumeChartData = Object.entries(volumeByExercise)
      .map(([exercise, volume]) => ({ exercise, volume }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);

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

    // Strength Gains Analysis
    const weeklyData = progressionData.slice(-7);
    const monthlyData = progressionData.slice(-30);
    
    const weeklyGrowth = weeklyData.length > 1 
      ? ((weeklyData[weeklyData.length - 1]?.volume || 0) - (weeklyData[0]?.volume || 0)) / (weeklyData[0]?.volume || 1) * 100
      : 0;
    
    const monthlyGrowth = monthlyData.length > 1
      ? ((monthlyData[monthlyData.length - 1]?.volume || 0) - (monthlyData[0]?.volume || 0)) / (monthlyData[0]?.volume || 1) * 100
      : 0;

    // Best Exercise by Volume
    const bestExercise = Object.entries(volumeByExercise)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    // Most Improved Exercise
    const exerciseProgress = strengthExercises.reduce((acc, ex) => {
      if (!acc[ex.exercise]) {
        acc[ex.exercise] = { weights: [], reps: [] };
      }
      acc[ex.exercise].weights.push(ex.weight);
      acc[ex.exercise].reps.push(ex.reps);
      return acc;
    }, {} as Record<string, { weights: number[], reps: number[] }>);

    let mostImproved = 'None';
    let maxImprovement = 0;
    Object.entries(exerciseProgress).forEach(([exercise, data]) => {
      if (data.weights.length > 1) {
        const weightImprovement = (data.weights[data.weights.length - 1] - data.weights[0]) / data.weights[0] * 100;
        const repImprovement = (data.reps[data.reps.length - 1] - data.reps[0]) / data.reps[0] * 100;
        const totalImprovement = weightImprovement + repImprovement;
        if (totalImprovement > maxImprovement) {
          maxImprovement = totalImprovement;
          mostImproved = exercise;
        }
      }
    });

    // Improvement Rate
    const improvementRate = progressionData.length > 1
      ? ((progressionData[progressionData.length - 1]?.volume || 0) - (progressionData[0]?.volume || 0)) / (progressionData[0]?.volume || 1) * 100
      : 0;

    setStrengthMetrics({
      totalVolume,
      estimated1RM,
      strengthToBodyweightRatio: Math.round(strengthToBodyweightRatio * 100) / 100,
      progressionData,
      maxWeight,
      volumeChartData,
      strengthGains: {
        weeklyGrowth: Math.round(weeklyGrowth * 100) / 100,
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
        bestExercise,
        improvementRate: Math.round(improvementRate * 100) / 100,
        avgReps: avgReps,
        mostImproved: mostImproved
      }
    });
  };

  const calculateCardioMetrics = (exerciseData: Exercise[]) => {
    const cardioExercises = exerciseData.filter(ex => 
      ex.exercise_type?.toLowerCase().includes('cardio') || 
      (ex.time > 0 && !ex.weight)
    );

    // Time by Type
    const timeByType = cardioExercises.reduce((acc, ex) => {
      const type = ex.exercise_type || 'Cardio';
      acc[type] = (acc[type] || 0) + ex.time;
      return acc;
    }, {} as Record<string, number>);

    // Total Time across all workouts
    const totalTime = cardioExercises.reduce((sum, ex) => sum + (ex.time || 0), 0);

    // Longest Cardio Session
    const longestSession = cardioExercises.length > 0 
      ? cardioExercises.reduce((max, ex) => ex.time > max.time ? ex : max)
      : null;

    // Cardio Frequency
    const cardioFrequency = cardioExercises.length;

    // Mood Impact Analysis
    const cardioMoodData = cardioExercises
      .filter(ex => ex.mood)
      .map(ex => ({
        date: new Date(ex.created_at).toLocaleDateString(),
        mood: ex.mood,
        time: ex.time
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Weekly Time Distribution
    const weeklyTimeByType: Record<string, Record<string, number>> = {};
    cardioExercises.forEach(ex => {
      const type = ex.exercise_type || 'Cardio';
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
    const exerciseDates = cardioExercises
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
    const typeCounts = cardioExercises.reduce((acc, ex) => {
      const type = ex.exercise_type || 'Cardio';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentType = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    // Time Distribution
    const timeDistribution = cardioExercises
      .filter(ex => ex.time > 0)
      .map(ex => ({
        exercise: ex.exercise,
        time: ex.time,
        type: ex.exercise_type || 'Cardio'
      }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 10);

    // Longest Workout
    const longestWorkout = timeDistribution.length > 0 ? timeDistribution[0] : null;

    // Cardio Insights
    const weeklyProgress = Object.values(timeByType).reduce((sum, time) => sum + time, 0) / 7;
    const enduranceScore = Math.min(100, (Object.values(timeByType).reduce((sum, time) => sum + time, 0) / 60) * 10);
    const varietyScore = Math.min(100, Object.keys(timeByType).length * 20);
    const consistencyScore = Math.min(100, streak * 10);

    setCardioMetrics({
      timeByType,
      consistencyStreak: streak,
      mostFrequentType,
      timeDistribution,
      weeklyTimeByType,
      totalTime: totalTime,
      longestWorkout: longestWorkout,
      longestSession,
      cardioFrequency,
      cardioMoodData,
      cardioInsights: {
        weeklyProgress: Math.round(weeklyProgress),
        enduranceScore: Math.round(enduranceScore),
        varietyScore: Math.round(varietyScore),
        consistencyScore: Math.round(consistencyScore)
      }
    });
  };

  const calculateCoreMetrics = (exerciseData: Exercise[]) => {
    const coreExercises = exerciseData.filter(ex => 
      ex.exercise_type?.toLowerCase().includes('core') || 
      ex.exercise?.toLowerCase().includes('plank') ||
      ex.exercise?.toLowerCase().includes('crunch') ||
      ex.exercise?.toLowerCase().includes('sit-up')
    );

    // Total Reps
    const totalReps = coreExercises.reduce((sum, ex) => sum + (ex.reps || 0), 0);

    // Most Performed Core Exercise
    const exerciseCounts = coreExercises.reduce((acc, ex) => {
      acc[ex.exercise] = (acc[ex.exercise] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostPerformed = Object.entries(exerciseCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    // Avg Duration per Core Session
    const avgDuration = coreExercises.length > 0 
      ? Math.round(coreExercises.reduce((sum, ex) => sum + (ex.time || 0), 0) / coreExercises.length)
      : 0;

    // Core Consistency (Weekly frequency)
    const weeklyCoreSessions = coreExercises.filter(ex => {
      const exerciseDate = new Date(ex.created_at);
      const now = new Date();
      const diffDays = Math.ceil((now.getTime() - exerciseDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length;

    // Reps by Exercise
    const repsByExercise = coreExercises.reduce((acc, ex) => {
      acc[ex.exercise] = (acc[ex.exercise] || 0) + (ex.reps || 0);
      return acc;
    }, {} as Record<string, number>);

    const repsChartData = Object.entries(repsByExercise)
      .map(([exercise, reps]) => ({ exercise, reps }))
      .sort((a, b) => b.reps - a.reps)
      .slice(0, 5);

    setCoreMetrics({
      totalReps,
      mostPerformed,
      avgDuration,
      weeklyCoreSessions,
      repsChartData,
      coreExercises: coreExercises.length
    });
  };

  const calculateMobilityMetrics = (exerciseData: Exercise[]) => {
    const mobilityExercises = exerciseData.filter(ex => 
      ex.exercise_type?.toLowerCase().includes('mobility') || 
      ex.exercise_type?.toLowerCase().includes('flexibility') ||
      ex.exercise?.toLowerCase().includes('yoga') ||
      ex.exercise?.toLowerCase().includes('stretch')
    );

    // Total Time Spent
    const totalTime = mobilityExercises.reduce((sum, ex) => sum + (ex.time || 0), 0);

    // Mobility Frequency
    const mobilityFrequency = mobilityExercises.length;

    // Mood Improvement Analysis
    const mobilityMoodData = mobilityExercises
      .filter(ex => ex.mood)
      .map(ex => ({
        date: new Date(ex.created_at).toLocaleDateString(),
        mood: ex.mood,
        time: ex.time
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Best Mobility Day (Highest mood score)
    const moodValues = {
      motivated: 5,
      energized: 4,
      focused: 4,
      strong: 3,
      tired: 2,
      exhausted: 1
    };

    const bestMobilityDay = mobilityMoodData.length > 0 
      ? mobilityMoodData.reduce((best, current) => {
          const currentScore = moodValues[current.mood as keyof typeof moodValues] || 3;
          const bestScore = moodValues[best.mood as keyof typeof moodValues] || 3;
          return currentScore > bestScore ? current : best;
        })
      : null;

    // Mobility Type Distribution
    const mobilityTypeDistribution = mobilityExercises.reduce((acc, ex) => {
      const type = ex.exercise_type || 'Mobility';
      acc[type] = (acc[type] || 0) + (ex.time || 0);
      return acc;
    }, {} as Record<string, number>);

    // Average Mood After Mobility
    const averageMoodAfterMobility = mobilityMoodData.length > 0
      ? mobilityMoodData.reduce((sum, item) => sum + (moodValues[item.mood as keyof typeof moodValues] || 3), 0) / mobilityMoodData.length
      : 0;

    setMobilityMetrics({
      totalTime,
      mobilityFrequency,
      mobilityMoodData,
      bestMobilityDay,
      mobilityTypeDistribution,
      averageMoodAfterMobility
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

    // Best Day (highest volume or mood)
    const dayVolumes = exerciseData.reduce((acc, ex) => {
      const date = new Date(ex.created_at).toLocaleDateString();
      const volume = ex.sets * ex.reps * ex.weight + ex.time;
      acc[date] = (acc[date] || 0) + volume;
      return acc;
    }, {} as Record<string, number>);

    const bestDay = Object.entries(dayVolumes)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    // Wellness Insights
    const moodValues = {
      motivated: 5,
      energized: 4,
      focused: 4,
      strong: 3,
      tired: 2,
      exhausted: 1
    };

    const averageMoodScore = moodTrends.length > 0
      ? moodTrends.reduce((sum, trend) => sum + (moodValues[trend.mood as keyof typeof moodValues] || 3), 0) / moodTrends.length
      : 3;

    const averageMood = averageMoodScore >= 4 ? 'Excellent' : averageMoodScore >= 3 ? 'Good' : 'Needs Improvement';
    
    const moodImprovement = moodTrends.length > 1
      ? ((moodValues[moodTrends[moodTrends.length - 1]?.mood as keyof typeof moodValues] || 3) - (moodValues[moodTrends[0]?.mood as keyof typeof moodValues] || 3)) * 20
      : 0;

    const stressRelief = moodTrends.filter(trend => 
      ['motivated', 'energized', 'focused'].includes(trend.mood)
    ).length / Math.max(moodTrends.length, 1) * 100;

    const energyLevels = moodTrends.filter(trend => 
      ['motivated', 'energized', 'strong'].includes(trend.mood)
    ).length / Math.max(moodTrends.length, 1) * 100;

    setMoodMetrics({
      moodTrends,
      moodByExerciseType,
      moodVsIntensity,
      bestDay: bestDay,
      wellnessInsights: {
        averageMood,
        moodImprovement: Math.round(moodImprovement),
        stressRelief: Math.round(stressRelief),
        energyLevels: Math.round(energyLevels)
      }
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

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    if (value >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressEmoji = (value: number) => {
    if (value >= 80) return '🚀';
    if (value >= 60) return '📈';
    if (value >= 40) return '📊';
    return '📉';
  };

  const generateDynamicTips = () => {
    const tips = [];
    
    // Strength tips
    if (strengthMetrics.strengthGains.weeklyGrowth > 10) {
      tips.push({ type: 'strength', message: '🔥 You\'re gaining strength rapidly! Keep up the progressive overload.', icon: '💪' });
    }
    if (strengthMetrics.strengthGains.mostImproved !== 'None') {
      tips.push({ type: 'strength', message: `📈 ${strengthMetrics.strengthGains.mostImproved} is your most improved exercise!`, icon: '🏆' });
    }
    
    // Cardio tips
    if (cardioMetrics.consistencyStreak > 5) {
      tips.push({ type: 'cardio', message: '🔥 Amazing consistency! You\'re building great habits.', icon: '🔥' });
    }
    if (cardioMetrics.longestWorkout) {
      tips.push({ type: 'cardio', message: `⏱️ Your longest workout: ${cardioMetrics.longestWorkout.exercise} (${cardioMetrics.longestWorkout.time} min)`, icon: '⏰' });
    }
    
    // Mood tips
    if (moodMetrics.wellnessInsights.stressRelief > 70) {
      tips.push({ type: 'mood', message: '🧘 Your workouts are great for stress relief!', icon: '😌' });
    }
    if (moodMetrics.bestDay !== 'None') {
      tips.push({ type: 'mood', message: `📅 Your best day was ${moodMetrics.bestDay} - try to replicate that energy!`, icon: '⭐' });
    }
    
    // General tips
    if (exercises.length > 20) {
      tips.push({ type: 'general', message: '🎯 You\'re a consistent fitness enthusiast!', icon: '💯' });
    }
    if (strengthMetrics.strengthGains.avgReps > 8) {
      tips.push({ type: 'strength', message: '💪 High rep ranges suggest good endurance!', icon: '🏃' });
    }
    
    return tips.slice(0, 3); // Return top 3 tips
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-yellow-600 text-2xl">🔒</span>
          </div>
          <h3 className="text-yellow-800 font-bold mb-2">Authentication Required</h3>
          <p className="text-yellow-700">Please log in to view your performance trends.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your performance trends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* User Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">🧠 {user.username}'s Performance Analytics</h1>
              <p className="text-indigo-100">Advanced fitness insights and progress tracking</p>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedTimeframe('week')}
              className={`px-4 py-2 rounded-md transition-all ${
                selectedTimeframe === 'week' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              📅 Week
            </button>
            <button
              onClick={() => setSelectedTimeframe('month')}
              className={`px-4 py-2 rounded-md transition-all ${
                selectedTimeframe === 'month' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              📊 Month
            </button>
            <button
              onClick={() => setSelectedTimeframe('all')}
              className={`px-4 py-2 rounded-md transition-all ${
                selectedTimeframe === 'all' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              🎯 All Time
            </button>
          </div>
        </div>

        {/* Quick Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
              <div className="text-2xl font-bold text-blue-600">{strengthMetrics.totalVolume.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Volume</div>
            </div>
              <div className="text-3xl">💪</div>
            </div>
            <div className="mt-2 text-xs text-blue-500">
              {strengthMetrics.strengthGains.improvementRate > 0 ? '↗️ Improving' : '📊 Stable'}
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                <div className="text-2xl font-bold text-green-600">{cardioMetrics.totalTime}</div>
                <div className="text-sm text-gray-600">Total Time (min)</div>
                  </div>
              <div className="text-3xl">⏱️</div>
                </div>
            <div className="mt-2 text-xs text-green-500">
              {cardioMetrics.consistencyStreak > 3 ? '🔥 Consistent' : 'Keep going!'}
                </div>
              </div>
              
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                <div className="text-2xl font-bold text-purple-600">{strengthMetrics.strengthGains.avgReps}</div>
                <div className="text-sm text-gray-600">Avg Reps</div>
                  </div>
                  <div className="text-3xl">📊</div>
                </div>
            <div className="mt-2 text-xs text-purple-500">
              {strengthMetrics.strengthGains.avgReps > 8 ? '💪 Endurance' : '💪 Strength'}
            </div>
              </div>
              
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                <div className="text-2xl font-bold text-orange-600">{exercises.length}</div>
                <div className="text-sm text-gray-600">Total Sessions</div>
                  </div>
              <div className="text-3xl">📈</div>
            </div>
            <div className="mt-2 text-xs text-orange-500">
              {exercises.length > 10 ? '🎯 Consistent' : 'Getting started'}
                </div>
              </div>
            </div>

        {/* Dynamic Tips */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">💡 Smart Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {generateDynamicTips().map((tip, index) => (
              <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{tip.icon}</span>
                  <span className="font-semibold text-gray-800 capitalize">{tip.type}</span>
                        </div>
                <p className="text-sm text-gray-700">{tip.message}</p>
                      </div>
                    ))}
                </div>
              </div>

        {/* Performance Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Strength Performance Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">💪 Strength Performance</h2>
              <div className="text-2xl">🏋️</div>
            </div>
            
                <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Best Exercise</span>
                <span className="font-semibold text-blue-600 capitalize">{strengthMetrics.strengthGains.bestExercise}</span>
                    </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Most Improved</span>
                <span className="font-semibold text-green-600 capitalize">{strengthMetrics.strengthGains.mostImproved}</span>
                    </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Max Weight</span>
                <span className="font-semibold text-purple-600">{strengthMetrics.maxWeight} lbs</span>
                  </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Weekly Growth</span>
                <span className={`font-semibold ${getProgressColor(strengthMetrics.strengthGains.weeklyGrowth)}`}>
                  {getProgressEmoji(strengthMetrics.strengthGains.weeklyGrowth)} {strengthMetrics.strengthGains.weeklyGrowth}%
                      </span>
                  </div>

              {strengthMetrics.progressionData.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 mb-2">Recent Achievement</div>
                  <div className="text-xs text-blue-600">
                    {strengthMetrics.progressionData[strengthMetrics.progressionData.length - 1]?.exercise} - 
                    {strengthMetrics.progressionData[strengthMetrics.progressionData.length - 1]?.volume} lbs
                    </div>
                  </div>
              )}
                </div>
              </div>

          {/* Endurance & Mobility Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">💨 Endurance & Mobility</h2>
              <div className="text-2xl">🏃</div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Favorite Activity</span>
                <span className="font-semibold text-green-600 capitalize">{cardioMetrics.mostFrequentType}</span>
                      </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cardio Sessions</span>
                <span className="font-semibold text-red-600">{cardioMetrics.cardioFrequency}</span>
                        </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Endurance Score</span>
                <span className={`font-semibold ${getProgressColor(cardioMetrics.cardioInsights.enduranceScore)}`}>
                  {getProgressEmoji(cardioMetrics.cardioInsights.enduranceScore)} {cardioMetrics.cardioInsights.enduranceScore}%
                </span>
                        </div>
              
              {cardioMetrics.longestSession && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-800 mb-2">Longest Session</div>
                  <div className="text-xs text-green-600">
                    {cardioMetrics.longestSession.exercise} - {cardioMetrics.longestSession.time} min
                        </div>
                      </div>
              )}
                      </div>
                    </div>
              </div>

        {/* Exercise Type Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Strength Volume Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Volume by Exercise</h3>
            {strengthMetrics.volumeChartData.length > 0 ? (
              <VolumeChart data={strengthMetrics.volumeChartData} />
            ) : (
              <p className="text-gray-500 text-sm">No strength data available</p>
            )}
            </div>

          {/* Cardio Time Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">⏱️ Time by Activity</h3>
            {Object.keys(cardioMetrics.timeByType).length > 0 ? (
              <TimeDistributionChart data={cardioMetrics.timeByType} />
            ) : (
              <p className="text-gray-500 text-sm">No cardio data available</p>
            )}
          </div>
        </div>

        {/* Core & Mobility Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Core Performance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">🔥 Core Performance</h3>
              <div className="text-xl">💪</div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Reps</span>
                <span className="font-semibold text-orange-600">{coreMetrics.totalReps}</span>
            </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Most Performed</span>
                <span className="font-semibold text-green-600 capitalize">{coreMetrics.mostPerformed}</span>
          </div>

                <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Duration</span>
                <span className="font-semibold text-blue-600">{coreMetrics.avgDuration} min</span>
              </div>
              
                <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Weekly Sessions</span>
                <span className="font-semibold text-purple-600">{coreMetrics.weeklyCoreSessions}</span>
                    </div>
                  </div>
                </div>

          {/* Mobility & Recovery */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">🧘 Mobility & Recovery</h3>
              <div className="text-xl">🧘</div>
              </div>
              
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Time</span>
                <span className="font-semibold text-green-600">{mobilityMetrics.totalTime} min</span>
              </div>
              
                <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sessions</span>
                <span className="font-semibold text-blue-600">{mobilityMetrics.mobilityFrequency}</span>
            </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Mood</span>
                <span className="font-semibold text-purple-600">
                  {mobilityMetrics.averageMoodAfterMobility > 0 ? Math.round(mobilityMetrics.averageMoodAfterMobility) : 'N/A'}
                          </span>
              </div>

              {mobilityMetrics.bestMobilityDay && (
                <div className="mt-3 p-2 bg-purple-50 rounded">
                  <div className="text-xs font-medium text-purple-800">Best Day</div>
                  <div className="text-xs text-purple-600">
                    {mobilityMetrics.bestMobilityDay.date} - {mobilityMetrics.bestMobilityDay.mood}
                    </div>
                  </div>
              )}
                    </div>
              </div>
            </div>

        {/* Mood Trends & Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Mood Trends */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">😃 Mood Trends</h3>
            {moodMetrics.moodTrends.length > 0 ? (
              <MoodTrendChart data={moodMetrics.moodTrends} />
            ) : (
              <p className="text-gray-500 text-sm">No mood data available</p>
            )}
            </div>

          {/* Activity Heatmap */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📅 Activity Heatmap</h3>
            <ActivityHeatmap exercises={exercises} />
            <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
                        <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-200 rounded mr-1"></div>
                <span>No Activity</span>
                        </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-300 rounded mr-1"></div>
                <span>Light</span>
                          </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded mr-1"></div>
                <span>Moderate</span>
                        </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                <span>Heavy</span>
                      </div>
              </div>
            </div>
          </div>

        {/* Wellness & Mood Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">😃 Wellness & Mood</h2>
            <div className="text-2xl">🧠</div>
                  </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl mb-2">🧘</div>
              <div className="text-lg font-bold text-green-600">{moodMetrics.wellnessInsights.stressRelief}%</div>
              <div className="text-sm text-gray-600">Stress Relief</div>
                  </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-lg font-bold text-blue-600">{moodMetrics.wellnessInsights.energyLevels}%</div>
              <div className="text-sm text-gray-600">Energy Boost</div>
                </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-lg font-bold text-purple-600">{moodMetrics.wellnessInsights.moodImprovement}%</div>
              <div className="text-sm text-gray-600">Mood Progress</div>
          </div>
        </div>

          {/* Best Day Highlight */}
          {moodMetrics.bestDay !== 'None' && (
            <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⭐</span>
                <span className="font-semibold text-yellow-800">Best Day</span>
                    </div>
              <p className="text-sm text-yellow-700 mt-1">
                Your most productive day was {moodMetrics.bestDay} - try to replicate that energy!
              </p>
                  </div>
          )}
          
          {moodMetrics.wellnessInsights.averageMood === 'Excellent' && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎉</span>
                <span className="font-semibold text-green-800">Excellent Progress!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">Your wellness routine is working perfectly. Keep up the great work!</p>
            </div>
          )}
          
          {moodMetrics.wellnessInsights.averageMood === 'Good' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">👍</span>
                <span className="font-semibold text-blue-800">Good Foundation</span>
                        </div>
              <p className="text-sm text-blue-700 mt-1">You're on the right track. Try adding more variety to boost your mood further.</p>
                      </div>
          )}
          
          {moodMetrics.wellnessInsights.averageMood === 'Needs Improvement' && (
            <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">💪</span>
                <span className="font-semibold text-orange-800">Room for Growth</span>
                  </div>
              <p className="text-sm text-orange-700 mt-1">Focus on activities that energize you and consider shorter, more frequent sessions.</p>
                  </div>
          )}
        </div>

        {/* Activity Calendar */}
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

        {/* No Data Message */}
        {exercises.length === 0 && (
          <div className="text-center py-8 mt-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-gray-400 text-2xl">📊</span>
            </div>
            <p className="text-gray-800 font-medium">No performance data found yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Start recording your workouts to see your advanced analytics here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAnalytics; 