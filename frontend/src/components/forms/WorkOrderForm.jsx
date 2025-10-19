import React from 'react';
import { Form, Select, InputNumber, DatePicker, Button, Row, Col, Space, Input } from 'antd';
import { validationRules } from '../../utils/validators';

const { Option } = Select;
const { TextArea } = Input;

const WorkOrderForm = ({ 
  form, 
  initialValues, 
  products, 
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
      {initialValues && initialValues.id && (
        <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
          <strong>No. WO:</strong> {initialValues.wo_number}
        </div>
      )}
      
      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item
            name="product_id"
            label="Produk"
            rules={[validationRules.required]}
          >
            <Select placeholder="Pilih produk">
              {products.map(product => (
                <Option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="quantity_planned"
            label="Jumlah Rencana"
            rules={[validationRules.required, validationRules.positiveInteger]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Masukkan jumlah rencana"
              min={1}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="status"
            label="Status"
          >
            {initialValues && initialValues.id ? (
              <Select>
                <Option value="pending">Menunggu</Option>
                <Option value="in_progress">Dalam Proses</Option>
                <Option value="completed">Selesai</Option>
                <Option value="cancelled">Dibatalkan</Option>
              </Select>
            ) : (
              <Select disabled>
                <Option value="pending">Menunggu</Option>
              </Select>
            )}
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="start_date"
            label="Tanggal Mulai"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="completion_date"
            label="Tanggal Selesai"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item
        name="notes"
        label="Catatan"
      >
        <TextArea rows={3} placeholder="Masukkan catatan" />
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

export default WorkOrderForm;