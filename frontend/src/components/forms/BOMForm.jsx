import React, { useState, useEffect } from 'react';
import { Form, Select, InputNumber, Button, Row, Col, Space, Alert } from 'antd';
import { validationRules } from '../../utils/validators';

const { Option } = Select;

const BOMForm = ({ 
  form, 
  initialValues, 
  products, 
  materials, 
  onSubmit, 
  onCancel 
}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [existingBOM, setExistingBOM] = useState(null);
  
  useEffect(() => {
    if (initialValues) {
      setSelectedProduct(initialValues.product_id);
      setSelectedMaterial(initialValues.material_id);
    }
  }, [initialValues]);
  
  const handleProductChange = (productId) => {
    setSelectedProduct(productId);
    form.setFieldsValue({ material_id: undefined });
    setSelectedMaterial(null);
    setExistingBOM(null);
  };
  
  const handleMaterialChange = (materialId) => {
    setSelectedMaterial(materialId);
    
    // Check if this combination already exists
    if (selectedProduct && materialId) {
      const material = materials.find(m => m.id === materialId);
      setExistingBOM(material ? material.unit : null);
    } else {
      setExistingBOM(null);
    }
  };
  
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
            name="product_id"
            label="Produk"
            rules={[validationRules.required]}
          >
            <Select 
              placeholder="Pilih produk" 
              onChange={handleProductChange}
            >
              {products.map(product => (
                <Option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="material_id"
            label="Bahan Baku"
            rules={[validationRules.required]}
          >
            <Select 
              placeholder="Pilih bahan baku" 
              onChange={handleMaterialChange}
            >
              {materials.map(material => (
                <Option key={material.id} value={material.id}>
                  {material.name} ({material.sku})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item
        name="quantity"
        label="Jumlah"
        rules={[validationRules.required, validationRules.positiveNumber]}
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="Masukkan jumlah"
          min={0}
          step={0.01}
          addonAfter={existingBOM}
        />
      </Form.Item>
      
      {existingBOM && (
        <Alert
          message="Informasi Satuan"
          description={`Satuan untuk bahan baku ini adalah ${existingBOM}`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
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

export default BOMForm;