import React from 'react';
import { Result, Button } from 'antd';
import { BugOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

/**
 * Error Fallback Component
 * Displayed when an error boundary catches an error
 */
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div style={{ padding: '40px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Result
        status="error"
        icon={<BugOutlined style={{ fontSize: 72, color: '#ff4d4f' }} />}
        title="Oops! Something went wrong"
        subTitle={
          isDevelopment
            ? `Error: ${error?.message || 'Unknown error'}`
            : 'We apologize for the inconvenience. Please try again.'
        }
        extra={[
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={resetErrorBoundary}
            key="reset"
          >
            Try Again
          </Button>,
          <Button
            icon={<HomeOutlined />}
            onClick={() => (window.location.href = '/')}
            key="home"
          >
            Go Home
          </Button>,
        ]}
      />
      
      {isDevelopment && error?.stack && (
        <div
          style={{
            margin: '20px auto',
            maxWidth: '900px',
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ color: '#ff4d4f', marginBottom: '12px' }}>Error Stack:</h3>
          <pre
            style={{
              overflow: 'auto',
              padding: '12px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              fontSize: '12px',
              lineHeight: '1.5',
            }}
          >
            {error.stack}
          </pre>
        </div>
      )}
    </div>
  );
};

ErrorFallback.propTypes = {
  error: PropTypes.object,
  resetErrorBoundary: PropTypes.func.isRequired,
};

export default ErrorFallback;
