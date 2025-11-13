import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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

