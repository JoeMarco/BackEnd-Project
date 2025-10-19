import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Input, 
  Modal, 
  Form, 
  Select, 
  InputNumber, 
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { bomService } from '../../api/bom';
import { productService } from '../../api/product';
import { materialService } from '../../api/material';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { validationRules } from '../../utils/validators';
import FilterPanel from '../../components/ui/FilterPanel';
import BOMForm from '../../components/forms/BOMForm';

const { Search } = Input;
const { Option } = Select;

const BOM = () => {
  const [bomItems, setBOMItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBOM, setEditingBOM] = useState(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    products: 0,
    materials: 0
  });
  
  useEffect(() => {
    fetchBOMItems();
    fetchProducts();
    fetchMaterials();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters, searchText]);
  
  const fetchBOMItems = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };
      
      if (searchText) {
        params.search = searchText;
      }
      
      const response = await bomService.getBOMs(params);
      
      setBOMItems(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.totalItems
      }));
    } catch (error) {
      message.error('Gagal memuat data BOM');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProducts = async () => {
    try {
      const response = await productService.getProducts({ limit: 1000 });
      setProducts(response.data);
    } catch (error) {
      message.error('Gagal memuat data produk');
    }
  };
  
  const fetchMaterials = async () => {
    try {
      const response = await materialService.getMaterials({ limit: 1000 });
      setMaterials(response.data);
    } catch (error) {
      message.error('Gagal memuat data bahan baku');
    }
  };
  
  const fetchStats = async () => {
    try {
      const response = await bomService.getBOMs({ limit: 1000 });
      const data = response.data;
      
      const uniqueProducts = new Set(data.map(item => item.product_id)).size;
      const uniqueMaterials = new Set(data.map(item => item.material_id)).size;
      
      setStats({
        total: data.length,
        products: uniqueProducts,
        materials: uniqueMaterials
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };
  
  const handleSearch = (value) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };
  
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
  };
  
  const handleAdd = () => {
    setEditingBOM(null);
    setModalVisible(true);
    form.resetFields();
  };
  
  const handleEdit = (record) => {
    setEditingBOM(record);
    setModalVisible(true);
    form.setFieldsValue({
      product_id: record.product_id,
      material_id: record.material_id,
      quantity: record.quantity
    });
  };
  
  const handleDelete = async (id) => {
    try {
      await bomService.deleteBOM(id);
      message.success('BOM berhasil dihapus');
      fetchBOMItems();
      fetchStats();
    } catch (error) {
      message.error('Gagal menghapus BOM');
    }
  };
  
  const handleSubmit = async (values) => {
    try {
      if (editingBOM) {
        await bomService.updateBOM(editingBOM.id, values);
        message.success('BOM berhasil diperbarui');
      } else {
        await bomService.createBOM(values);
        message.success('BOM berhasil ditambahkan');
      }
      
      setModalVisible(false);
      fetchBOMItems();
      fetchStats();
    } catch (error) {
      message.error(editingBOM ? 'Gagal memperbarui BOM' : 'Gagal menambahkan BOM');
    }
  };
  
  const columns = [
    {
      title: 'Produk',
      dataIndex: ['product', 'name'],
      key: 'product',
      render: (productName, record) => (
        <div>
          <div>{productName}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            SKU: {record.product?.sku}
          </div>
        </div>
      ),
    },
    {
      title: 'Bahan Baku',
      dataIndex: ['material', 'name'],
      key: 'material',
      render: (materialName, record) => (
        <div>
          <div>{materialName}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            SKU: {record.material?.sku} | Satuan: {record.material?.unit}
          </div>
        </div>
      ),
    },
    {
      title: 'Jumlah',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (value, record) => (
        <div>
          <div>{value}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.material?.unit}
          </div>
        </div>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Apakah Anda yakin ingin menghapus BOM ini?"
            onConfirm={() => handleDelete(record.id)}
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Total BOM" value={stats.total} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Produk" value={stats.products} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Bahan Baku" value={stats.materials} />
          </Card>
        </Col>
      </Row>
      
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Search
              placeholder="Cari BOM"
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 250 }}
              onSearch={handleSearch}
            />
          </Space>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAdd}
            >
              Tambah BOM
            </Button>
          </Space>
        </div>
        
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilter}
          onReset={() => {
            setFilters({});
            setSearchText('');
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
        >
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="product_id" label="Produk">
              <Select placeholder="Pilih produk" allowClear>
                {products.map(product => (
                  <Option key={product.id} value={product.id}>
                    {product.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="material_id" label="Bahan Baku">
              <Select placeholder="Pilih bahan baku" allowClear>
                {materials.map(material => (
                  <Option key={material.id} value={material.id}>
                    {material.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </FilterPanel>
        
        <Table
          columns={columns}
          dataSource={bomItems}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} items`,
          }}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>
      
      <Modal
        title={editingBOM ? 'Edit BOM' : 'Tambah BOM'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <BOMForm
          form={form}
          initialValues={editingBOM}
          products={products}
          materials={materials}
          onSubmit={handleSubmit}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default BOM;