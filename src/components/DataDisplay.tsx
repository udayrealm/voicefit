import React, { useEffect, useState } from 'react';
import { DataService } from '../utils/dataService';
import { QuickStats, WorkoutSummary, Exercise } from '../types';
import { supabase } from '../utils/supabase';

const DataDisplay: React.FC = () => {
  const [stats, setStats] = useState<QuickStats>({
    totalSets: 0,
    totalReps: 0,
    totalVolume: 0,
    streak: 0,
    totalWorkouts: 0,
    totalSessions: 0,
    averageWeight: 0,
    totalTime: 0
  });
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSummary[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching comprehensive data...');
      
      const [statsData, workoutsData, exercisesData] = await Promise.all([
        DataService.getQuickStats(),
        DataService.getRecentWorkouts(10),
        supabase.from('exercises').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      console.log('Stats data:', statsData);
      console.log('Workouts data:', workoutsData);
      console.log('Exercises data:', exercisesData);

      setStats(statsData);
      setRecentWorkouts(workoutsData);
      setExercises(exercisesData.data || []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading your fitness data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
          <p className="text-red-600 mt-2">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Your Fitness Data</h2>
      
      {/* Connection Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-green-800 font-medium">Connected to Supabase Database</span>
        </div>
        <p className="text-green-600 text-sm mt-1">All data is live from your database</p>
      </div>

      {/* Comprehensive Stats */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Fitness Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-500 text-lg">📈</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.streak}</div>
            <div className="text-sm text-gray-600">days</div>
            <div className="text-xs text-gray-500 mt-1">Current Streak</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-500 text-lg">🎯</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalSessions}</div>
            <div className="text-sm text-gray-600">sessions</div>
            <div className="text-xs text-gray-500 mt-1">Total Sessions</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-500 text-lg">⚡</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalVolume}</div>
            <div className="text-sm text-gray-600">lbs</div>
            <div className="text-xs text-gray-500 mt-1">Total Volume</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-500 text-lg">⏱️</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{Math.round(stats.totalTime / 60)}</div>
            <div className="text-sm text-gray-600">minutes</div>
            <div className="text-xs text-gray-500 mt-1">Total Time</div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Performance</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Sets</div>
            <div className="text-xl font-bold text-gray-800">{stats.totalSets}</div>
            <div className="text-xs text-gray-500">All time</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Reps</div>
            <div className="text-xl font-bold text-gray-800">{stats.totalReps}</div>
            <div className="text-xs text-gray-500">All time</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Avg Weight</div>
            <div className="text-xl font-bold text-gray-800">{stats.averageWeight} lbs</div>
            <div className="text-xs text-gray-500">Per exercise</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Exercises</div>
            <div className="text-xl font-bold text-gray-800">{stats.totalWorkouts}</div>
            <div className="text-xs text-gray-500">Individual sets</div>
          </div>
        </div>
      </div>

      {/* Recent Workout Sessions */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Workout Sessions</h3>
        {recentWorkouts.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">No workout sessions found in your database</p>
            <p className="text-yellow-600 text-sm mt-1">Start recording workouts to see them here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentWorkouts.map((workout) => (
              <div key={workout.session.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">{workout.session.muscle_group || 'No muscle group'}</h4>
                    <p className="text-sm text-gray-600">
                      {workout.totalExercises} exercises • {workout.totalSets} sets • {workout.totalReps} reps
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(workout.session.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Volume: {workout.totalVolume} lbs</span>
                  <span>Mood: {workout.session.mood_pre || 'N/A'}</span>
                </div>
                {workout.session.notes && (
                  <p className="text-xs text-gray-600 mt-2 italic">"{workout.session.notes}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Individual Exercise Details */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Individual Exercise Details</h3>
        
        {/* Exercise Type Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="text-blue-800 font-semibold mb-2">Exercise Type Column</h4>
          <p className="text-blue-700 text-sm">
            The <strong>"Exercise Type"</strong> column shows the category of each exercise (Strength, Cardio, Bodyweight, etc.) 
            with color-coded badges for easy identification.
          </p>
        </div>
        
        {exercises.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">No individual exercises found in your database</p>
            <p className="text-yellow-600 text-sm mt-1">Start recording exercises to see them here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exercise</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exercise Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sets</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reps</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mood</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {exercises.map((exercise, index) => {
                  const isCardio = exercise.exercise_type?.toLowerCase().includes('cardio') || 
                                  exercise.exercise?.toLowerCase().includes('running') ||
                                  exercise.exercise?.toLowerCase().includes('jogging') ||
                                  exercise.exercise?.toLowerCase().includes('cycling') ||
                                  exercise.exercise?.toLowerCase().includes('swimming');
                  
                  const isBodyweight = exercise.exercise_type?.toLowerCase().includes('bodyweight') ||
                                      exercise.exercise?.toLowerCase().includes('push-up') ||
                                      exercise.exercise?.toLowerCase().includes('pull-up') ||
                                      exercise.exercise?.toLowerCase().includes('sit-up');
                  
                  return (
                    <tr key={exercise.created_at || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">{exercise.exercise}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isCardio ? 'bg-red-100 text-red-800' :
                          isBodyweight ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {exercise.exercise_type || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {isCardio ? '-' : (exercise.sets || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {isCardio ? '-' : (exercise.reps || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {isCardio ? '-' : (exercise.weight ? `${exercise.weight} lbs` : '-')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {exercise.time ? `${exercise.time} min` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          exercise.mood === 'motivated' ? 'bg-green-100 text-green-800' :
                          exercise.mood === 'tired' ? 'bg-red-100 text-red-800' :
                          exercise.mood === 'focused' ? 'bg-blue-100 text-blue-800' :
                          exercise.mood === 'energized' ? 'bg-yellow-100 text-yellow-800' :
                          exercise.mood === 'strong' ? 'bg-purple-100 text-purple-800' :
                          exercise.mood === 'exhausted' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {exercise.mood || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(exercise.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Data Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-800 font-semibold mb-2">Database Status</h3>
        <div className="space-y-1 text-sm text-blue-700">
          <div>• Total Sessions: {stats.totalSessions}</div>
          <div>• Total Exercise Sets: {stats.totalWorkouts}</div>
          <div>• Data Last Updated: {new Date().toLocaleString()}</div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button 
          onClick={fetchData}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default DataDisplay; 