import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠', path: '/home' },
    { id: 'record', label: 'Record', icon: '🎤', path: '/record' },
    { id: 'tracker', label: 'Tracker', icon: '💪', path: '/tracker' },
    { id: 'analytics', label: 'Analytics', icon: '📊', path: '/analytics' },
    { id: 'test-analytics', label: 'Test Analytics', icon: '🧠', path: '/test-analytics' },
    { id: 'data', label: 'Data', icon: '📋', path: '/data' },
    { id: 'database', label: 'DB Test', icon: '🗄️', path: '/database' },
  ] as const;

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const activeTab = tabs.find(tab => tab.path === currentPath);
    return activeTab?.id || 'home';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
              getActiveTab() === tab.id
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigation; 