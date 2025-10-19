import React, { useState } from 'react';
import { Layout, FloatButton } from 'antd';
import { Outlet } from 'react-router-dom';
import { UpOutlined } from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import Header from './Header';
import Sidebar from './Sidebar';

const { Content, Footer } = Layout;

const AppLayout = () => {
  const { themeConfig } = useTheme();
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={false} />
      <Layout style={{ marginLeft: 200 }}>
        <Header />
        <Content className="site-layout-content" style={{ background: themeConfig?.token?.colorBgLayout || '#f0f2f5' }}>
          <div className="content-wrapper">
            <Outlet />
          </div>
        </Content>
        <Footer style={{ 
          textAlign: 'center', 
          background: themeConfig?.token?.colorBgLayout || '#f0f2f5',
          padding: '16px 50px',
          color: themeConfig?.token?.colorTextSecondary || '#8c8c8c'
        }}>
          Factory Inventory System ©{new Date().getFullYear()} - Desktop Optimized
        </Footer>
        <FloatButton.BackTop icon={<UpOutlined />} />
      </Layout>
    </Layout>
  );
};

export default AppLayout;