import React from 'react';
import { Form, Input, Button, Row, Col, Space, Select } from 'antd';
import { validationRules } from '../../utils/validators';

const { TextArea } = Input;
const { Option } = Select;

const SupplierForm = ({ 
  form, 
  initialValues, 
  onSubmit, 
  onCancel 
}) => {
  const handleSubmit = (values) => {
    onSubmit(values);
  };
  
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="name"
        label="Nama Pemasok"
        rules={[validationRules.required]}
      >
        <Input placeholder="Masukkan nama pemasok" />
      </Form.Item>
      
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="contact"
            label="Kontak"
          >
            <Input placeholder="Masukkan nama kontak" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="phone"
            label="Telepon"
            rules={[validationRules.required]}
          >
            <Input placeholder="Masukkan nomor telepon" />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item
        name="address"
        label="Alamat"
      >
        <TextArea 
          rows={4} 
          placeholder="Masukkan alamat lengkap" 
        />
      </Form.Item>
      
      <Form.Item
        name="status"
        label="Status"
        initialValue="active"
      >
        <Select>
          <Option value="active">Aktif</Option>
          <Option value="inactive">Tidak Aktif</Option>
        </Select>
      </Form.Item>
      
      <div className="form-actions">
        <Space>
          <Button onClick={onCancel}>
            Batal
          </Button>
          <Button type="primary" htmlType="submit">
            {initialValues ? 'Perbarui' : 'Simpan'}
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default SupplierForm;