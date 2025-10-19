import React, { useState, useEffect } from 'react';
import { Form, Select, InputNumber, DatePicker, Button, Row, Col, Space, Table, Input, Divider, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { validationRules } from '../../utils/validators';
import { formatCurrency } from '../../utils/helpers';

const { Option } = Select;
const { TextArea } = Input;

const POForm = ({ 
  form, 
  initialValues, 
  suppliers, 
  materials, 
  onSubmit, 
  onCancel 
}) => {
  const [items, setItems] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  
  useEffect(() => {
    if (initialValues && initialValues.items) {
      setItems(initialValues.items.map(item => ({
        key: item.id,
        material_id: item.material_id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      })));
      setSelectedSupplier(initialValues.supplier_id);
    }
  }, [initialValues]);
  
  const handleSupplierChange = (supplierId) => {
    setSelectedSupplier(supplierId);
  };
  
  const handleAddItem = () => {
    const newKey = Date.now();
    setItems([...items, {
      key: newKey,
      material_id: null,
      quantity: 1,
      price: 0,
      subtotal: 0
    }]);
  };
  
  const handleRemoveItem = (key) => {
    setItems(items.filter(item => item.key !== key));
  };
  
  const handleItemChange = (key, field, value) => {
    const newItems = [...items];
    const itemIndex = newItems.findIndex(item => item.key === key);
    
    if (itemIndex !== -1) {
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        [field]: value
      };
      
      // Auto-import price when material is selected
      if (field === 'material_id') {
        const selectedMaterial = materials.find(m => m.id === value);
        if (selectedMaterial && selectedMaterial.unit_price !== null && selectedMaterial.unit_price !== undefined) {
          newItems[itemIndex].price = selectedMaterial.unit_price;
          newItems[itemIndex].subtotal = newItems[itemIndex].quantity * selectedMaterial.unit_price;
        }
      }
      
      // Calculate subtotal if quantity or price changed
      if (field === 'quantity' || field === 'price') {
        const quantity = field === 'quantity' ? value : newItems[itemIndex].quantity;
        const price = field === 'price' ? value : newItems[itemIndex].price;
        newItems[itemIndex].subtotal = quantity * price;
      }
      
      setItems(newItems);
    }
  };
  
  const handleSubmit = (values) => {
    // Validate items
    if (items.length === 0) {
      return message.error('Tambahkan minimal satu item bahan baku');
    }
    
    // Validate each item
    for (const item of items) {
      if (!item.material_id) {
        return message.error('Pilih bahan baku untuk semua item');
      }
      if (!item.quantity || item.quantity < 1) {
        return message.error('Masukkan jumlah yang valid untuk semua item');
      }
      if (item.price === null || item.price === undefined) {
        return message.error('Harga tidak valid untuk item: ' + (materials.find(m => m.id === item.material_id)?.name || 'Unknown'));
      }
    }
    
    const formattedValues = {
      ...values,
      items: items.map(item => ({
        material_id: item.material_id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      }))
    };
    
    onSubmit(formattedValues);
  };
  
  const itemColumns = [
    {
      title: 'Bahan Baku',
      dataIndex: 'material_id',
      key: 'material_id',
      render: (value, record) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Pilih bahan baku"
          value={value}
          onChange={(val) => handleItemChange(record.key, 'material_id', val)}
          showSearch
          optionFilterProp="children"
        >
          {materials.map(material => (
            <Option key={material.id} value={material.id}>
              {material.name} ({material.sku}) - Stok: {material.stock} {material.unit}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Stok Saat Ini',
      dataIndex: 'material_id',
      key: 'stock',
      width: 120,
      render: (value) => {
        const material = materials.find(m => m.id === value);
        return material ? (
          <span style={{ color: material.stock < material.min_stock ? '#ff4d4f' : '#52c41a' }}>
            {material.stock} {material.unit}
          </span>
        ) : '-';
      },
    },
    {
      title: 'Jumlah',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (value, record) => (
        <InputNumber
          style={{ width: '100%' }}
          min={1}
          value={value}
          onChange={(val) => handleItemChange(record.key, 'quantity', val)}
        />
      ),
    },
    {
      title: 'Harga Satuan',
      dataIndex: 'price',
      key: 'price',
      width: 140,
      render: (value) => (
        <span style={{ fontWeight: 500 }}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 140,
      render: (value) => (
        <span style={{ fontWeight: 500 }}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          size="small"
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ];
  
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
    >
      {initialValues && initialValues.id && (
        <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
          <strong>No. PO:</strong> {initialValues.po_number}
        </div>
      )}
      
      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item
            name="supplier_id"
            label="Pemasok"
            rules={[validationRules.required]}
          >
            <Select 
              placeholder="Pilih pemasok" 
              onChange={handleSupplierChange}
            >
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
            name="order_date"
            label="Tanggal Pesanan"
            rules={[validationRules.required]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="status"
            label="Status"
            initialValue="pending"
          >
            <Select>
              <Option value="pending">Menunggu</Option>
              <Option value="approved">Disetujui</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item
        name="notes"
        label="Catatan"
      >
        <TextArea rows={3} placeholder="Masukkan catatan" />
      </Form.Item>
      
      <Divider orientation="left">Item Pesanan</Divider>
      
      <Table
        columns={itemColumns}
        dataSource={items}
        rowKey="key"
        pagination={false}
        size="small"
        footer={() => (
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddItem}
            style={{ width: '100%' }}
          >
            Tambah Item
          </Button>
        )}
      />
      
      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <h3>Total: {formatCurrency(total)}</h3>
      </div>
      
      <div className="form-actions">
        <Space>
          <Button onClick={onCancel}>
            Batal
          </Button>
          <Button type="primary" htmlType="submit" disabled={items.length === 0}>
            {initialValues ? 'Perbarui' : 'Simpan'}
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default POForm;