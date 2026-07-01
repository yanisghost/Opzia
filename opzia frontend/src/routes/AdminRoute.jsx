// src/routes/AdminRoute.jsx
// Guards routes that require role: 'admin' or 'manager'.
// Builds on ProtectedRoute logic — first checks auth, then checks role.
// A regular logged-in user hitting /admin is redirected to home (not login).

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import Spinner from '@components/ui/Spinner/Spinner';

const ADMIN_ROLES = ['admin', 'manager'];

function AdminRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

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

  // Not logged in at all → go to login
  if (!isAuthenticated) {
    return <Navigate to="/account/login" state={{ from: location }} replace />;
  }

  // Logged in but lacks the required role → go to home
  if (!ADMIN_ROLES.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
