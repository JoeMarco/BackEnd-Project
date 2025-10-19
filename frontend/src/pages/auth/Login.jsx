import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space, Divider, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { validationRules } from '../../utils/validators';
import { formatRateLimitMessage } from '../../utils/formatDuration';
import './Login.css';

const { Title, Text, Paragraph } = Typography;

const Login = () => {
  console.log('=== LOGIN PAGE RENDERING ===');
  
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  
  const handleSubmit = async (values) => {
    console.log('=== LOGIN FORM SUBMITTED ===');
    console.log('Form values:', values);
    
    setLoading(true);
    setError('');
    
    try {
      const result = await login(values);
      console.log('Login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful, navigating to dashboard...');
        // Small delay to ensure state update completes
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      } else {
        console.log('❌ Login failed:', result.message);
        
        // Check if this is a rate limit error
        if (result.retryAfter) {
          const rateLimitMessage = formatRateLimitMessage(result.retryAfter);
          console.log('⏱️ Rate limit active:', rateLimitMessage);
          setError(rateLimitMessage);
        } else {
          setError(result.message || 'Login gagal. Periksa username dan password Anda.');
        }
        
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Check if error response contains rate limit info
      if (err.response?.status === 429 && err.response?.data?.retryAfter) {
        const rateLimitMessage = formatRateLimitMessage(err.response.data.retryAfter);
        console.log('⏱️ Rate limit active (from error):', rateLimitMessage);
        setError(rateLimitMessage);
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
      
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay" />
      </div>
      
      <div className="login-content">
        <Card 
          className="login-card fade-in"
          variant="borderless"
        >
          {/* Logo & Title Section */}
          <div className="login-header">
            <div className="login-logo">
              <SafetyOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            </div>
            <Title level={2} style={{ margin: '16px 0 8px 0', color: '#262626' }}>
              Factory Inventory System
            </Title>
            <Text type="secondary" style={{ fontSize: '15px' }}>
              Sistem Manajemen Inventaris Pabrik
            </Text>
          </div>
          
          <Divider style={{ margin: '24px 0' }} />
          
          {/* Error Alert */}
          {error && (
            <Alert 
              message="Login Gagal" 
              description={error}
              type="error" 
              showIcon 
              closable
              onClose={() => setError('')}
              style={{ marginBottom: 24 }} 
              className="login-alert"
            />
          )}
          
          {/* Login Form */}
          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            initialValues={{ remember: true }}
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[
                { required: true, message: 'Silakan masukkan username!' },
                { min: 3, message: 'Username minimal 3 karakter' }
              ]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
                placeholder="Masukkan username Anda" 
                autoComplete="username"
              />
            </Form.Item>
            
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Silakan masukkan password!' },
                { min: 6, message: 'Password minimal 6 karakter' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
                placeholder="Masukkan password Anda" 
                autoComplete="current-password"
              />
            </Form.Item>
            
            <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 16 }}>
              <Checkbox>Ingat saya</Checkbox>
            </Form.Item>
            
            <Form.Item style={{ marginBottom: 0 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<LoginOutlined />}
                block
                size="large"
                className="login-button"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </Form.Item>
          </Form>
          
          <Divider style={{ margin: '24px 0' }} />
          
          {/* Default Credentials Info */}
          <div className="login-footer">
            <Alert
              message="Akun Default"
              description={
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Text strong>Admin:</Text>
                  <Text copyable={{ text: 'admin' }}>Username: admin</Text>
                  <Text copyable={{ text: 'admin123' }}>Password: admin123</Text>
                  <Divider style={{ margin: '8px 0' }} />
                  <Text strong>Manager:</Text>
                  <Text copyable={{ text: 'manager' }}>Username: manager</Text>
                  <Text copyable={{ text: 'manager123' }}>Password: manager123</Text>
                </Space>
              }
              type="info"
              showIcon
              style={{ textAlign: 'left' }}
            />
            
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                © 2025 Factory Inventory System. All rights reserved.
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;