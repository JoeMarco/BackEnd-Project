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
import { materialService } from '../../api/material';
import { supplierService } from '../../api/supplier';
import { formatCurrency, formatDate, getStatusColor, getStatusText } from '../../utils/helpers';
import { validationRules } from '../../utils/validators';
import FilterPanel from '../../components/ui/FilterPanel';
import MaterialForm from '../../components/forms/MaterialForm';

const { Search } = Input;
const { Option } = Select;

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    lowStock: 0
  });
  
  useEffect(() => {
    fetchMaterials();
    fetchSuppliers();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters, searchText]);
  
  const fetchMaterials = async () => {
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
      
      const response = await materialService.getMaterials(params);
      
      setMaterials(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.totalItems
      }));
    } catch (error) {
      message.error('Gagal memuat data bahan baku');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getSuppliers({ limit: 100 });
      setSuppliers(response.data);
    } catch (error) {
      message.error('Gagal memuat data pemasok');
    }
  };
  
  const fetchStats = async () => {
    try {
      const response = await materialService.getMaterials({ limit: 1000 });
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
    setEditingMaterial(null);
    setModalVisible(true);
    form.resetFields();
  };
  
  const handleEdit = (record) => {
    setEditingMaterial(record);
    setModalVisible(true);
    form.setFieldsValue(record);
  };
  
  const handleDelete = async (id) => {
    try {
      await materialService.deleteMaterial(id);
      message.success('Bahan baku berhasil dihapus');
      fetchMaterials();
      fetchStats();
    } catch (error) {
      message.error('Gagal menghapus bahan baku');
    }
  };
  
  const handleSubmit = async (values) => {
    try {
      if (editingMaterial) {
        await materialService.updateMaterial(editingMaterial.id, values);
        message.success('Bahan baku berhasil diperbarui');
      } else {
        await materialService.createMaterial(values);
        message.success('Bahan baku berhasil ditambahkan');
      }
      
      setModalVisible(false);
      fetchMaterials();
      fetchStats();
    } catch (error) {
      message.error(editingMaterial ? 'Gagal memperbarui bahan baku' : 'Gagal menambahkan bahan baku');
    }
  };
  
  const handleExport = async () => {
    try {
      const response = await materialService.exportMaterials(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `materials_${Date.now()}.xlsx`);
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
      title: 'Satuan',
      dataIndex: 'unit',
      key: 'unit',
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
      title: 'Pemasok',
      dataIndex: ['Supplier', 'name'],
      key: 'supplier',
      render: (supplier) => supplier || '-',
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
            title="Apakah Anda yakin ingin menghapus bahan baku ini?"
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
            <Statistic title="Total Bahan Baku" value={stats.total} />
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
              placeholder="Cari bahan baku"
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
              Tambah Bahan Baku
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
            <Form.Item name="supplier_id" label="Pemasok">
              <Select placeholder="Pilih pemasok" allowClear>
                {suppliers.map(supplier => (
                  <Option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </FilterPanel>
        
        <Table
          columns={columns}
          dataSource={materials}
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
        title={editingMaterial ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <MaterialForm
          form={form}
          initialValues={editingMaterial}
          suppliers={suppliers}
          onSubmit={handleSubmit}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default Materials;