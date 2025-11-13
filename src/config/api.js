import axios from 'axios';

// Automatically detect environment and use appropriate API URL
const getApiUrl = () => {
  // If REACT_APP_API_URL is explicitly set, use it
  if (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL !== 'http://localhost:5000/api') {
    return process.env.REACT_APP_API_URL;
  }
  
  // If we're on the deployed Firebase site, use production backend
  const hostname = window.location.hostname;
  if (hostname === 'homehero-8e501.web.app' || 
      hostname === 'homehero-8e501.firebaseapp.com' ||
      hostname.includes('web.app') ||
      hostname.includes('firebaseapp.com')) {
    // Use Vercel backend URL
    return 'https://herohome-server.vercel.app/api';
  }
  
  // Default to localhost for local development
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

// Log API URL for debugging (always log in production to help debug)
console.log('🔗 API URL:', API_URL);
console.log('🌐 Hostname:', window.location.hostname);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Request interceptor to add Firebase token to headers
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or from auth context
    const token = localStorage.getItem('firebaseToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log network errors for debugging
    if (!error.response) {
      console.error('🌐 Network Error:', error.message);
      console.error('📡 API URL attempted:', API_URL);
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        console.error('❌ Cannot connect to backend server. Make sure it is deployed and running.');
      }
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      const errorMessage = error.response?.data?.error || '';
      const currentPath = window.location.pathname;
      const isServiceDetailsPage = currentPath.startsWith('/services/') && currentPath !== '/services';
      const isAuthPage = currentPath === '/login' || currentPath === '/register';
      
      // NEVER redirect if we're on a service details page (booking modal is open)
      if (isServiceDetailsPage) {
        console.log('On service details page - not redirecting to login');
        return Promise.reject(error);
      }
      
      // Don't redirect if it's a booking-specific error (like "cannot book own service")
      // Only redirect for actual authentication errors
      const isAuthError = errorMessage.includes('Unauthorized') || 
                         errorMessage.includes('token') ||
                         errorMessage.includes('Forbidden: Invalid') ||
                         (!errorMessage || errorMessage === 'Forbidden');
      
      if (isAuthError && !isAuthPage) {
        // Token expired or invalid, clear it
        localStorage.removeItem('firebaseToken');
        
        // Only redirect if not on auth pages and not on service details
        setTimeout(() => {
          const stillOnSamePage = window.location.pathname === currentPath;
          if (stillOnSamePage && window.location.pathname !== '/login' && !window.location.pathname.startsWith('/services/')) {
            window.location.href = '/login';
          }
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

