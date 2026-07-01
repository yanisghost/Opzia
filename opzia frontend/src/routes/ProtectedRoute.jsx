// src/routes/ProtectedRoute.jsx
// Guards routes that require an authenticated user session.
// On mount it checks AuthContext.isAuthenticated.
// If still loading (e.g., rehydrating from localStorage), renders a spinner
// to avoid a premature redirect on page refresh.

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import Spinner from '@components/ui/Spinner/Spinner';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // While the auth context is rehydrating the token, show a spinner.
  // This prevents a flash-redirect to /login on a hard refresh.
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted URL so we can redirect back after login.
    return <Navigate to="/account/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
