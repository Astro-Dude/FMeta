// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BACKEND_URL || 
            (import.meta.env.PROD ? 'https://fmeta.onrender.com' : 'http://localhost:8000'),
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
    },
    CONTENT: {
      CREATE: '/api/content/create',
      BY_TYPE: '/api/content/type',
      STORIES_FEED: '/api/content/stories/feed',
      REELS_FEED: '/api/content/reels/feed',
      VIEW_STORY: '/api/content/story',
      LIKE: '/api/content',
      COMMENT: '/api/content',
      DELETE: '/api/content',
      USER_CONTENT: '/api/content/user'
    }
  }
};

// Helper function to build full API URL
export const getApiUrl = (endpoint) => {
  const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
  console.log('API URL:', fullUrl); // Debug log
  return fullUrl;
};

// API helper object with common HTTP methods
const api = {
  get: async (endpoint, config = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...config.headers
    };

    const response = await fetch(getApiUrl(endpoint), {
      method: 'GET',
      headers,
      ...config
    });

    const data = await response.json();
    return { data, status: response.status, ok: response.ok };
  },

  post: async (endpoint, body, config = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...config.headers
    };

    const response = await fetch(getApiUrl(endpoint), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      ...config
    });

    const data = await response.json();
    return { data, status: response.status, ok: response.ok };
  },

  put: async (endpoint, body, config = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...config.headers
    };

    const response = await fetch(getApiUrl(endpoint), {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      ...config
    });

    const data = await response.json();
    return { data, status: response.status, ok: response.ok };
  },

  delete: async (endpoint, config = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...config.headers
    };

    const response = await fetch(getApiUrl(endpoint), {
      method: 'DELETE',
      headers,
      ...config
    });

    const data = await response.json();
    return { data, status: response.status, ok: response.ok };
  }
};

// Export endpoints for easy access
export const API_ENDPOINTS = API_CONFIG.ENDPOINTS;

export { api };
export default api;
