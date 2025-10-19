import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { message } from 'antd';
import { authService } from '../api/auth';
import { storageService } from '../services/storage';

const AuthContext = createContext();

// Initial state - Check localStorage for existing session
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true
};

const authReducer = (state, action) => {
  console.log('=== AUTH REDUCER ===');
  console.log('Action type:', action.type);
  console.log('Current state:', state);
  console.log('Action payload:', action.payload);
  
  let newState;
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      newState = {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false
      };
      console.log('New state after LOGIN_SUCCESS:', newState);
      return newState;
    case 'LOGIN_FAILURE':
      newState = {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false
      };
      console.log('New state after LOGIN_FAILURE:', newState);
      return newState;
    case 'LOGOUT':
      newState = {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false
      };
      console.log('New state after LOGOUT:', newState);
      return newState;
    case 'SET_LOADING':
      newState = {
        ...state,
        loading: action.payload
      };
      console.log('New state after SET_LOADING:', newState);
      return newState;
    case 'UPDATE_USER':
      newState = {
        ...state,
        user: { ...state.user, ...action.payload }
      };
      console.log('New state after UPDATE_USER:', newState);
      return newState;
    default:
      console.log('Unknown action type, returning current state');
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  console.log('=== AUTH PROVIDER INITIALIZING ===');
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    console.log('=== CHECKING EXISTING SESSION ===');
    const checkAuth = async () => {
      const token = storageService.getToken();
      const user = storageService.getUser();
      
      console.log('Token found:', token ? 'Yes' : 'No');
      console.log('User found:', user ? 'Yes' : 'No');
      
      if (token && user) {
        console.log('✓ Existing session found');
        console.log('User:', user.username, 'Role:', user.role);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        });
      } else {
        console.log('⚠️ No existing session');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Username:', credentials.username);
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await authService.login(credentials);
      
      console.log('Login response:', response);
      
      if (response.success) {
        console.log('✓ Login successful');
        const { user, token, refreshToken } = response.data;
        
        console.log('User data:', user);
        console.log('Token received:', token ? 'Yes' : 'No');
        
        // Store token, refresh token, and user in localStorage
        storageService.setToken(token);
        if (refreshToken) {
          storageService.setRefreshToken(refreshToken);
        }
        storageService.setUser(user);
        
        console.log('✓ Credentials stored in localStorage');
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        });
        
        console.log('✓ LOGIN_SUCCESS dispatched');
        message.success('Login berhasil!');
        return { success: true };
      } else {
        console.error('❌ Login failed:', response.message);
        dispatch({ type: 'LOGIN_FAILURE' });
        message.error(response.message || 'Login gagal');
        
        // Pass rate limit info if available
        return { 
          success: false, 
          message: response.message,
          retryAfter: response.retryAfter,
          retryAfterMinutes: response.retryAfterMinutes
        };
      }
    } catch (error) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      
      // Check for rate limit error (429)
      if (error.response?.status === 429 && error.response?.data) {
        const { message: errorMessage, retryAfter, retryAfterMinutes } = error.response.data;
        console.error('⏱️ Rate limit exceeded:', retryAfter, 'seconds');
        message.error(errorMessage || 'Terlalu banyak percobaan login');
        
        return { 
          success: false, 
          message: errorMessage,
          retryAfter,
          retryAfterMinutes
        };
      }
      
      const errorMessage = error.response?.data?.message || 'Login gagal. Silakan coba lagi.';
      message.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    console.log('=== LOGOUT ===');
    console.log('User:', state.user?.username);
    storageService.clear();
    dispatch({ type: 'LOGOUT' });
    message.success('Berhasil keluar');
    console.log('✓ Logout complete');
  };

  // Update user profile
  const updateUser = (userData) => {
    console.log('=== UPDATING USER PROFILE ===');
    console.log('New data:', userData);
    storageService.setUser({ ...state.user, ...userData });
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    });
    console.log('✓ User profile updated');
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};