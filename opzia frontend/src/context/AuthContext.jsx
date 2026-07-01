// src/context/AuthContext.jsx
// Manages authentication state for the entire application.
//
// Strategy:
//   - JWT is stored in localStorage under the key 'lumina_token'.
//   - On mount, the context attempts to rehydrate the user by calling
//     GET /api/v1/users/me using the stored token.
//   - If rehydration fails (expired/invalid token), the token is cleared
//     and the user is treated as unauthenticated.
//
// Security note:
//   localStorage is vulnerable to XSS. If the backend is updated to support
//   httpOnly cookies, remove localStorage usage and rely on credentials: 'include'.
//   TODO: Discuss httpOnly cookie support with backend team.

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { authService } from '@services/authService';

// ─── Context ─────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

// ─── Constants ───────────────────────────────────────────────────────────
const TOKEN_KEY = 'lumina_token';

// ─── Provider ────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]                 = useState(null);
  const [token, setToken]               = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading]       = useState(true); // true while rehydrating
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────
  const persistToken = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    setToken(newToken);
  }, []);

  const clearAuth = useCallback(() => {
    persistToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, [persistToken]);

  // ── Rehydrate on mount ────────────────────────────────────────────────
  // If a token is in localStorage, verify it by calling GET /users/me.
  // The request is marked _silent so no hard redirect fires on failure.
  // If there is no token, resolve immediately — no API call at all.
  useEffect(() => {
    const rehydrate = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        // No token — user is a guest. Resolve instantly; no spinner.
        setIsLoading(false);
        return;
      }
      try {
        const me = await authService.getMe();
        setUser(me);
        setIsAuthenticated(true);
      } catch {
        // 401, network error, or any failure — treat as unauthenticated.
        // clearAuth() also removes the stale token from localStorage.
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };
    rehydrate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ───────────────────────────────────────────────────────────

  /**
   * Login with email and password.
   * Backend: POST /api/v1/users/login
   * Returns the logged-in user object.
   */
  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password);
    // Handle { token, data: { user } } OR { token, user } OR { accessToken, data: { user } }
    const newToken = res.token ?? res.accessToken;
    const loggedInUser = res.data?.user ?? res.user ?? res.data;
    if (newToken) persistToken(newToken);
    if (loggedInUser) {
      setUser(loggedInUser);
      setIsAuthenticated(true);
    }
    return loggedInUser;
  }, [persistToken]);

  /**
   * Sign up a new user account.
   * Backend: POST /api/v1/users/signup
   * Returns the newly created user object.
   */
  const signup = useCallback(async (userData) => {
    const res = await authService.signup(userData);
    const newToken = res.token ?? res.accessToken;
    const newUser = res.data?.user ?? res.user ?? res.data;
    if (newToken) persistToken(newToken);
    if (newUser) {
      setUser(newUser);
      setIsAuthenticated(true);
    }
    return newUser;
  }, [persistToken]);

  /**
   * Log out the current user.
   * Clears local token and user state. No backend logout endpoint exists.
   */
  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  /**
   * Update the current user's name and email.
   * Backend: PATCH /api/v1/users/updateMe
   */
  const updateMe = useCallback(async (data) => {
    const updatedUser = await authService.updateMe(data);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  /**
   * Update the current user's password.
   * Backend: PATCH /api/v1/users/updateMyPassword
   * The backend returns a new token — we persist it.
   */
  const updateMyPassword = useCallback(async (passwordData) => {
    const res = await authService.updateMyPassword(passwordData);
    const newToken = res.token ?? res.accessToken;
    const updatedUser = res.data?.user ?? res.user ?? res.data;
    if (newToken) persistToken(newToken);
    if (updatedUser) setUser(updatedUser);
    return updatedUser;
  }, [persistToken]);

  // ── Context Value ─────────────────────────────────────────────────────
  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateMe,
    updateMyPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
