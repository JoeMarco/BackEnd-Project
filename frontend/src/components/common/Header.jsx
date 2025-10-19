import React, { useState } from 'react';
import { Layout, Typography, Dropdown, Avatar, Space, Button, Badge, Drawer, Form, Input, message, Radio } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined,
  BellOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { getRoleText } from '../../utils/helpers';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header = () => {
  const { user, logout } = useAuth();
  const { currentTheme, changeTheme, themeConfig } = useTheme();
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  
  const handleMenuClick = ({ key }) => {
    switch (key) {
      case 'profile':
        setProfileDrawerOpen(true);
        break;
      case 'settings':
        setSettingsDrawerOpen(true);
        break;
      default:
        break;
    }
  };
  
  const handleProfileSubmit = async (values) => {
    try {
      // TODO: Implementasi API update profile
      console.log('Update profile:', values);
      message.success('Profile berhasil diupdate');
      setProfileDrawerOpen(false);
    } catch (error) {
      message.error('Gagal mengupdate profile');
    }
  };
  
  const handleSettingsSubmit = async (values) => {
    try {
      // TODO: Implementasi API update settings
      console.log('Update settings:', values);
      message.success('Pengaturan berhasil disimpan');
      setSettingsDrawerOpen(false);
    } catch (error) {
      message.error('Gagal menyimpan pengaturan');
    }
  };
  
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => handleMenuClick({ key: 'profile' })
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Pengaturan',
      onClick: () => handleMenuClick({ key: 'settings' })
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Keluar',
      onClick: logout,
      danger: true
    }
  ];
  
  return (
    <AntHeader 
      className="site-header"
      style={{ 
        padding: '0 24px', 
        background: themeConfig?.customColors?.headerBg || '#ffffff', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: themeConfig?.customColors?.shadow || '0 2px 8px rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 999,
        height: '64px'
      }}
    >
      <Space size="middle">
        <Title level={4} style={{ margin: 0, color: themeConfig?.token?.colorPrimary || '#1890ff', fontWeight: 600 }}>
          Factory Inventory System
        </Title>
      </Space>
      
      <Space size="large">
        <Badge count={5} size="small">
          <Button 
            type="text" 
            icon={<BellOutlined />} 
            size="large"
            style={{ fontSize: '18px' }}
          />
        </Badge>
        
        <Dropdown 
          menu={{ items: userMenuItems }} 
          placement="bottomRight"
          arrow
          trigger={['click']}
        >
          <Space style={{ cursor: 'pointer' }} size={12}>
            <Avatar 
              size={40}
              icon={<UserOutlined />} 
              style={{ 
                backgroundColor: '#1890ff',
                boxShadow: '0 2px 4px rgba(24,144,255,0.2)'
              }}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 500, fontSize: '14px', lineHeight: '20px' }}>{user?.full_name}</div>
              <div style={{ fontSize: '12px', color: '#8c8c8c', lineHeight: '16px' }}>@{user?.username}</div>
            </div>
          </Space>
        </Dropdown>
      </Space>

      {/* Profile Drawer */}
      <Drawer
        title="Profile Saya"
        placement="right"
        onClose={() => setProfileDrawerOpen(false)}
        open={profileDrawerOpen}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleProfileSubmit}
          initialValues={{
            username: user?.username,
            full_name: user?.full_name,
            email: user?.email || '',
            role: getRoleText(user?.role)
          }}
        >
          <Form.Item label="Username" name="username">
            <Input disabled />
          </Form.Item>
          
          <Form.Item label="Role" name="role">
            <Input disabled />
          </Form.Item>
          
          <Form.Item 
            label="Nama Lengkap" 
            name="full_name"
            rules={[{ required: true, message: 'Nama lengkap wajib diisi' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item 
            label="Email" 
            name="email"
            rules={[
              { type: 'email', message: 'Format email tidak valid' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item label="Password Baru" name="new_password">
            <Input.Password placeholder="Kosongkan jika tidak ingin mengubah" />
          </Form.Item>
          
          <Form.Item 
            label="Konfirmasi Password" 
            name="confirm_password"
            dependencies={['new_password']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Password tidak sama'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Ulangi password baru" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Simpan Perubahan
              </Button>
              <Button onClick={() => setProfileDrawerOpen(false)}>
                Batal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Settings Drawer */}
      <Drawer
        title="Pengaturan Aplikasi"
        placement="right"
        onClose={() => setSettingsDrawerOpen(false)}
        open={settingsDrawerOpen}
        width={400}
      >
        <Form
          layout="vertical"
          onFinish={handleSettingsSubmit}
        >
          <Form.Item label="Tema Aplikasi">
            <Radio.Group 
              value={currentTheme} 
              onChange={(e) => changeTheme(e.target.value)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="light">
                  <Space>
                    <div style={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: 4, 
                      background: 'linear-gradient(135deg, #ffffff 50%, #1890ff 50%)',
                      border: '1px solid #d9d9d9'
                    }} />
                    <span><strong>Light</strong> - Tema terang klasik</span>
                  </Space>
                </Radio>
                <Radio value="darkNavy">
                  <Space>
                    <div style={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: 4, 
                      background: 'linear-gradient(135deg, #1e1e1e 50%, #1890ff 50%)',
                      border: '1px solid #3e3e42'
                    }} />
                    <span><strong>Dark Navy</strong> - Tema gelap seperti VS Code</span>
                  </Space>
                </Radio>
                <Radio value="beige">
                  <Space>
                    <div style={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: 4, 
                      background: 'linear-gradient(135deg, #faf8f3 50%, #8b7355 50%)',
                      border: '1px solid #d7ccc8'
                    }} />
                    <span><strong>Beige</strong> - Tema hangat dan nyaman</span>
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item label="Notifikasi">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ fontSize: '12px', opacity: 0.6 }}>
                Pengaturan notifikasi akan tersedia dalam versi mendatang
              </div>
            </Space>
          </Form.Item>
          
          <Form.Item label="Info Aplikasi">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div><strong>Nama:</strong> Factory Inventory System</div>
              <div><strong>Versi:</strong> 1.0.0</div>
              <div><strong>Tema Aktif:</strong> {currentTheme === 'light' ? 'Light' : currentTheme === 'darkNavy' ? 'Dark Navy' : 'Beige'}</div>
            </Space>
          </Form.Item>
          
          <Form.Item>
            <Button onClick={() => setSettingsDrawerOpen(false)}>
              Tutup
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </AntHeader>
  );
};

export default Header;