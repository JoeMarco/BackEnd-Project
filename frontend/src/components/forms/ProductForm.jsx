import React from 'react';
import { Form, Input, Select, InputNumber, Button, Row, Col, Space } from 'antd';
import { validationRules } from '../../utils/validators';

const { Option } = Select;

const ProductForm = ({ 
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
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="sku"
            label="SKU"
            rules={[validationRules.required]}
          >
            <Input placeholder="Masukkan SKU" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="name"
            label="Nama Produk"
            rules={[validationRules.required]}
          >
            <Input placeholder="Masukkan nama produk" />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="category"
            label="Kategori"
          >
            <Input placeholder="Masukkan kategori" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="type"
            label="Tipe"
            rules={[validationRules.required]}
          >
            <Select placeholder="Pilih tipe">
              <Option value="sendal">Sendal</Option>
              <Option value="boot">Boot</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="size"
            label="Ukuran"
          >
            <Input placeholder="Masukkan ukuran" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="color"
            label="Warna"
          >
            <Input placeholder="Masukkan warna" />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="unit_price"
            label="Harga Satuan"
            rules={[validationRules.required, validationRules.positiveNumber]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Masukkan harga satuan"
              formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/Rp\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="stock"
            label="Stok Awal"
            rules={[validationRules.required, validationRules.positiveInteger]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Masukkan stok awal"
              min={0}
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item
        name="min_stock"
        label="Stok Minimum"
        rules={[validationRules.required, validationRules.positiveInteger]}
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="Masukkan stok minimum"
          min={0}
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

export default ProductForm;