import React from 'react';
import { Form, Input, Select, InputNumber, Button, Row, Col, Space } from 'antd';
import { validationRules } from '../../utils/validators';

const { Option } = Select;

const MaterialForm = ({ 
  form, 
  initialValues, 
  suppliers, 
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
            label="Nama Bahan Baku"
            rules={[validationRules.required]}
          >
            <Input placeholder="Masukkan nama bahan baku" />
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
            name="unit"
            label="Satuan"
            rules={[validationRules.required]}
          >
            <Select placeholder="Pilih satuan">
              <Option value="kg">Kilogram (kg)</Option>
              <Option value="gram">Gram (g)</Option>
              <Option value="liter">Liter (L)</Option>
              <Option value="ml">Mililiter (ml)</Option>
              <Option value="meter">Meter (m)</Option>
              <Option value="cm">Sentimeter (cm)</Option>
              <Option value="pcs">Pieces (pcs)</Option>
              <Option value="box">Box</Option>
              <Option value="lembar">Lembar</Option>
              <Option value="roll">Roll</Option>
            </Select>
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
            name="supplier_id"
            label="Pemasok"
          >
            <Select placeholder="Pilih pemasok" allowClear>
              {suppliers.map(supplier => (
                <Option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
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
        <Col xs={24} sm={12}>
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
        </Col>
      </Row>
      
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

export default MaterialForm;