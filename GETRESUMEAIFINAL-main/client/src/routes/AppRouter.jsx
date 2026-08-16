import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/Landing/LandingPage';
import BuilderPage from '../pages/Builder/BuilderPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import TemplatesPage from '../pages/Templates/TemplatesPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import JobsPage from '../pages/Jobs/JobsPage';
import TestSetupPage from '../pages/Tests/TestSetupPage';
import TestSessionPage from '../pages/Tests/TestSessionPage';
import TestResultsPage from '../pages/Tests/TestResultsPage';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

const AppRouter = () => {
  const { user } = useAuth();

  if (user?.isAdmin) {
    return (
      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/builder" element={<BuilderPage />} />
      <Route path="/templates" element={<TemplatesPage />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/jobs" 
        element={
          <ProtectedRoute>
            <JobsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/test" 
        element={
          <ProtectedRoute>
            <TestSetupPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/test/session/:resumeId" 
        element={
          <ProtectedRoute>
            <TestSessionPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/test/results" 
        element={
          <ProtectedRoute>
            <TestResultsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      
      {/* Fallback route */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};

export default AppRouter;

