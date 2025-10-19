import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('=== PRIVATE ROUTE CHECK ===');
  console.log('isAuthenticated:', isAuthenticated);
  console.log('loading:', loading);
  
  if (loading) {
    console.log('⏳ Auth loading, showing loading screen...');
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login...');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ Authenticated, rendering protected route');
  return children;
};

export default PrivateRoute;