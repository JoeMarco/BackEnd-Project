/**
 * Custom proxy configuration for Create React App
 * This allows more granular control over API proxying
 * 
 * Install required package:
 * npm install http-proxy-middleware --save-dev
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to backend server
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL || 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        // Log proxied requests
        console.log(`[Proxy] ${req.method} ${req.url} -> ${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${req.url}`);
      },
      onError: (err, req, res) => {
        console.error('[Proxy Error]', err);
        res.status(500).json({
          error: 'Proxy error',
          message: err.message
        });
      }
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'Frontend OK', timestamp: new Date().toISOString() });
  });
};
