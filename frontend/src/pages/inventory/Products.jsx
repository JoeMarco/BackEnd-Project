import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
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
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { productService } from '../../api/product';
import { formatCurrency, formatDate, getStatusColor, getStatusText, getProductTypeText } from '../../utils/helpers';
import { validationRules } from '../../utils/validators';
import FilterPanel from '../../components/ui/FilterPanel';
import ProductForm from '../../components/forms/ProductForm';

const { Search } = Input;
const { Option } = Select;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    lowStock: 0
  });
  
  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters, searchText]);
  
  const fetchProducts = async () => {
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
      
      const response = await productService.getProducts(params);
      
      setProducts(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.totalItems
      }));
    } catch (error) {
      message.error('Gagal memuat data produk');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      const response = await productService.getProducts({ limit: 1000 });
      const data = response.data;
      
      setStats({
        total: data.length,
        active: data.filter(item => item.status === 'active').length,
        inactive: data.filter(item => item.status === 'inactive').length,
        lowStock: data.filter(item => item.stock <= item.min_stock).length
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
    setEditingProduct(null);
    setModalVisible(true);
    form.resetFields();
  };
  
  const handleEdit = (record) => {
    setEditingProduct(record);
    setModalVisible(true);
    form.setFieldsValue(record);
  };
  
  const handleDelete = async (id) => {
    try {
      await productService.deleteProduct(id);
      message.success('Produk berhasil dihapus');
      fetchProducts();
      fetchStats();
    } catch (error) {
      message.error('Gagal menghapus produk');
    }
  };
  
  const handleSubmit = async (values) => {
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, values);
        message.success('Produk berhasil diperbarui');
      } else {
        await productService.createProduct(values);
        message.success('Produk berhasil ditambahkan');
      }
      
      setModalVisible(false);
      fetchProducts();
      fetchStats();
    } catch (error) {
      message.error(editingProduct ? 'Gagal memperbarui produk' : 'Gagal menambahkan produk');
    }
  };
  
  const handleExport = async () => {
    try {
      const response = await productService.exportProducts(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      message.success('Data berhasil diekspor');
    } catch (error) {
      message.error('Gagal mengekspor data');
    }
  };
  
  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      sorter: true,
    },
    {
      title: 'Nama',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (text) => text || '-',
    },
    {
      title: 'Tipe',
      dataIndex: 'type',
      key: 'type',
      render: (value) => getProductTypeText(value),
    },
    {
      title: 'Ukuran',
      dataIndex: 'size',
      key: 'size',
      render: (text) => text || '-',
    },
    {
      title: 'Warna',
      dataIndex: 'color',
      key: 'color',
      render: (text) => text || '-',
    },
    {
      title: 'Harga Satuan',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (value) => formatCurrency(value),
      sorter: true,
    },
    {
      title: 'Stok',
      dataIndex: 'stock',
      key: 'stock',
      render: (value, record) => {
        const isLowStock = value <= record.min_stock;
        return (
          <span style={{ color: isLowStock ? '#cf1322' : undefined }}>
            {value}
          </span>
        );
      },
      sorter: true,
    },
    {
      title: 'Stok Minimum',
      dataIndex: 'min_stock',
      key: 'min_stock',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value) => (
        <Tag color={getStatusColor(value)}>
          {getStatusText(value)}
        </Tag>
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
            title="Apakah Anda yakin ingin menghapus produk ini?"
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
        <Col span={6}>
          <Card>
            <Statistic title="Total Produk" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Aktif" value={stats.active} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Tidak Aktif" value={stats.inactive} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Stok Menipis" value={stats.lowStock} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
      </Row>
      
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Search
              placeholder="Cari produk"
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
              Tambah Produk
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleExport}
            >
              Export
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
            <Form.Item name="status" label="Status">
              <Select placeholder="Pilih status" allowClear>
                <Option value="active">Aktif</Option>
                <Option value="inactive">Tidak Aktif</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="type" label="Tipe">
              <Select placeholder="Pilih tipe" allowClear>
                <Option value="sendal">Sendal</Option>
                <Option value="boot">Boot</Option>
              </Select>
            </Form.Item>
          </Col>
        </FilterPanel>
        
        <Table
          columns={columns}
          dataSource={products}
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
        title={editingProduct ? 'Edit Produk' : 'Tambah Produk'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <ProductForm
          form={form}
          initialValues={editingProduct}
          onSubmit={handleSubmit}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default Products;