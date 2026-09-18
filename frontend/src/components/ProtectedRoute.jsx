import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Wraps any route that requires authentication.
 * While the auth state is loading (token validation in progress) render nothing
 * so we don't flash the login page on a valid returning session.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Render a minimal full-screen loader while we validate the stored token
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the page the user was trying to reach so we can redirect back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
