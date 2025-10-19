/**
 * Frontend Debug Utilities
 * This file provides comprehensive debugging capabilities for the frontend
 */

console.log('='.repeat(80));
console.log('FRONTEND DEBUG UTILITIES LOADED');
console.log('='.repeat(80));

// Global error handler
window.addEventListener('error', (event) => {
  console.error('=== UNCAUGHT ERROR ===');
  console.error('Message:', event.message);
  console.error('Source:', event.filename);
  console.error('Line:', event.lineno);
  console.error('Column:', event.colno);
  console.error('Error object:', event.error);
  console.error('Stack:', event.error?.stack);
  console.error('Timestamp:', new Date().toISOString());
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('=== UNHANDLED PROMISE REJECTION ===');
  console.error('Reason:', event.reason);
  console.error('Promise:', event.promise);
  console.error('Stack:', event.reason?.stack);
  console.error('Timestamp:', new Date().toISOString());
});

// Log system information
console.log('=== SYSTEM INFORMATION ===');
console.log('User Agent:', navigator.userAgent);
console.log('Platform:', navigator.platform);
console.log('Language:', navigator.language);
console.log('Online:', navigator.onLine);
console.log('Screen:', `${window.screen.width}x${window.screen.height}`);
console.log('Viewport:', `${window.innerWidth}x${window.innerHeight}`);
console.log('LocalStorage available:', typeof(Storage) !== 'undefined');
console.log('Cookies enabled:', navigator.cookieEnabled);

// Log environment
console.log('=== ENVIRONMENT ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('PUBLIC_URL:', process.env.PUBLIC_URL);

// Network status monitoring
window.addEventListener('online', () => {
  console.log('✓ Network: Online');
});

window.addEventListener('offline', () => {
  console.warn('⚠ Network: Offline');
});

// Performance monitoring
if (window.performance) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;
      
      console.log('=== PERFORMANCE METRICS ===');
      console.log('Page Load Time:', pageLoadTime + 'ms');
      console.log('Connection Time:', connectTime + 'ms');
      console.log('Render Time:', renderTime + 'ms');
      console.log('DOM Interactive:', (perfData.domInteractive - perfData.navigationStart) + 'ms');
      console.log('DOM Content Loaded:', (perfData.domContentLoadedEventEnd - perfData.navigationStart) + 'ms');
    }, 0);
  });
}

// Memory monitoring (Chrome only)
if (window.performance && window.performance.memory) {
  setInterval(() => {
    const memory = window.performance.memory;
    console.log('=== MEMORY USAGE ===');
    console.log('Used:', Math.round(memory.usedJSHeapSize / 1048576) + 'MB');
    console.log('Total:', Math.round(memory.totalJSHeapSize / 1048576) + 'MB');
    console.log('Limit:', Math.round(memory.jsHeapSizeLimit / 1048576) + 'MB');
  }, 60000); // Log every minute
}

// Debug helper functions
window.debugApp = {
  // Get current auth state
  getAuthState: () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');
    
    console.log('=== AUTH STATE ===');
    console.log('Token:', token ? 'Present (length: ' + token.length + ')' : 'Not found');
    console.log('Refresh Token:', refreshToken ? 'Present' : 'Not found');
    console.log('User:', user ? JSON.parse(user) : 'Not found');
    
    return { token, refreshToken, user: user ? JSON.parse(user) : null };
  },
  
  // Clear all storage
  clearStorage: () => {
    console.log('=== CLEARING STORAGE ===');
    localStorage.clear();
    sessionStorage.clear();
    console.log('✓ Storage cleared');
  },
  
  // Test API connection
  testAPI: async () => {
    console.log('=== TESTING API CONNECTION ===');
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    try {
      const response = await fetch(`${apiUrl.replace('/api', '')}/health`);
      const data = await response.json();
      console.log('✓ API Connection: Success');
      console.log('Health check response:', data);
      return data;
    } catch (error) {
      console.error('❌ API Connection: Failed');
      console.error('Error:', error);
      return null;
    }
  },
  
  // Log current route info
  getRouteInfo: () => {
    console.log('=== ROUTE INFORMATION ===');
    console.log('Path:', window.location.pathname);
    console.log('Hash:', window.location.hash);
    console.log('Search:', window.location.search);
    console.log('Origin:', window.location.origin);
  },
  
  // Enable verbose logging
  enableVerbose: () => {
    console.log('✓ Verbose logging enabled');
    localStorage.setItem('debug:verbose', 'true');
  },
  
  // Disable verbose logging
  disableVerbose: () => {
    console.log('✓ Verbose logging disabled');
    localStorage.removeItem('debug:verbose');
  },
  
  // Check if verbose logging is enabled
  isVerbose: () => {
    return localStorage.getItem('debug:verbose') === 'true';
  }
};

// Log available debug commands
console.log('=== DEBUG COMMANDS AVAILABLE ===');
console.log('window.debugApp.getAuthState() - Get current authentication state');
console.log('window.debugApp.clearStorage() - Clear all local storage');
console.log('window.debugApp.testAPI() - Test API connection');
console.log('window.debugApp.getRouteInfo() - Get current route information');
console.log('window.debugApp.enableVerbose() - Enable verbose logging');
console.log('window.debugApp.disableVerbose() - Disable verbose logging');
console.log('='.repeat(80));

export default window.debugApp;
