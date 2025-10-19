import React, { useState, useEffect } from 'react';
import { Form, Select, InputNumber, DatePicker, Button, Row, Col, Space, Table, Input, Divider, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { validationRules } from '../../utils/validators';
import { formatCurrency } from '../../utils/helpers';

const { Option } = Select;
const { TextArea } = Input;

const SalesOrderForm = ({ 
  form, 
  initialValues, 
  customers, 
  products, 
  onSubmit, 
  onCancel 
}) => {
  const [items, setItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  useEffect(() => {
    if (initialValues && initialValues.items) {
      setItems(initialValues.items.map(item => ({
        key: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      })));
      setSelectedCustomer(initialValues.customer_id);
    }
  }, [initialValues]);
  
  const handleCustomerChange = (customerId) => {
    setSelectedCustomer(customerId);
  };
  
  const handleAddItem = () => {
    const newKey = Date.now();
    setItems([...items, {
      key: newKey,
      product_id: null,
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
      
      // Auto-import price when product is selected
      if (field === 'product_id') {
        const selectedProduct = products.find(p => p.id === value);
        if (selectedProduct && selectedProduct.unit_price !== null && selectedProduct.unit_price !== undefined) {
          newItems[itemIndex].price = selectedProduct.unit_price;
          newItems[itemIndex].subtotal = newItems[itemIndex].quantity * selectedProduct.unit_price;
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
      return message.error('Tambahkan minimal satu item produk');
    }
    
    // Validate each item
    for (const item of items) {
      if (!item.product_id) {
        return message.error('Pilih produk untuk semua item');
      }
      if (!item.quantity || item.quantity < 1) {
        return message.error('Masukkan jumlah yang valid untuk semua item');
      }
      if (item.price === null || item.price === undefined) {
        return message.error('Harga tidak valid untuk item: ' + (products.find(p => p.id === item.product_id)?.name || 'Unknown'));
      }
    }
    
    const formattedValues = {
      ...values,
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      }))
    };
    
    onSubmit(formattedValues);
  };
  
  const itemColumns = [
    {
      title: 'Produk',
      dataIndex: 'product_id',
      key: 'product_id',
      render: (value, record) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Pilih produk"
          value={value}
          onChange={(val) => handleItemChange(record.key, 'product_id', val)}
          showSearch
          optionFilterProp="children"
        >
          {products.map(product => (
            <Option key={product.id} value={product.id}>
              {product.name} ({product.sku}) - Stok: {product.stock}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Stok Tersedia',
      dataIndex: 'product_id',
      key: 'stock',
      width: 120,
      render: (value, record) => {
        const product = products.find(p => p.id === value);
        if (!product) return '-';
        
        const isOverStock = record.quantity > product.stock;
        return (
          <span style={{ color: isOverStock ? '#ff4d4f' : product.stock < product.min_stock ? '#faad14' : '#52c41a' }}>
            {product.stock}
            {isOverStock && (
              <div style={{ fontSize: '11px', color: '#ff4d4f' }}>
                ⚠ Kurang {record.quantity - product.stock}
              </div>
            )}
          </span>
        );
      },
    },
    {
      title: 'Jumlah',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (value, record) => {
        const product = products.find(p => p.id === record.product_id);
        const isOverStock = product && value > product.stock;
        
        return (
          <div>
            <InputNumber
              style={{ 
                width: '100%',
                borderColor: isOverStock ? '#ff4d4f' : undefined
              }}
              min={1}
              value={value}
              onChange={(val) => handleItemChange(record.key, 'quantity', val)}
              status={isOverStock ? 'error' : undefined}
            />
            {isOverStock && (
              <div style={{ fontSize: '11px', color: '#ff4d4f', marginTop: 4 }}>
                Melebihi stok!
              </div>
            )}
          </div>
        );
      },
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
          <strong>No. SO:</strong> {initialValues.so_number}
        </div>
      )}
      
      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item
            name="customer_id"
            label="Pelanggan"
            rules={[validationRules.required]}
          >
            <Select 
              placeholder="Pilih pelanggan" 
              onChange={handleCustomerChange}
            >
              {customers.map(customer => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name}
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
              <Option value="confirmed">Dikonfirmasi</Option>
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

export default SalesOrderForm;