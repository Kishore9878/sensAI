import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is not authenticated, send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated but hasn't completed onboarding profile
  if (!user.profileCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export const OnboardingRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user has already completed the profile, send to dashboard
  if (user.profileCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is authenticated, redirect away from auth pages to dashboard/onboarding
  if (user) {
    if (!user.profileCompleted) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
