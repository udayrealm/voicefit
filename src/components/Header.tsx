import React from 'react';

const Header: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

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
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-600 text-sm">👤</span>
        </div>
      </div>
    </div>
  );
};

export default Header; 