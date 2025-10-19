import React from 'react';
import { Empty, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

/**
 * Enhanced Empty State Component
 * @param {string} description - Description text
 * @param {string} actionText - Button text
 * @param {function} onAction - Button click handler
 * @param {ReactNode} image - Custom image component
 */
const EmptyState = ({ 
  description = 'Tidak ada data',
  actionText,
  onAction,
  image
}) => {
  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: '8px', 
      padding: '48px 24px',
      textAlign: 'center'
    }}>
      <Empty
        image={image || Empty.PRESENTED_IMAGE_SIMPLE}
        description={<span style={{ color: '#8c8c8c' }}>{description}</span>}
      >
        {actionText && onAction && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={onAction}
            size="large"
          >
            {actionText}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;
