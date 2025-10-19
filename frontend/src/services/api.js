import axios from 'axios';
import { message } from 'antd';
import { storageService } from './storage';

// Determine if we're in development or production
const isDevelopment = process.env.NODE_ENV === 'development';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000;

// Only log in development
const log = {
  info: (...args) => isDevelopment && console.log(...args),
  warn: (...args) => isDevelopment && console.warn(...args),
  error: (...args) => console.error(...args), // Always log errors
};

log.info('=== INITIALIZING API SERVICE ===');
log.info('Environment:', process.env.NODE_ENV);
log.info('Base URL:', API_BASE_URL);
log.info('Timeout:', API_TIMEOUT);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false // Set to true if using cookies for auth
});

log.info('✓ Axios instance created');

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    log.info(`=== API REQUEST: ${config.method?.toUpperCase()} ${config.url} ===`);
    
    if (isDevelopment) {
      log.info('Request config:', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        params: config.params,
        data: config.data
      });
    }
    
    const token = storageService.getToken();
    if (token) {
      log.info('✓ Auth token attached');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      log.info('⚠ No auth token found');
    }
    
    return config;
  },
  (error) => {
    log.error('=== REQUEST INTERCEPTOR ERROR ===');
    log.error('Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and common errors
api.interceptors.response.use(
  (response) => {
    log.info(`=== API RESPONSE SUCCESS: ${response.config.method?.toUpperCase()} ${response.config.url} ===`);
    log.info('Status:', response.status);
    
    if (isDevelopment) {
      log.info('Data:', response.data);
    }
    
    return response.data;
  },
  async (error) => {
    log.error('=== API RESPONSE ERROR ===');
    const originalRequest = error.config;
    
    if (error.response) {
      const { status, data } = error.response;
      log.error('Error Status:', status);
      log.error('Error Data:', data);
      
      if (data.errors && data.errors.length > 0) {
        log.error('Validation Errors:', data.errors);
      }
      
      log.error('Request URL:', originalRequest?.url);
      log.error('Request Method:', originalRequest?.method);
      
      // Handle 401 errors - try to refresh token
      if (status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue request while refresh is in progress
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = storageService.getRefreshToken();
        
        if (!refreshToken) {
          // No refresh token available, redirect to login
          log.warn('⚠ No refresh token available, redirecting to login');
          storageService.clear();
          window.location.href = '/login';
          message.error('Session expired. Please login again.');
          return Promise.reject(error);
        }

        try {
          log.info('=== ATTEMPTING TOKEN REFRESH ===');
          
          // Attempt to refresh the token
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken },
            {
              timeout: API_TIMEOUT,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.data.success) {
            log.info('✓ Token refresh successful');
            const { token, refreshToken: newRefreshToken } = response.data.data;
            
            // Update stored tokens
            storageService.setToken(token);
            storageService.setRefreshToken(newRefreshToken);
            
            // Update default header
            api.defaults.headers.common.Authorization = `Bearer ${token}`;
            originalRequest.headers.Authorization = `Bearer ${token}`;
            
            // Process queued requests
            processQueue(null, token);
            log.info(`✓ Retrying original request: ${originalRequest.url}`);
            
            // Retry the original request
            return api(originalRequest);
          }
        } catch (refreshError) {
          log.error('=== TOKEN REFRESH FAILED ===');
          log.error('Refresh Error:', refreshError);
          
          // Refresh failed, logout user
          processQueue(refreshError, null);
          storageService.clear();
          window.location.href = '/login';
          message.error('Session expired. Please login again.');
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else if (status === 403) {
        log.warn('⚠ 403 Forbidden - Permission denied');
        message.error('You do not have permission to perform this action.');
      } else if (status >= 500) {
        log.error('❌ Server error:', status);
        message.error('Server error. Please try again later.');
      } else if (status === 401 && originalRequest._retry) {
        log.warn('⚠ Token refresh failed, logging out');
        // Token refresh already failed, logout
        storageService.clear();
        window.location.href = '/login';
        message.error('Session expired. Please login again.');
      } else {
        log.error('❌ API Error:', data.message || 'Unknown error');
        message.error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      log.error('=== NETWORK ERROR ===');
      log.error('Request made but no response received');
      
      if (isDevelopment) {
        log.error('Request:', error.request);
      }
      
      // Check if it's a timeout
      if (error.code === 'ECONNABORTED') {
        message.error('Request timeout. Please try again.');
      } else {
        message.error('Network error. Please check your connection.');
      }
    } else {
      log.error('=== REQUEST SETUP ERROR ===');
      log.error('Error:', error.message);
      message.error('An error occurred. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

// Health check function (optional, useful for debugging)
export const checkApiHealth = async () => {
  try {
    log.info('=== CHECKING API HEALTH ===');
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000
    });
    log.info('✓ API is healthy:', response.data);
    return true;
  } catch (error) {
    log.error('❌ API health check failed:', error.message);
    return false;
  }
};

export default api;
