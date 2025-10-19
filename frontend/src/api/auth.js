import api from '../services/api';

export const authService = {
  // Login
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Get current user
  getMe: () => api.get('/auth/me'),
  
  // Change password
  changePassword: (passwords) => api.post('/auth/change-password', passwords)
};