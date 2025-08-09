import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LogoutConfirmDialog from './LogoutConfirmDialog';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠', path: '/home' },
    { id: 'record', label: 'Record', icon: '🎤', path: '/record' },
    { id: 'tracker', label: 'Tracker', icon: '💪', path: '/tracker' },
    { id: 'test-analytics', label: 'Performance Trends', icon: '🧠', path: '/test-analytics' },
    { id: 'feedback', label: 'Feedback', icon: '🔥', path: '/feedback' },
    { id: 'chat', label: 'Chat', icon: '💬', path: '/chat' },
  ] as const;

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const activeTab = tabs.find(tab => tab.path === currentPath);
    return activeTab?.id || 'home';
  };

  const handleTabClick = (path: string) => {
    console.log('🧭 Navigation: Clicking tab to navigate to:', path);
    navigate(path);
  };

  const handleLogoutClick = () => {
    console.log('🚪 Navigation: Logout button clicked');
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center">
                 {tabs.map((tab) => (
           <button
             key={tab.id}
             onClick={() => handleTabClick(tab.path)}
             className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
               getActiveTab() === tab.id
                 ? 'bg-blue-500 text-white'
                 : tab.id === 'feedback'
                 ? 'text-red-600 hover:text-red-700 font-bold'
                 : 'text-gray-600 hover:text-gray-800'
             }`}
           >
             <span className={`text-xl ${tab.id === 'feedback' ? 'font-bold' : ''}`}>{tab.icon}</span>
             <span className={`text-xs font-medium ${tab.id === 'feedback' ? 'font-bold' : ''}`}>{tab.label}</span>
           </button>
         ))}
        
        {/* Logout Button */}
        <button
          onClick={handleLogoutClick}
          className="flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors text-red-600 hover:text-red-700"
        >
          <span className="text-xl">🚪</span>
          <span className="text-xs font-medium">Logout</span>
        </button>
      </div>
      
      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        username="User"
      />
    </div>
  );
};

export default Navigation; 