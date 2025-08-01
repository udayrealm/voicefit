import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface Exercise {
  id: string;
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

const SimpleDataView: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setDebugInfo('Starting to fetch data...');
      
      // Log the URL being used
      const url = import.meta.env.VITE_SUPABASE_URL || 'Using fallback URL';
      setDebugInfo(`Using URL: ${url}`);
      
      // First, test if we can connect at all
      const { data: testData, error: testError } = await supabase
        .from('exercises')
        .select('count')
        .limit(1);

      if (testError) {
        setError(`Connection failed: ${testError.message}`);
        setDebugInfo(`Connection error: ${testError.message}`);
        console.error('Connection test failed:', testError);
        return;
      }

      setDebugInfo('Connection successful, fetching data...');
      
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('user_id', { ascending: false });

      if (error) {
        setError(error.message);
        setDebugInfo(`Data fetch error: ${error.message}`);
        console.error('Data fetch error:', error);
        return;
      }

      setExercises(data || []);
      setDebugInfo(`Successfully fetched ${data?.length || 0} records`);
      console.log('Fetched data:', data);
    } catch (err) {
      setError('Failed to fetch data');
      setDebugInfo(`Exception: ${err}`);
      console.error('Exception:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        <p className="text-gray-600">{debugInfo}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error: {error}</h1>
        <p className="text-gray-600 mb-4">{debugInfo}</p>
        <button 
          onClick={fetchData}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Exercises Table Data ({exercises.length} records)</h1>
      <p className="text-gray-600 mb-4">{debugInfo}</p>
      
      {/* Exercise Type Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-blue-800 font-semibold mb-2">Exercise Type Column</h3>
        <p className="text-blue-700 text-sm">
          The <strong>"Exercise Type"</strong> column shows the category of each exercise (Strength, Cardio, Bodyweight, etc.) 
          with color-coded badges for easy identification.
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">User ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">User</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Exercise</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Exercise Type</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Sets</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Reps</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Weight</th>
              <th className="border border-gray-300 px-4 py-2 text-left">User Weight</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Time</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Mood</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
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
                <tr key={exercise.id || index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 text-sm">{exercise.id?.substring(0, 8)}...</td>
                  <td className="border border-gray-300 px-4 py-2">{exercise.user_id}</td>
                  <td className="border border-gray-300 px-4 py-2">{exercise.user}</td>
                  <td className="border border-gray-300 px-4 py-2 font-medium capitalize">{exercise.exercise}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isCardio ? 'bg-red-100 text-red-800' :
                      isBodyweight ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {exercise.exercise_type || '-'}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{isCardio ? '-' : (exercise.sets || 0)}</td>
                  <td className="border border-gray-300 px-4 py-2">{isCardio ? '-' : (exercise.reps || 0)}</td>
                  <td className="border border-gray-300 px-4 py-2">{isCardio ? '-' : (exercise.weight ? `${exercise.weight} lbs` : '-')}</td>
                  <td className="border border-gray-300 px-4 py-2">{exercise.userweight || '-'} lbs</td>
                  <td className="border border-gray-300 px-4 py-2">{exercise.time ? `${exercise.time} min` : '-'}</td>
                  <td className="border border-gray-300 px-4 py-2">
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
                  <td className="border border-gray-300 px-4 py-2 text-sm">{new Date(exercise.created_at).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {exercises.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No data found in exercises table
        </div>
      )}
    </div>
  );
};

export default SimpleDataView; 