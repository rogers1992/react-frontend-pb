import axios from 'axios';

/**
 * Base URL for all API requests
 * Read from environment variable, fallback to localhost
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Create a customized axios instance
 * 
 * This is like creating a "template" for all API calls:
 * - All requests use this base URL
 * - All requests send JSON
 * - All requests go through our interceptors
 */
const api = axios.create({
  baseURL: API_URL,
  headers: { 
    'Content-Type': 'application/json' 
  },
  timeout: 10000, // Cancel request after 10 seconds
});

/**
 * REQUEST INTERCEPTOR
 * 
 * Runs BEFORE every request is sent to the backend.
 * We use it to automatically attach the JWT token.
 * 
 * Flow:
 * 1. User calls api.get('/products')
 * 2. This interceptor runs
 * 3. Grabs token from localStorage
 * 4. Adds Authorization header
 * 5. Request is sent with token
 */
api.interceptors.request.use(
  (config) => {
    // Retrieve JWT token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Send browser timezone so backend can compute "today" per-user
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      config.headers["X-Timezone"] = tz;
    }
    
    // Return modified config (axios uses this to send the request)
    return config;
  },
  (error) => {
    // If something goes wrong during setup, reject the promise
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * 
 * Runs AFTER every response comes back from the backend.
 * We use it to handle common errors globally.
 * 
 * Flow:
 * 1. Backend responds (success or error)
 * 2. This interceptor runs
 * 3. If 401 (Unauthorized), clear token and redirect to login
 * 4. Otherwise, pass response/error to calling code
 */
api.interceptors.response.use(
  (response) => {
    // Success (2xx status) - just return the response
    return response;
  },
  (error) => {
    // Check if error is 401 (Unauthorized)
    // This means token is expired or invalid
    if (error.response?.status === 401) {
      // Don't redirect on login failures — the form handles those
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login page
        // Using window.location forces a full page reload
        // This clears all React state and starts fresh
        window.location.href = '/signin';
      }
    }

    // Reject the promise so calling code can handle the error
    return Promise.reject(error);
  }
);

export default api;

/**
 * Resolve a (possibly relative) product image URL returned by the backend
 * to a full URL the <img src> can use.
 *
 * - null / empty -> null (caller shows a placeholder)
 * - already absolute (http/https) -> returned unchanged
 * - relative (e.g. "/uploads/products/1_123.jpg") -> prepended with the
 *   backend origin derived from VITE_API_URL (stripped of the "/api" suffix)
 *   or the default "http://localhost:8000".
 */
export function resolveImageUrl(relativePath?: string | null): string | null {
  if (!relativePath) return null;
  if (/^https?:\/\//i.test(relativePath)) return relativePath;

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  // Strip trailing "/api" to get the backend origin.
  const origin = apiBase.replace(/\/api\/?$/i, '');
  return `${origin}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
}
