import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface Exercise {
  id: string;
  user_id: number;
  user: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
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
        .order('created_at', { ascending: false });

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
      
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">User ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">User</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Exercise</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Sets</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Reps</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Weight</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Time</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Mood</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((exercise, index) => (
              <tr key={exercise.id || index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-sm">{exercise.id?.substring(0, 8)}...</td>
                <td className="border border-gray-300 px-4 py-2">{exercise.user_id}</td>
                <td className="border border-gray-300 px-4 py-2">{exercise.user}</td>
                <td className="border border-gray-300 px-4 py-2">{exercise.exercise}</td>
                <td className="border border-gray-300 px-4 py-2">{exercise.sets}</td>
                <td className="border border-gray-300 px-4 py-2">{exercise.reps}</td>
                <td className="border border-gray-300 px-4 py-2">{exercise.weight}</td>
                <td className="border border-gray-300 px-4 py-2">{exercise.time}</td>
                <td className="border border-gray-300 px-4 py-2">{exercise.mood}</td>
                <td className="border border-gray-300 px-4 py-2 text-sm">{new Date(exercise.created_at).toLocaleString()}</td>
              </tr>
            ))}
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