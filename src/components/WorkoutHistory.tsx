import React, { useEffect, useState } from 'react';
import { DataService } from '../utils/dataService';
import { WorkoutSummary, WorkoutSession } from '../types';

const WorkoutHistory: React.FC = () => {
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<WorkoutSummary | null>(null);

  useEffect(() => {
    fetchWorkoutHistory();
  }, []);

  const fetchWorkoutHistory = async () => {
    try {
      setLoading(true);
      const history = await DataService.getRecentWorkouts(20);
      setWorkoutHistory(history);
    } catch (error) {
      console.error('Error fetching workout history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMoodEmoji = (mood: string) => {
    const moodMap: Record<string, string> = {
      'energetic': '⚡',
      'tired': '😴',
      'motivated': '💪',
      'stressed': '😰',
      'relaxed': '😌',
      'focused': '🎯',
      'happy': '😊',
      'sad': '😢'
    };
    return moodMap[mood.toLowerCase()] || '😐';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading workout history...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Workout History</h2>

      {workoutHistory.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-gray-400 text-2xl">📅</span>
          </div>
          <p className="text-gray-800 font-medium">No workout history yet</p>
          <p className="text-gray-500 text-sm mt-1">Start logging your workouts to see your history</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workoutHistory.map((workout) => (
            <div key={workout.session.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Session Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {workout.session.muscle_group}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(workout.session.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {workout.totalVolume}
                    </div>
                    <div className="text-xs text-gray-500">lbs volume</div>
                  </div>
                </div>

                {/* Session Stats */}
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800">
                      {workout.totalExercises}
                    </div>
                    <div className="text-xs text-gray-500">Exercises</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800">
                      {workout.totalSets}
                    </div>
                    <div className="text-xs text-gray-500">Sets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800">
                      {workout.totalReps}
                    </div>
                    <div className="text-xs text-gray-500">Reps</div>
                  </div>
                </div>

                {/* Mood and Notes */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {getMoodEmoji(workout.session.mood_pre)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {workout.session.mood_pre || 'No mood recorded'}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedSession(selectedSession?.session.id === workout.session.id ? null : workout)}
                    className="text-blue-600 text-sm hover:text-blue-800"
                  >
                    {selectedSession?.session.id === workout.session.id ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>

                {workout.session.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 italic">
                      "{workout.session.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Exercise Details */}
              {selectedSession?.session.id === workout.session.id && (
                <div className="p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-800 mb-3">Exercise Details</h4>
                  <div className="space-y-3">
                    {workout.exercises.map((exercise) => (
                      <div key={exercise.id} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex justify-between items-center">
                          <h5 className="font-medium text-gray-800">{exercise.name}</h5>
                          <span className="text-xs text-gray-500">
                            {new Date(workout.session.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Exercise ID: {exercise.id}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {workoutHistory.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">History Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {workoutHistory.length}
              </div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {workoutHistory.reduce((sum, w) => sum + w.totalVolume, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Volume (lbs)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {workoutHistory.reduce((sum, w) => sum + w.totalSets, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Sets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {workoutHistory.reduce((sum, w) => sum + w.totalReps, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Reps</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutHistory; 