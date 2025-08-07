import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import HomeScreen from './components/HomeScreen';
import RecordScreen from './components/RecordScreen';
import ProfileScreen from './components/ProfileScreen';
import ExerciseTracker from './components/ExerciseTracker';
import TestAnalytics from './components/TestAnalytics';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';

// Main App Content
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);

  console.log('🔄 AppContent render:', { isAuthenticated, isLoading, hasRedirected });

  // Handle authentication state changes - only redirect on initial login
  useEffect(() => {
    if (isAuthenticated && !isLoading && !hasRedirected) {
      console.log('🚀 Redirecting to /record after successful login');
      navigate('/record', { replace: true });
      setHasRedirected(true);
    }
  }, [isAuthenticated, isLoading, navigate, hasRedirected]);

  // Reset redirect flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setHasRedirected(false);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    console.log('⏳ AppContent: Still loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('🔒 AppContent: Not authenticated, showing login/signup');
    return (
      <Routes>
        <Route path="/login" element={
          <LoginScreen 
            onSwitchToSignup={() => navigate('/signup')} 
          />
        } />
        <Route path="/signup" element={
          <SignupScreen 
            onSwitchToLogin={() => navigate('/login')} 
          />
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  console.log('✅ AppContent: Authenticated, showing main app');
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pb-20">
        <Routes>
          <Route path="/" element={<Navigate to="/record" replace />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/tracker" element={<ExerciseTracker />} />
          <Route path="/test-analytics" element={<TestAnalytics />} />
          <Route path="/record" element={<RecordScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Routes>
      </div>
      <Navigation />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;