import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Modal, 
  Form, 
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Select
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { supplierService } from '../../api/supplier';
import { formatCurrency, formatDate, getStatusColor, getStatusText } from '../../utils/helpers';
import { validationRules } from '../../utils/validators';
import FilterPanel from '../../components/ui/FilterPanel';
import SupplierForm from '../../components/forms/SupplierForm';

const { Search } = Input;
const { TextArea } = Input;
const { Option } = Select;

const Suppliers = () => {
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
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });
  
  useEffect(() => {
    fetchSuppliers();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters, searchText]);
  
  const fetchSuppliers = async () => {
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
      
      const response = await supplierService.getSuppliers(params);
      
      setSuppliers(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.totalItems
      }));
    } catch (error) {
      message.error('Gagal memuat data pemasok');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      const response = await supplierService.getSuppliers({ limit: 1000 });
      const data = response.data;
      
      setStats({
        total: data.length,
        active: data.filter(item => item.status === 'active').length,
        inactive: data.filter(item => item.status === 'inactive').length
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
    setEditingSupplier(null);
    setModalVisible(true);
    form.resetFields();
  };
  
  const handleEdit = (record) => {
    setEditingSupplier(record);
    setModalVisible(true);
    form.setFieldsValue(record);
  };
  
  const handleDelete = async (id) => {
    try {
      await supplierService.deleteSupplier(id);
      message.success('Pemasok berhasil dihapus');
      fetchSuppliers();
      fetchStats();
    } catch (error) {
      message.error('Gagal menghapus pemasok');
    }
  };
  
  const handleSubmit = async (values) => {
    try {
      if (editingSupplier) {
        await supplierService.updateSupplier(editingSupplier.id, values);
        message.success('Pemasok berhasil diperbarui');
      } else {
        await supplierService.createSupplier(values);
        message.success('Pemasok berhasil ditambahkan');
      }
      
      setModalVisible(false);
      fetchSuppliers();
      fetchStats();
    } catch (error) {
      message.error(editingSupplier ? 'Gagal memperbarui pemasok' : 'Gagal menambahkan pemasok');
    }
  };
  
  const handleExport = async () => {
    try {
      const response = await supplierService.exportSuppliers(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `suppliers_${Date.now()}.xlsx`);
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
      title: 'Nama',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Kontak',
      dataIndex: 'contact',
      key: 'contact',
      render: (text) => text || '-',
    },
    {
      title: 'Telepon',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => text || '-',
    },
    {
      title: 'Alamat',
      dataIndex: 'address',
      key: 'address',
      render: (text) => text ? (
        <span title={text}>
          {text.length > 30 ? `${text.substring(0, 30)}...` : text}
        </span>
      ) : '-',
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
            title="Apakah Anda yakin ingin menghapus pemasok ini?"
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
            <Statistic title="Total Pemasok" value={stats.total} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Aktif" value={stats.active} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Tidak Aktif" value={stats.inactive} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
      </Row>
      
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Search
              placeholder="Cari pemasok"
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
              Tambah Pemasok
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
        </FilterPanel>
        
        <Table
          columns={columns}
          dataSource={suppliers}
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
        title={editingSupplier ? 'Edit Pemasok' : 'Tambah Pemasok'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <SupplierForm
          form={form}
          initialValues={editingSupplier}
          onSubmit={handleSubmit}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default Suppliers;