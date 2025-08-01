import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface Exercise {
  id?: string;
  user_id: number;
  user: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  time: number;
  mood: string;
  created_at?: string;
}

const ExerciseTracker: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [newExercise, setNewExercise] = useState<Partial<Exercise>>({
    user_id: 1,
    user: 'user1',
    exercise: '',
    sets: 0,
    reps: 0,
    weight: 0,
    time: 0,
    mood: 'motivated'
  });
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    averageWeight: 0,
    favoriteExercise: '',
    currentStreak: 0
  });

  useEffect(() => {
    fetchExercises();
  }, []);

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
      calculateStats(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (exerciseData: Exercise[]) => {
    const totalWorkouts = exerciseData.length;
    const totalVolume = exerciseData.reduce((sum, ex) => sum + (ex.weight * ex.reps), 0);
    const exercisesWithWeight = exerciseData.filter(ex => ex.weight > 0);
    const averageWeight = exercisesWithWeight.length > 0 
      ? exercisesWithWeight.reduce((sum, ex) => sum + ex.weight, 0) / exercisesWithWeight.length 
      : 0;

    // Find favorite exercise
    const exerciseCounts = exerciseData.reduce((acc, ex) => {
      acc[ex.exercise] = (acc[ex.exercise] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteExercise = Object.entries(exerciseCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    // Calculate streak
    const today = new Date();
    const exerciseDates = exerciseData
      .map(ex => new Date(ex.created_at || ''))
      .map(date => date.toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    let currentDate = new Date(today);
    
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

    setStats({
      totalWorkouts,
      totalVolume,
      averageWeight: Math.round(averageWeight),
      favoriteExercise,
      currentStreak: streak
    });
  };

  const addExercise = async () => {
    try {
      if (!newExercise.exercise) {
        alert('Please enter an exercise name');
        return;
      }

      const { data, error } = await supabase
        .from('exercises')
        .insert([newExercise])
        .select();

      if (error) {
        console.error('Error adding exercise:', error);
        alert('Error adding exercise');
        return;
      }

      // Reset form
      setNewExercise({
        user_id: 1,
        user: 'user1',
        exercise: '',
        sets: 0,
        reps: 0,
        weight: 0,
        time: 0,
        mood: 'motivated'
      });

      // Refresh data
      fetchExercises();
      alert('Exercise added successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding exercise');
    }
  };

  const deleteExercise = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;

    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting exercise:', error);
        alert('Error deleting exercise');
        return;
      }

      fetchExercises();
      alert('Exercise deleted successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Error deleting exercise');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exercises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Exercise Tracker</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.totalWorkouts}</div>
            <div className="text-sm text-gray-600">Total Workouts</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-green-600">{stats.currentStreak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-purple-600">{stats.totalVolume}</div>
            <div className="text-sm text-gray-600">Total Volume</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-orange-600">{stats.averageWeight}</div>
            <div className="text-sm text-gray-600">Avg Weight</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-lg font-bold text-indigo-600 capitalize">{stats.favoriteExercise}</div>
            <div className="text-sm text-gray-600">Favorite Exercise</div>
          </div>
        </div>

        {/* Add Exercise Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Exercise</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exercise</label>
              <input
                type="text"
                value={newExercise.exercise}
                onChange={(e) => setNewExercise({...newExercise, exercise: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Bench Press"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sets</label>
              <input
                type="number"
                value={newExercise.sets}
                onChange={(e) => setNewExercise({...newExercise, sets: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reps</label>
              <input
                type="number"
                value={newExercise.reps}
                onChange={(e) => setNewExercise({...newExercise, reps: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
              <input
                type="number"
                value={newExercise.weight}
                onChange={(e) => setNewExercise({...newExercise, weight: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time (min)</label>
              <input
                type="number"
                value={newExercise.time}
                onChange={(e) => setNewExercise({...newExercise, time: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
              <select
                value={newExercise.mood}
                onChange={(e) => setNewExercise({...newExercise, mood: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="motivated">Motivated</option>
                <option value="tired">Tired</option>
                <option value="focused">Focused</option>
                <option value="energized">Energized</option>
                <option value="strong">Strong</option>
              </select>
            </div>
          </div>
          <button
            onClick={addExercise}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Add Exercise
          </button>
        </div>

        {/* Exercises List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Exercises</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Exercise</th>
                  <th className="px-4 py-2 text-left">Sets</th>
                  <th className="px-4 py-2 text-left">Reps</th>
                  <th className="px-4 py-2 text-left">Weight</th>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Mood</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map((exercise, index) => (
                  <tr key={exercise.id || index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium capitalize">{exercise.exercise}</td>
                    <td className="px-4 py-2">{exercise.sets}</td>
                    <td className="px-4 py-2">{exercise.reps}</td>
                    <td className="px-4 py-2">{exercise.weight} lbs</td>
                    <td className="px-4 py-2">{exercise.time} min</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        exercise.mood === 'motivated' ? 'bg-green-100 text-green-800' :
                        exercise.mood === 'tired' ? 'bg-red-100 text-red-800' :
                        exercise.mood === 'focused' ? 'bg-blue-100 text-blue-800' :
                        exercise.mood === 'energized' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {exercise.mood}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {new Date(exercise.created_at || '').toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => deleteExercise(exercise.id || '')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {exercises.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No exercises found. Add your first workout!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseTracker; 