import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { App as AntdApp } from 'antd';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/common/PrivateRoute';
import AppLayout from './components/common/Layout';
import Loading from './components/common/Loading';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/auth/Login'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Materials = lazy(() => import('./pages/inventory/Materials'));
const Products = lazy(() => import('./pages/inventory/Products'));
const StockLogs = lazy(() => import('./pages/inventory/StockLogs'));
const BOM = lazy(() => import('./pages/management/BOM'));
const Customers = lazy(() => import('./pages/management/Customer'));
const Suppliers = lazy(() => import('./pages/management/Suppliers'));
const PurchaseOrders = lazy(() => import('./pages/transaction/PurchaseOrders'));
const SalesOrders = lazy(() => import('./pages/transaction/SalesOrders'));
const WorkOrders = lazy(() => import('./pages/transaction/WorkOrder'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  console.log('=== APP COMPONENT RENDERING ===');
  const { isAuthenticated, loading } = useAuth();
  
  console.log('Auth State:', { isAuthenticated, loading });

  // Show loading screen while checking authentication
  if (loading) {
    console.log('Auth check in progress, showing loading screen...');
    return <Loading fullScreen />;
  }

  console.log('App ready, rendering routes...');
  return (
    <ThemeProvider>
      <AntdApp>
        <div className="App">
          <Suspense fallback={<Loading fullScreen />}>
          <Routes>
            {/* Public Route - Login */}
            <Route
              path="/login"
              element={
                !isAuthenticated ? (
                  <Login />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Inventory Management */}
              <Route path="inventory">
                <Route path="materials" element={<Materials />} />
                <Route path="products" element={<Products />} />
                <Route path="stock-logs" element={<StockLogs />} />
              </Route>

              {/* Business Management */}
              <Route path="management">
                <Route path="bom" element={<BOM />} />
                <Route path="customers" element={<Customers />} />
                <Route path="suppliers" element={<Suppliers />} />
              </Route>

              {/* Transactions */}
              <Route path="transactions">
                <Route path="purchase-orders" element={<PurchaseOrders />} />
                <Route path="sales-orders" element={<SalesOrders />} />
                <Route path="work-orders" element={<WorkOrders />} />
              </Route>

              {/* User Management (Admin Only) */}
              <Route path="users" element={<UserManagement />} />

              {/* 404 within app layout */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* 404 outside app layout */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </AntdApp>
    </ThemeProvider>
  );
}

export default App;