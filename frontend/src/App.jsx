import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, OnboardingRoute, PublicRoute } from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import DashboardPage from './pages/DashboardPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import CoverLetterPage from './pages/CoverLetterPage';
import InterviewPrepPage from './pages/InterviewPrepPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Pages (Redirect if already logged in) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          {/* Profile Completion Onboarding Page */}
          <Route element={<OnboardingRoute />}>
            <Route path="/onboarding" element={<CompleteProfilePage />} />
          </Route>

          {/* Protected Main Workspace Pages */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/resume" element={<ResumeBuilderPage />} />
            <Route path="/cover-letter" element={<CoverLetterPage />} />
            <Route path="/interview" element={<InterviewPrepPage />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
