import React from 'react';
import { Typography, Space, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title } = Typography;

/**
 * Reusable Page Header Component
 * @param {string} title - Page title
 * @param {ReactNode} extra - Extra content (usually buttons)
 * @param {Array} breadcrumbItems - Breadcrumb items [{title, path}]
 * @param {ReactNode} children - Additional content below title
 */
const PageHeader = ({ 
  title, 
  extra, 
  breadcrumbItems = [], 
  children 
}) => {
  // Build breadcrumb items
  const breadcrumb = [
    {
      title: (
        <Link to="/dashboard">
          <HomeOutlined /> Dashboard
        </Link>
      ),
    },
    ...breadcrumbItems.map(item => ({
      title: item.path ? <Link to={item.path}>{item.title}</Link> : item.title,
    })),
  ];

  return (
    <div className="page-header fade-in">
      {breadcrumbItems.length > 0 && (
        <Breadcrumb items={breadcrumb} style={{ marginBottom: 16 }} />
      )}
      
      <div className="page-header-title">
        <Title level={2}>{title}</Title>
        {extra && <Space>{extra}</Space>}
      </div>
      
      {children && <div style={{ marginTop: 16 }}>{children}</div>}
    </div>
  );
};

export default PageHeader;
