// src/services/apiClient.js
// Shared Axios instance used by all service modules.
//
// Responsibilities:
//   1. Set baseURL from environment variable.
//   2. Inject Authorization header on every request when a token is present.
//   3. Normalize error responses into a consistent shape before they
//      propagate to hooks and components.
//   4. Handle 401 Unauthorized globally: clear the stored token and
//      redirect to login. This catches expired JWTs transparently.

import axios from "axios";

// ─── Create Instance ──────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
  timeout: 15000, // 15 seconds
});

// ─── Request Interceptor ──────────────────────────────────────────────────
// Attach the JWT Bearer token to every outgoing request if one is stored.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("lumina_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────
// Normalize error responses and handle token expiry globally.
//
// IMPORTANT — silent flag:
//   Pass { params: { _silent: true } } (or set config._silent = true) on
//   any request that should NEVER trigger a hard redirect on failure.
//   AuthContext uses this for the initial rehydration getMe() call so that
//   a dead/missing backend never redirects an unauthenticated visitor.
apiClient.interceptors.response.use(
  // Success: pass through unchanged
  (response) => response,

  // Error: normalize and handle globally
  (error) => {
    const { response, config } = error;
    const isSilent = config?._silent === true;

    if (response) {
      const status = response.status;
      const message = response.data?.message || "An unexpected error occurred.";

      // 401 Unauthorized: token is missing, expired, or invalid.
      // Only hard-redirect when this is NOT a silent background check.
      if (status === 401 && !isSilent) {
        localStorage.removeItem("lumina_token");
        if (!window.location.pathname.startsWith("/account")) {
          window.location.href = "/account/login";
        }
      } else if (status === 401 && isSilent) {
        // Silent 401: just clear the stored token, let the caller handle it
        localStorage.removeItem("lumina_token");
      }

      const normalizedError = new Error(message);
      normalizedError.status = status;
      normalizedError.data = response.data;
      return Promise.reject(normalizedError);
    }

    // Network error (no response at all — backend is down or wrong URL).
    // Never redirect; just surface a clean message so the UI can degrade
    // gracefully instead of bouncing the user to /account/login.
    if (error.request) {
      const networkError = new Error(
        "Cannot reach the server. Please check your connection or try again later.",
      );
      networkError.status = 0;
      return Promise.reject(networkError);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
