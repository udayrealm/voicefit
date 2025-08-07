import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LogoutConfirmDialog from './LogoutConfirmDialog';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setShowUserMenu(false);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg font-bold">🏋️</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">VoiceFit</h1>
          <p className="text-sm text-gray-500">{currentDate}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="relative">
          <button className="text-gray-600 hover:text-gray-800">
            <span className="text-xl">🔔</span>
          </button>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </div>
        
        {/* User Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="hidden sm:block text-sm font-medium">
              {user?.username || 'User'}
            </span>
            <span className="text-gray-400">▼</span>
          </button>
          
          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
              <button
                onClick={handleLogoutClick}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Backdrop to close menu when clicking outside */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
      
      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        username={user?.username || 'User'}
      />
    </div>
  );
};

export default Header; 