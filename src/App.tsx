import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import HomeScreen from './components/HomeScreen';
import RecordScreen from './components/RecordScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import ProfileScreen from './components/ProfileScreen';
import DataDisplay from './components/DataDisplay';
import ExerciseTracker from './components/ExerciseTracker';
import WorkoutAnalytics from './components/WorkoutAnalytics';
import SimpleDataView from './components/SimpleDataView';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pb-20">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/tracker" element={<ExerciseTracker />} />
            <Route path="/analytics" element={<WorkoutAnalytics />} />
            <Route path="/data" element={<SimpleDataView />} />
            <Route path="/record" element={<RecordScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/database" element={<DataDisplay />} />
          </Routes>
        </div>
        <Navigation />
      </div>
    </Router>
  );
}

export default App;