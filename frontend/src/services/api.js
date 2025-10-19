import axios from 'axios';
import { message } from 'antd';
import { storageService } from './storage';

console.log('=== INITIALIZING API SERVICE ===');
console.log('Base URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

console.log('✓ Axios instance created');

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
    console.log(`=== API REQUEST: ${config.method?.toUpperCase()} ${config.url} ===`);
    console.log('Request config:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      params: config.params,
      data: config.data
    });
    
    const token = storageService.getToken();
    if (token) {
      console.log('✓ Auth token attached');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('⚠ No auth token found');
    }
    return config;
  },
  (error) => {
    console.error('=== REQUEST INTERCEPTOR ERROR ===');
    console.error('Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and common errors
api.interceptors.response.use(
  (response) => {
    console.log(`=== API RESPONSE SUCCESS: ${response.config.method?.toUpperCase()} ${response.config.url} ===`);
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    return response.data;
  },
  async (error) => {
    console.error('=== API RESPONSE ERROR ===');
    const originalRequest = error.config;
    
    if (error.response) {
      const { status, data } = error.response;
      console.error('Error Status:', status);
      console.error('Error Data:', data);
      if (data.errors && data.errors.length > 0) {
        console.error('Validation Errors:', data.errors);
      }
      console.error('Request URL:', originalRequest?.url);
      console.error('Request Method:', originalRequest?.method);
      
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
          console.warn('⚠ No refresh token available, redirecting to login');
          storageService.clear();
          window.location.href = '/login';
          message.error('Session expired. Please login again.');
          return Promise.reject(error);
        }

        try {
          console.log('=== ATTEMPTING TOKEN REFRESH ===');
          // Attempt to refresh the token
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
            { refreshToken }
          );

          if (response.data.success) {
            console.log('✓ Token refresh successful');
            const { token, refreshToken: newRefreshToken } = response.data.data;
            
            // Update stored tokens
            storageService.setToken(token);
            storageService.setRefreshToken(newRefreshToken);
            
            // Update default header
            api.defaults.headers.common.Authorization = `Bearer ${token}`;
            originalRequest.headers.Authorization = `Bearer ${token}`;
            
            // Process queued requests
            processQueue(null, token);
            console.log(`✓ Retrying original request: ${originalRequest.url}`);
            
            // Retry the original request
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('=== TOKEN REFRESH FAILED ===');
          console.error('Refresh Error:', refreshError);
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
        console.warn('⚠ 403 Forbidden - Permission denied');
        message.error('You do not have permission to perform this action.');
      } else if (status >= 500) {
        console.error('❌ Server error:', status);
        message.error('Server error. Please try again later.');
      } else if (status === 401 && originalRequest._retry) {
        console.warn('⚠ Token refresh failed, logging out');
        // Token refresh already failed, logout
        storageService.clear();
        window.location.href = '/login';
        message.error('Session expired. Please login again.');
      } else {
        console.error('❌ API Error:', data.message || 'Unknown error');
        message.error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      console.error('=== NETWORK ERROR ===');
      console.error('Request made but no response received');
      console.error('Request:', error.request);
      message.error('Network error. Please check your connection.');
    } else {
      console.error('=== REQUEST SETUP ERROR ===');
      console.error('Error:', error.message);
      message.error('An error occurred. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

export default api;