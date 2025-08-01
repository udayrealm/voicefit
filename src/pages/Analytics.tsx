import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Workout } from '../types';

export const Analytics: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      if (!supabase) {
        setWorkouts([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('user_id', { ascending: false });

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Workout Analytics</h1>
        
        {workouts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No workouts recorded yet. Start by recording your first workout!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {workouts.map((workout) => (
              <div key={workout.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {workout.exercise_type}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(workout.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Duration:</span> {workout.duration} minutes
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Transcription:</span> {workout.transcription}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
