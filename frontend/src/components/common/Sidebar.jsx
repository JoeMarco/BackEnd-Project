import React, { useState, useMemo } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  InboxOutlined,
  ShoppingOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  ShopOutlined,
  BarChartOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const { Sider } = Layout;

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { themeConfig } = useTheme();
  const [openKeys, setOpenKeys] = useState(getInitialOpenKeys());
  
  function getInitialOpenKeys() {
    const path = location.pathname;
    if (path.startsWith('/inventory')) return ['/inventory'];
    if (path.startsWith('/management')) return ['/management'];
    if (path.startsWith('/transactions')) return ['/transactions'];
    return [];
  }
  
  // Base menu items
  const baseMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/inventory',
      icon: <InboxOutlined />,
      label: 'Inventaris',
      children: [
        {
          key: '/inventory/materials',
          icon: <AppstoreOutlined />,
          label: 'Bahan Baku',
        },
        {
          key: '/inventory/products',
          icon: <ShopOutlined />,
          label: 'Produk',
        },
        {
          key: '/inventory/stock-logs',
          icon: <BarChartOutlined />,
          label: 'Log Stok',
        },
      ],
    },
    {
      key: '/management',
      icon: <SettingOutlined />,
      label: 'Manajemen',
      children: [
        {
          key: '/management/bom',
          icon: <ToolOutlined />,
          label: 'Bill of Materials',
        },
        {
          key: '/management/suppliers',
          icon: <ShoppingCartOutlined />,
          label: 'Pemasok',
        },
        {
          key: '/management/customers',
          icon: <TeamOutlined />,
          label: 'Pelanggan',
        },
      ],
    },
    {
      key: '/transactions',
      icon: <FileTextOutlined />,
      label: 'Transaksi',
      children: [
        {
          key: '/transactions/purchase-orders',
          icon: <ShoppingCartOutlined />,
          label: 'Pesanan Pembelian',
        },
        {
          key: '/transactions/work-orders',
          icon: <ToolOutlined />,
          label: 'Pesanan Produksi',
        },
        {
          key: '/transactions/sales-orders',
          icon: <ShoppingOutlined />,
          label: 'Pesanan Penjualan',
        },
      ],
    },
  ];

  // Build menu items based on user role
  const menuItems = useMemo(() => {
    // Viewer role: Only show Dashboard
    if (user?.role === 'viewer') {
      return [
        {
          key: '/dashboard',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
        }
      ];
    }
    
    // Staff/Manager/Admin: Show all base menus
    const items = [...baseMenuItems];
    
    // Add User Management menu for admin users only
    if (user?.role === 'admin') {
      items.push({
        key: '/users',
        icon: <UserOutlined />,
        label: 'Kelola Pengguna',
      });
    }
    
    return items;
  }, [user?.role]);
  
  const handleMenuClick = ({ key }) => {
    console.log('✅ Menu clicked:', key);
    navigate(key);
  };
  
  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };
  
  const getSelectedKeys = () => {
    return [location.pathname];
  };
  
  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      width={200}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        boxShadow: themeConfig?.customColors?.shadow || '2px 0 8px rgba(0,0,0,0.05)',
        zIndex: 1000,
        background: themeConfig?.customColors?.siderBg || '#001529'
      }}
    >
      <div className="logo" style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        margin: 0,
        borderRadius: 0,
        fontSize: collapsed ? '14px' : '16px',
        fontWeight: 'bold',
        color: themeConfig?.customColors?.siderText || '#ffffff',
        transition: 'all 0.2s'
      }}>
        {collapsed ? '🏭' : '🏭 Factory Inventory'}
      </div>
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        items={menuItems}
        onClick={handleMenuClick}
        theme="dark"
        style={{
          borderRight: 0,
          background: themeConfig?.customColors?.siderBg || '#001529'
        }}
      />
    </Sider>
  );
};

export default Sidebar;