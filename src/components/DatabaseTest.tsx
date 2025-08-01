import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { DataService } from '../utils/dataService';

const DatabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [tableStatus, setTableStatus] = useState<string>('Checking...');
  const [exercises, setExercises] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState<any>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Test basic connection
      console.log('Testing Supabase connection...');
      const { data, error: connectionError } = await supabase
        .from('exercises')
        .select('count')
        .limit(1);

      if (connectionError) {
        console.error('Connection error:', connectionError);
        setConnectionStatus('❌ Connection Failed');
        setError(`Connection error: ${connectionError.message}`);
        setIsLoading(false);
        return;
      }

      setConnectionStatus('✅ Connected to Supabase');
      console.log('Connection successful');

      // Test table existence and get actual data
      const { data: tableData, error: tableError } = await supabase
        .from('exercises')
        .select('*')
        .limit(5);

      if (tableError) {
        setTableStatus('❌ Table error: ' + tableError.message);
        setError(`Table error: ${tableError.message}`);
      } else {
        setTableStatus(`✅ Table exists with ${tableData?.length || 0} records`);
        setTableData(tableData);
        console.log('Table data:', tableData);
      }

      // Fetch sample data
      const exercisesData = await DataService.getExercises(10);
      setExercises(exercisesData);

      // Get stats
      const statsData = await DataService.getQuickStats();
      setStats(statsData);

    } catch (err) {
      console.error('Test failed:', err);
      setConnectionStatus('❌ Connection Failed');
      setError(`Unexpected error: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const insertSampleData = async () => {
    try {
      setError('');
      console.log('Inserting sample data...');
      await DataService.insertSampleExercises();
      console.log('Sample data inserted successfully');
      
      // Refresh data
      const exercisesData = await DataService.getExercises(10);
      setExercises(exercisesData);
      
      const statsData = await DataService.getQuickStats();
      setStats(statsData);
      
      alert('Sample data inserted successfully!');
    } catch (err) {
      console.error('Failed to insert sample data:', err);
      setError(`Failed to insert sample data: ${err}`);
    }
  };

  const getConnectionInfo = () => {
    const url = import.meta.env.VITE_SUPABASE_URL || 'Using fallback URL';
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY 
      ? `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...` 
      : 'Using fallback key';
    
    return { url, key };
  };

  const connectionInfo = getConnectionInfo();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Database Connection Test</h1>
        
        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Connection:</span>
              <span className={connectionStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {connectionStatus}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Table Status:</span>
              <span className={tableStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {tableStatus}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Environment URL:</span>
              <span className="text-sm text-gray-600">{connectionInfo.url}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Environment Key:</span>
              <span className="text-sm text-gray-600">{connectionInfo.key}</span>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          <div className="mt-4 space-x-2">
            <button
              onClick={testConnection}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </button>
            
            <button
              onClick={insertSampleData}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Insert Sample Data
            </button>
          </div>
        </div>

        {/* Raw Table Data */}
        {tableData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Raw Table Data (First 5 records)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Exercise</th>
                    <th className="px-4 py-2 text-left">Sets</th>
                    <th className="px-4 py-2 text-left">Reps</th>
                    <th className="px-4 py-2 text-left">Weight</th>
                    <th className="px-4 py-2 text-left">Mood</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row: any, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2 text-sm">{row.id?.substring(0, 8)}...</td>
                      <td className="px-4 py-2">{row.exercise}</td>
                      <td className="px-4 py-2">{row.sets}</td>
                      <td className="px-4 py-2">{row.reps}</td>
                      <td className="px-4 py-2">{row.weight}</td>
                      <td className="px-4 py-2">{row.mood}</td>
                      <td className="px-4 py-2 text-sm">{new Date(row.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tableData.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No data found in table
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalWorkouts}</div>
                <div className="text-sm text-gray-600">Total Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.streak}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalSets}</div>
                <div className="text-sm text-gray-600">Total Sets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.totalReps}</div>
                <div className="text-sm text-gray-600">Total Reps</div>
              </div>
            </div>
          </div>
        )}

        {/* Exercises Data */}
        {exercises.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Exercises ({exercises.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Exercise</th>
                    <th className="px-4 py-2 text-left">Sets</th>
                    <th className="px-4 py-2 text-left">Reps</th>
                    <th className="px-4 py-2 text-left">Weight</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {exercises.map((exercise, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">{exercise.exercise}</td>
                      <td className="px-4 py-2">{exercise.sets}</td>
                      <td className="px-4 py-2">{exercise.reps}</td>
                      <td className="px-4 py-2">{exercise.weight} lbs</td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {new Date(exercise.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Setup Instructions</h2>
          <div className="space-y-3 text-blue-700">
            <p><strong>1.</strong> Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></p>
            <p><strong>2.</strong> Copy your project URL and anon key from the project settings</p>
            <p><strong>3.</strong> Create a <code className="bg-blue-100 px-1 rounded">.env</code> file in the root directory with:</p>
            <pre className="bg-blue-100 p-3 rounded text-sm overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`}
            </pre>
            <p><strong>4.</strong> Create the exercises table in your Supabase SQL editor:</p>
            <pre className="bg-blue-100 p-3 rounded text-sm overflow-x-auto">
{`CREATE TABLE exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id INTEGER,
  user TEXT,
  exercise TEXT,
  sets INTEGER,
  reps INTEGER,
  weight INTEGER,
  time INTEGER,
  mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
            </pre>
            <p><strong>5.</strong> Restart your development server and test the connection</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseTest; 