import axios from 'axios';
import { message } from 'antd';
import { storageService } from '../services/storage';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = storageService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          message.error('Session expired. Please login again.');
          storageService.clearToken();
          window.location.href = '/login';
          break;
        case 403:
          message.error('You do not have permission to access this resource.');
          break;
        case 404:
          message.error('Resource not found.');
          break;
        case 500:
          message.error('Server error. Please try again later.');
          break;
        default:
          message.error(data?.message || 'An error occurred.');
      }
    } else if (error.request) {
      message.error('Network error. Please check your connection.');
    } else {
      message.error('An error occurred.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
