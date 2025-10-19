import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ErrorBoundary } from 'react-error-boundary';
import idID from 'antd/locale/id_ID';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import ErrorFallback from './components/common/ErrorFallback';
import './index.css';

// Load debug utilities in development
if (process.env.NODE_ENV === 'development') {
  import('./debug');
}

console.log('=== FRONTEND APPLICATION STARTING ===');
console.log('React version:', React.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');
console.log('Timestamp:', new Date().toISOString());

const root = ReactDOM.createRoot(document.getElementById('root'));
console.log('✓ React root created');

root.render(
  <React.StrictMode>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        console.log('=== ERROR BOUNDARY RESET ===');
        window.location.href = '/';
      }}
      onError={(error, errorInfo) => {
        // Log error to monitoring service (e.g., Sentry)
        console.error('=== APPLICATION ERROR CAUGHT BY BOUNDARY ===');
        console.error('Error:', error);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        console.error('Component Stack:', errorInfo.componentStack);
        console.error('Timestamp:', new Date().toISOString());
      }}
    >
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <ConfigProvider
          locale={idID}
          theme={{
            token: {
              colorPrimary: '#1890ff',
              borderRadius: 6,
            },
          }}
        >
          <AuthProvider>
            <App />
          </AuthProvider>
        </ConfigProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);