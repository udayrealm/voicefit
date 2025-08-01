import React, { useEffect, useState } from 'react';
import { DataService } from '../utils/dataService';
import { Exercise } from '../types';

const AnalyticsScreen: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExercisesData();
  }, []);

  const fetchExercisesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const exercisesData = await DataService.getExercises(1000); // Get more data for better analytics
      console.log('Fetched exercises:', exercisesData);
      setExercises(exercisesData);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setError('Failed to fetch exercise data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    if (exercises.length === 0) {
      return {
        totalExercises: 0,
        totalVolume: 0,
        totalSets: 0,
        totalReps: 0,
        totalTime: 0,
        avgWeight: 0,
        avgReps: 0,
        avgSets: 0,
        exerciseTypes: {},
        weeklyData: [],
        monthlyData: [],
        topExercises: [],
        weightDistribution: {},
        timeDistribution: {},
        moodAnalysis: {},
        recentExercises: []
      };
    }

    // Basic calculations
    const totalExercises = exercises.length;
    const totalVolume = exercises.reduce((sum, ex) => sum + ((ex.weight || 0) * (ex.reps || 0)), 0);
    const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
    const totalReps = exercises.reduce((sum, ex) => sum + (ex.reps || 0), 0);
    const totalTime = exercises.reduce((sum, ex) => sum + (ex.time || 0), 0);
    
    // Average calculations
    const exercisesWithWeight = exercises.filter(ex => ex.weight > 0);
    const avgWeight = exercisesWithWeight.length > 0 
      ? exercisesWithWeight.reduce((sum, ex) => sum + ex.weight, 0) / exercisesWithWeight.length 
      : 0;
    
    const avgReps = exercises.length > 0 
      ? exercises.reduce((sum, ex) => sum + (ex.reps || 0), 0) / exercises.length 
      : 0;
    
    const avgSets = exercises.length > 0 
      ? exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0) / exercises.length 
      : 0;

    // Exercise type distribution
    const exerciseTypes = exercises.reduce((acc, exercise) => {
      const type = exercise.exercise || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top exercises by frequency
    const topExercises = Object.entries(exerciseTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        totalVolume: exercises
          .filter(ex => ex.exercise === name)
          .reduce((sum, ex) => sum + ((ex.weight || 0) * (ex.reps || 0)), 0)
      }));

    // Weight distribution
    const weightDistribution = exercises.reduce((acc, ex) => {
      const weight = ex.weight || 0;
      const range = weight === 0 ? 'Bodyweight' : weight < 50 ? '0-50' : weight < 100 ? '50-100' : weight < 150 ? '100-150' : '150+';
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Time distribution
    const timeDistribution = exercises.reduce((acc, ex) => {
      const time = ex.time || 0;
      const range = time < 30 ? '0-30s' : time < 60 ? '30-60s' : time < 120 ? '60-120s' : '120s+';
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Mood analysis
    const moodAnalysis = exercises.reduce((acc, ex) => {
      const mood = ex.mood || 'Not recorded';
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent exercises (last 10)
    const recentExercises = exercises.slice(0, 10);

    // Weekly data
    const weeklyData = calculateWeeklyData();

    // Monthly data
    const monthlyData = calculateMonthlyData();

    return {
      totalExercises,
      totalVolume,
      totalSets,
      totalReps,
      totalTime,
      avgWeight: Math.round(avgWeight),
      avgReps: Math.round(avgReps),
      avgSets: Math.round(avgSets),
      exerciseTypes,
      topExercises,
      weightDistribution,
      timeDistribution,
      moodAnalysis,
      weeklyData,
      monthlyData,
      recentExercises
    };
  };

  const calculateWeeklyData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    }).reverse();

    return last7Days.map(date => {
      const dayExercises = exercises.filter(ex => 
        new Date(ex.created_at).toDateString() === date
      );
      
      const totalVolume = dayExercises.reduce((sum, ex) => 
        sum + ((ex.weight || 0) * (ex.reps || 0)), 0
      );
      
      const totalSets = dayExercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
      const totalReps = dayExercises.reduce((sum, ex) => sum + (ex.reps || 0), 0);
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        volume: totalVolume,
        sets: totalSets,
        reps: totalReps,
        exercises: dayExercises.length
      };
    });
  };

  const calculateMonthlyData = () => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7); // YYYY-MM format
    }).reverse();

    return last6Months.map(month => {
      const monthExercises = exercises.filter(ex => 
        ex.created_at.startsWith(month)
      );
      
      const totalVolume = monthExercises.reduce((sum, ex) => 
        sum + ((ex.weight || 0) * (ex.reps || 0)), 0
      );
      
      return {
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        volume: totalVolume,
        exercises: monthExercises.length
      };
    });
  };

  const calculateTodayStats = () => {
    const today = new Date().toDateString();
    const todayExercises = exercises.filter(ex => 
      new Date(ex.created_at).toDateString() === today
    );
    
    const totalSets = todayExercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
    const totalReps = todayExercises.reduce((sum, ex) => sum + (ex.reps || 0), 0);
    const totalVolume = todayExercises.reduce((sum, ex) => sum + ((ex.weight || 0) * (ex.reps || 0)), 0);
    
    return { totalSets, totalReps, totalVolume, exerciseCount: todayExercises.length };
  };

  const analytics = calculateAnalytics();
  const todayStats = calculateTodayStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-bold mb-2">Error Loading Analytics</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={fetchExercisesData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Exercise Analytics Dashboard</h2>

      {/* Data Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-800 font-bold mb-2">📊 Data Status</h3>
        <p className="text-blue-700">
          Found {analytics.totalExercises} exercises in the database
          {analytics.totalExercises === 0 && (
            <span className="block mt-2 text-sm">
              No data found. Try inserting sample data from the Database Test page.
            </span>
          )}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-500 text-lg">💪</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{analytics.totalExercises}</div>
          <div className="text-sm text-gray-600">exercises</div>
          <div className="text-xs text-gray-500 mt-1">Total recorded</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-500 text-lg">⚡</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{analytics.totalVolume}</div>
          <div className="text-sm text-gray-600">lbs</div>
          <div className="text-xs text-gray-500 mt-1">Total volume</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-500 text-lg">🎯</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{analytics.totalSets}</div>
          <div className="text-sm text-gray-600">sets</div>
          <div className="text-xs text-gray-500 mt-1">Total sets</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-500 text-lg">⏱️</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{Math.round(analytics.totalTime / 60)}</div>
          <div className="text-sm text-gray-600">minutes</div>
          <div className="text-xs text-gray-500 mt-1">Total time</div>
        </div>
      </div>

      {/* Today's Progress */}
      <div>
        <h3 className="font-bold text-gray-800 mb-4">Today's Progress</h3>
        <div className="bg-blue-500 rounded-lg p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">Today's Workout</h2>
            <div className="text-right">
              <div className="text-2xl font-bold">{todayStats.exerciseCount}</div>
              <div className="text-sm opacity-90">Exercises</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{todayStats.totalSets}</div>
              <div className="text-sm opacity-90">Sets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{todayStats.totalReps}</div>
              <div className="text-sm opacity-90">Reps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{todayStats.totalVolume}</div>
              <div className="text-sm opacity-90">Volume</div>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Types */}
      {Object.keys(analytics.exerciseTypes).length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Exercise Types</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(analytics.exerciseTypes)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([exercise, count]) => (
                <div key={exercise} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">{exercise}</span>
                    <span className="text-2xl font-bold text-blue-600">{count}</span>
                  </div>
                  <div className="text-sm text-gray-600">times performed</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Top Exercises */}
      {analytics.topExercises.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Top Exercises</h3>
          <div className="space-y-3">
            {analytics.topExercises.map((exercise, index) => (
              <div key={exercise.name} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}</span>
                    <span className="font-semibold text-gray-800">{exercise.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{exercise.count} times</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total Volume: {exercise.totalVolume} lbs</span>
                  <span>Avg Volume: {Math.round(exercise.totalVolume / exercise.count)} lbs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(exercise.count / analytics.topExercises[0].count) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weight Distribution */}
      {Object.keys(analytics.weightDistribution).length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Weight Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.weightDistribution)
              .sort(([a], [b]) => {
                const getWeight = (range: string) => {
                  if (range === 'Bodyweight') return 0;
                  const num = parseInt(range.split('-')[0]) || 0;
                  return num;
                };
                return getWeight(a) - getWeight(b);
              })
              .map(([range, count]) => (
                <div key={range} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">{range} lbs</span>
                    <span className="font-semibold text-gray-800">{count} exercises</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(count / Math.max(...Object.values(analytics.weightDistribution))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Mood Analysis */}
      {Object.keys(analytics.moodAnalysis).length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Mood Tracking</h3>
          <div className="space-y-3">
            {Object.entries(analytics.moodAnalysis)
              .sort(([,a], [,b]) => b - a)
              .map(([mood, count]) => (
                <div key={mood} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">{mood}</span>
                    <span className="font-semibold text-gray-800">{count} times</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(count / Math.max(...Object.values(analytics.moodAnalysis))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Exercises */}
      {analytics.recentExercises.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Exercises</h3>
          <div className="space-y-3">
            {analytics.recentExercises.map((exercise, index) => (
              <div key={`${exercise.created_at}-${index}`} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {exercise.exercise}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {exercise.sets} sets • {exercise.reps} reps • {exercise.weight} lbs • {exercise.time}s
                    </p>
                    <p className="text-xs text-gray-500">
                      Volume: {exercise.weight * exercise.reps} lbs
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">
                      {new Date(exercise.created_at).toLocaleDateString()}
                    </span>
                    {exercise.mood && (
                      <div className="text-xs text-gray-400 mt-1">
                        Mood: {exercise.mood}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.avgWeight}</div>
              <div className="text-sm text-gray-600">lbs</div>
              <div className="text-xs text-gray-500 mt-1">Average Weight</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.avgReps}</div>
              <div className="text-sm text-gray-600">reps</div>
              <div className="text-xs text-gray-500 mt-1">Average Reps</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analytics.avgSets}</div>
              <div className="text-sm text-gray-600">sets</div>
              <div className="text-xs text-gray-500 mt-1">Average Sets</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.round(analytics.totalVolume / analytics.totalExercises)}</div>
              <div className="text-sm text-gray-600">lbs</div>
              <div className="text-xs text-gray-500 mt-1">Avg Volume/Exercise</div>
            </div>
          </div>
        </div>
      </div>

      {/* No Data Message */}
      {analytics.totalExercises === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-gray-400 text-2xl">📊</span>
          </div>
          <p className="text-gray-800 font-medium">No exercise data found</p>
          <p className="text-gray-500 text-sm mt-1">
            Navigate to the Database Test page to insert sample data and see analytics here
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsScreen; 