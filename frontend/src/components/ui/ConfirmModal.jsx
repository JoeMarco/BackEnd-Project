import React from 'react';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const ConfirmModal = ({ 
  visible, 
  onConfirm, 
  onCancel, 
  title = 'Konfirmasi', 
  content = 'Apakah Anda yakin ingin melanjutkan?',
  confirmText = 'Ya',
  cancelText = 'Batal',
  type = 'warning',
  loading = false
}) => {
  return (
    <Modal
      visible={visible}
      title={title}
      onOk={onConfirm}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {cancelText}
        </Button>,
        <Button 
          key="confirm" 
          type={type === 'danger' ? 'primary' : 'default'} 
          danger={type === 'danger'}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      ]}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ExclamationCircleOutlined style={{ color: type === 'danger' ? '#ff4d4f' : '#faad14', marginRight: 8, fontSize: 20 }} />
        <span>{content}</span>
      </div>
    </Modal>
  );
};

export default ConfirmModal;