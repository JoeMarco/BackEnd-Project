import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined 
} from '@ant-design/icons';

/**
 * Enhanced Statistics Card Component
 * @param {string} title - Card title
 * @param {number} value - Main value to display
 * @param {string} prefix - Prefix icon component
 * @param {string} suffix - Suffix text (e.g., unit)
 * @param {string} color - Card color theme
 * @param {number} trend - Percentage change (positive or negative)
 * @param {string} description - Additional description
 */
const StatCard = ({ 
  title, 
  value, 
  prefix, 
  suffix,
  color = '#1890ff',
  trend,
  description,
  loading = false
}) => {
  const getTrendColor = (trend) => {
    if (trend > 0) return '#52c41a';
    if (trend < 0) return '#ff4d4f';
    return '#8c8c8c';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <ArrowUpOutlined />;
    if (trend < 0) return <ArrowDownOutlined />;
    return null;
  };

  return (
    <Card 
      bordered={false} 
      loading={loading}
      className="stat-card fade-in"
      style={{
        borderLeft: `4px solid ${color}`,
      }}
    >
      <Statistic
        title={<span style={{ fontSize: '14px', fontWeight: 500 }}>{title}</span>}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{ 
          color: color,
          fontSize: '28px',
          fontWeight: 'bold'
        }}
      />
      
      {(trend !== undefined || description) && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
          {trend !== undefined && (
            <span style={{ 
              color: getTrendColor(trend),
              fontSize: '13px',
              fontWeight: 500
            }}>
              {getTrendIcon(trend)} {Math.abs(trend)}%
            </span>
          )}
          {description && (
            <span style={{ 
              color: '#8c8c8c',
              fontSize: '13px',
              marginLeft: trend !== undefined ? 8 : 0
            }}>
              {description}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};

export default StatCard;
