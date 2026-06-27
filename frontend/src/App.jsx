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
import InterviewTypeSelectionPage from './pages/InterviewTypeSelectionPage';
import InterviewModeSelectionPage from './pages/InterviewModeSelectionPage';
import MockInterviewTypeSelectionPage from './pages/MockInterviewTypeSelectionPage';
import MockInterviewPrepPage from './pages/MockInterviewPrepPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import SubjectSelectionPage from './pages/SubjectSelectionPage';

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
            <Route path="/interview" element={<InterviewModeSelectionPage />} />
            <Route path="/interview/practice" element={<InterviewTypeSelectionPage />} />
            <Route path="/interview/practice/prep" element={<InterviewPrepPage />} />
            <Route path="/interview/mock" element={<MockInterviewTypeSelectionPage />} />
            <Route path="/interview/mock/prep" element={<MockInterviewPrepPage />} />
            <Route path="/interview/upload" element={<ResumeUploadPage />} />
            <Route path="/interview/subject" element={<SubjectSelectionPage />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
