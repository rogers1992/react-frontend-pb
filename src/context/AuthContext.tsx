import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/auth.service";
import type { User, LoginRequest } from "../types";

/**
 * AUTH STATE SHAPE
 *
 * Defines what data and functions AuthContext provides
 */
interface AuthState {
  user: User | null; // Current authenticated user (null if not logged in)
  token: string | null; // JWT token (null if not logged in)
  isAuthenticated: boolean; // Quick check: is user logged in?
  loading: boolean; // Is login/logout in progress?
  error: string | null; // Error message (if login failed)

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/**
 * CREATE CONTEXT
 *
 * createContext initializes the context with undefined.
 * We'll provide the real value in AuthProvider.
 */
const AuthContext = createContext<AuthState | undefined>(undefined);

/**
 * AUTH PROVIDER COMPONENT
 *
 * Wrap your app (or part of it) with this component.
 * It provides authentication state to all children.
 *
 * Usage in main.tsx:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  /**
   * STATE MANAGEMENT
   *
   * We track:
   * - user: Full user object with role and permissions
   * - token: JWT token string
   * - loading: Prevents UI flicker during async operations
   * - error: Stores login errors for display
   */
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * INITIALIZATION EFFECT
   *
   * Runs once on mount to restore session from localStorage.
   * This keeps users logged in across page refreshes.
   *
   * Flow:
   * 1. Check localStorage for saved token and user
   * 2. If both exist, restore them to state
   * 3. User is now "logged in" without re-authenticating
   */
  useEffect(() => {
    setLoading(true);
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        // Parse saved user JSON string back to object
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
      } catch (err) {
        // If parsing fails, clear corrupted data
        console.error("Failed to parse saved user:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []); // Empty dependency array = run once on mount

  /**
   * LOGIN FUNCTION
   *
   * Authenticates user and stores credentials.
   *
   * Flow:
   * 1. Set loading = true (show spinner)
   * 2. Clear any previous errors
   * 3. Call authService.login()
   * 4. Store token in state and localStorage
   * 5. Store user in state and localStorage
   * 6. Set loading = false
   *
   * If login fails:
   * - Catch error
   * - Extract error message
   * - Store in error state
   * - Throw error so calling code can handle it
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Call backend login
      const response = await authService.login(credentials);

      // Store token in state (for React) and localStorage (for persistence)
      setToken(response.access_token);
      localStorage.setItem("token", response.access_token);

      // Store user in state and localStorage
      setUser(response.user);
      localStorage.setItem("user", JSON.stringify(response.user));
    } catch (err: any) {
      // Extract error message from axios error response
      const errorMessage =
        err.response?.data?.detail || // Backend error message
        err.message || // Network error
        "Login failed"; // Fallback

      setError(errorMessage);
      throw err; // Re-throw so component can handle it
    } finally {
      // Always set loading to false (success or failure)
      setLoading(false);
    }
  };

  /**
   * LOGOUT FUNCTION
   *
   * Clears authentication state and calls backend logout.
   *
   * Flow:
   * 1. Call backend logout (optional, JWT is stateless)
   * 2. Clear token from state and localStorage
   * 3. Clear user from state and localStorage
   * 4. Redirect to login page
   */
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore logout errors (we're clearing state anyway)
      console.error("Logout error:", err);
    } finally {
      // Clear state
      setToken(null);
      setUser(null);

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login
      window.location.href = "/signin";
    }
  };

  /**
   * CLEAR ERROR FUNCTION
   *
   * Allows components to dismiss error messages.
   * Useful when user starts typing in form again.
   */
  const clearError = () => setError(null);

  /**
   * COMPUTED VALUES
   *
   * isAuthenticated is derived from token presence.
   * This is a quick way to check login status without
   * checking if user object exists.
   */
  const isAuthenticated = !!token;

  /**
   * CONTEXT VALUE
   *
   * This object is provided to all children via AuthContext.Provider.
   * Any component can access it with useAuth() hook.
   */
  const value: AuthState = {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * USE AUTH HOOK
 *
 * Custom hook to access AuthContext.
 *
 * Usage:
 * const { user, login, logout } = useAuth();
 *
 * Throws error if used outside AuthProvider.
 * This prevents silent bugs where context is undefined.
 */
export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
