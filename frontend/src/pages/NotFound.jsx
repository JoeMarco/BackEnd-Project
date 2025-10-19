import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <Result
      status="404"
      title="404"
      subTitle="Halaman yang Anda cari tidak ditemukan."
      extra={
        <Button type="primary" onClick={() => navigate('/dashboard')}>
          Kembali ke Dashboard
        </Button>
      }
    />
  );
};

export default NotFound;