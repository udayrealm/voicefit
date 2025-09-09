import React, { useEffect, useState } from 'react';
import { DataService } from '../utils/dataService';
import { QuickStats, WorkoutSummary } from '../types';

const HomeScreen: React.FC = () => {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats and recent workouts in parallel
      const [statsData, recentWorkoutsData] = await Promise.all([
        DataService.getQuickStats(),
        DataService.getRecentWorkouts(3)
      ]);

      setStats(statsData);
      setRecentWorkouts(recentWorkoutsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Session Notes Card */}
      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <h3 className="font-bold text-gray-800 mb-2">Session Notes</h3>
        <p className="text-gray-700">Felt strong today!</p>
      </div>

      {/* n8n Integration Status */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-gray-800 mb-2">System Status</h3>
            <p className="text-gray-700 text-sm">
              Connected
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-600 font-medium">Live from Supabase</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <h3 className="font-bold text-gray-800 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-500 text-lg">📅</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.streak}</div>
            <div className="text-sm text-gray-600">days</div>
            <div className="text-xs text-gray-500 mt-1">Streak</div>
            <div className="text-xs text-gray-400 mt-1">Current streak</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-500 text-lg">🎯</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalWorkouts}</div>
            <div className="text-sm text-gray-600">exercises</div>
            <div className="text-xs text-gray-500 mt-1">Total Exercises</div>
            <div className="text-xs text-gray-400 mt-1">All time</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-500 text-lg">⚡</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalVolume}</div>
            <div className="text-sm text-gray-600">lbs</div>
            <div className="text-xs text-gray-500 mt-1">Total Volume</div>
            <div className="text-xs text-gray-400 mt-1">Weight lifted</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-500 text-lg">⏱️</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{Math.round(stats.totalTime / 60)}</div>
            <div className="text-sm text-gray-600">minutes</div>
            <div className="text-xs text-gray-500 mt-1">Total Time</div>
            <div className="text-xs text-gray-400 mt-1">Workout time</div>
          </div>
        </div>
      </div>

      {/* Recent Workouts */}
      <div>
        <h3 className="font-bold text-gray-800 mb-4 text-center">Recent Workout Sessions</h3>
        {recentWorkouts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-gray-400 text-2xl">🎯</span>
            </div>
            <p className="text-gray-800 font-medium">No workout sessions yet</p>
            <p className="text-gray-500 text-sm mt-1">Start logging your workouts to see them here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentWorkouts.map((workout) => (
              <div key={workout.session.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">{workout.session.muscle_group}</h4>
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

      {/* Additional Stats */}
      <div>
        <h3 className="font-bold text-gray-800 mb-4">Performance Overview</h3>
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
    </div>
  );
};

export default HomeScreen; 