// src/hooks/useAuth.js
// Convenience hook to consume AuthContext.
// Throws a descriptive error if used outside of AuthProvider.

import { useContext } from 'react';
import { AuthContext } from '@context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>.');
  }
  return context;
}
