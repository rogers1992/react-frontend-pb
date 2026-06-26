import api from './api';
import type { LoginRequest, LoginResponse, User } from '../types';

/**
 * Authentication service
 * 
 * Handles all auth-related API calls:
 * - Login
 * - Logout
 * - Get current user
 * 
 * Each method:
 * 1. Makes API call
 * 2. Extracts response data
 * 3. Returns typed result
 */
export const authService = {
  /**
   * Authenticate user with username and password
   * 
   * @param data - Login credentials
   * @returns LoginResponse with token and user data
   * 
   * Example:
   * const response = await authService.login({
   *   username: 'admin',
   *   password: 'admin123'
   * });
   * // response.access_token = "eyJhbGc..."
   * // response.user = { id: 1, username: 'admin', ... }
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    // Make POST request to /auth/login
    const response = await api.post<LoginResponse>('/auth/login', data);
    
    // Return the response data (axios wraps it in response.data)
    return response.data;
  },

  /**
   * Logout current user
   * 
   * Note: Backend logout endpoint doesn't do much (JWT is stateless)
   * but we call it for consistency and potential future server-side cleanup
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  /**
   * Get current authenticated user
   * 
   * Useful for:
   * - Refreshing user data after profile update
   * - Validating token is still valid
   * - Getting fresh permissions
   * 
   * @returns Current user with role information
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};
