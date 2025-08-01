import React, { useState } from 'react';
import WorkoutHistory from './WorkoutHistory';
import { DataService } from '../utils/dataService';
import { QuickStats } from '../types';

const ProfileScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
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

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const statsData = await DataService.getQuickStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'profile'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Workout History
        </button>
      </div>

      {activeTab === 'profile' ? (
        <>
          <h2 className="text-2xl font-bold text-gray-800">Profile</h2>

          {/* Profile Header */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-2xl">👤</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">VoiceFit User</h3>
                <p className="text-gray-600">Fitness Enthusiast</p>
                <p className="text-sm text-gray-500">Member since 2024</p>
              </div>
            </div>
          </div>

          {/* Fitness Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Fitness Stats</h3>
            
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

          {/* Settings Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Settings</h3>
            
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">🔔</span>
                    <span className="text-gray-800">Notifications</span>
                  </div>
                  <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">🎤</span>
                    <span className="text-gray-800">Voice Recording</span>
                  </div>
                  <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">🌙</span>
                    <span className="text-gray-800">Dark Mode</span>
                  </div>
                  <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* App Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">App Information</h3>
            
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800">Version</span>
                  <span className="text-gray-600">1.0.0</span>
                </div>
              </div>
              
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800">Build</span>
                  <span className="text-gray-600">2024.1.0</span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800">Last Updated</span>
                  <span className="text-gray-600">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Integrations</h3>
            
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-500">🔗</span>
                    <span className="text-gray-800">n8n Workflows</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 font-medium">Connected</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500">🗄️</span>
                    <span className="text-gray-800">Supabase Database</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 font-medium">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Support</h3>
            
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">❓</span>
                    <span className="text-gray-800">Help & Support</span>
                  </div>
                  <span className="text-gray-400">&gt;</span>
                </div>
              </div>
              
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">📧</span>
                    <span className="text-gray-800">Contact Us</span>
                  </div>
                  <span className="text-gray-400">&gt;</span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">📄</span>
                    <span className="text-gray-800">Privacy Policy</span>
                  </div>
                  <span className="text-gray-400">&gt;</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <WorkoutHistory />
      )}
    </div>
  );
};

export default ProfileScreen; 