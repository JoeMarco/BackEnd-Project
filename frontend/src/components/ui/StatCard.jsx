import React from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const StatCard = ({ title, value, prefix, suffix, precision, valueStyle, trend }) => {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        precision={precision}
        valueStyle={valueStyle}
        prefix={prefix}
        suffix={suffix}
      />
      {trend !== undefined && (
        <div style={{ marginTop: 8 }}>
          {trend > 0 ? (
            <span style={{ color: '#3f8600' }}>
              <ArrowUpOutlined /> {Math.abs(trend)}%
            </span>
          ) : (
            <span style={{ color: '#cf1322' }}>
              <ArrowDownOutlined /> {Math.abs(trend)}%
            </span>
          )}
          <span style={{ marginLeft: 8 }}>dari bulan lalu</span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;