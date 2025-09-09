import { getApiUrl, API_ENDPOINTS } from '../config/api.js';

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Get current user data
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Validate token with backend
export const validateToken = async () => {
  try {
    const token = getAuthToken();
    if (!token) return false;

    const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.PROFILE), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
        // Update user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      }
    }
    
    // Token is invalid, clear localStorage
    logout();
    return false;
  } catch (error) {
    console.error('Token validation error:', error);
    logout();
    return false;
  }
};

// Auth hook for components
export const useAuth = () => {
  return {
    isAuthenticated: isAuthenticated(),
    user: getCurrentUser(),
    token: getAuthToken(),
    logout,
    validateToken
  };
};
