// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      VERIFY_EMAIL: '/api/auth/verify-email',
      PROFILE: '/api/auth/profile',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh'
    },
    USER: {
      PROFILE: '/api/auth/user',
      POSTS: '/api/auth/user',
      SEARCH: '/api/auth/search',
      FOLLOW: '/api/auth/follow',
      FOLLOW_STATUS: '/api/auth/follow-status'
    },
    POSTS: {
      FEED: '/api/auth/feed',
      ALL: '/api/auth/all-posts'
    }
  }
};

// Helper function to build full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Export endpoints for easy access
export const API_ENDPOINTS = API_CONFIG.ENDPOINTS;

export default API_CONFIG;
