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
import { customerService } from '../../api/customer';
import { formatCurrency, formatDate, getStatusColor, getStatusText, getCustomerTypeText } from '../../utils/helpers';
import { validationRules } from '../../utils/validators';
import FilterPanel from '../../components/ui/FilterPanel';
import CustomerForm from '../../components/forms/CustomerForm';

const { Search } = Input;
const { Option } = Select;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    retail: 0,
    wholesale: 0
  });
  
  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters, searchText]);
  
  const fetchCustomers = async () => {
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
      
      const response = await customerService.getCustomers(params);
      
      setCustomers(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.totalItems
      }));
    } catch (error) {
      message.error('Gagal memuat data pelanggan');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      const response = await customerService.getCustomers({ limit: 1000 });
      const data = response.data;
      
      setStats({
        total: data.length,
        active: data.filter(item => item.status === 'active').length,
        inactive: data.filter(item => item.status === 'inactive').length,
        retail: data.filter(item => item.type === 'retail').length,
        wholesale: data.filter(item => item.type === 'wholesale').length
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
    setEditingCustomer(null);
    setModalVisible(true);
    form.resetFields();
  };
  
  const handleEdit = (record) => {
    setEditingCustomer(record);
    setModalVisible(true);
    form.setFieldsValue(record);
  };
  
  const handleDelete = async (id) => {
    try {
      await customerService.deleteCustomer(id);
      message.success('Pelanggan berhasil dihapus');
      fetchCustomers();
      fetchStats();
    } catch (error) {
      message.error('Gagal menghapus pelanggan');
    }
  };
  
  const handleSubmit = async (values) => {
    try {
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, values);
        message.success('Pelanggan berhasil diperbarui');
      } else {
        await customerService.createCustomer(values);
        message.success('Pelanggan berhasil ditambahkan');
      }
      
      setModalVisible(false);
      fetchCustomers();
      fetchStats();
    } catch (error) {
      message.error(editingCustomer ? 'Gagal memperbarui pelanggan' : 'Gagal menambahkan pelanggan');
    }
  };
  
  const handleExport = async () => {
    try {
      const response = await customerService.exportCustomers(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `customers_${Date.now()}.xlsx`);
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
      title: 'Tipe',
      dataIndex: 'type',
      key: 'type',
      render: (value) => (
        <Tag color={value === 'retail' ? 'blue' : 'green'}>
          {getCustomerTypeText(value)}
        </Tag>
      ),
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
            title="Apakah Anda yakin ingin menghapus pelanggan ini?"
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
            <Statistic title="Total Pelanggan" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Retail" value={stats.retail} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Grosir" value={stats.wholesale} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Tidak Aktif" value={stats.inactive} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
      </Row>
      
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Search
              placeholder="Cari pelanggan"
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
              Tambah Pelanggan
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
                <Option value="retail">Retail</Option>
                <Option value="wholesale">Grosir</Option>
              </Select>
            </Form.Item>
          </Col>
        </FilterPanel>
        
        <Table
          columns={columns}
          dataSource={customers}
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
        title={editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <CustomerForm
          form={form}
          initialValues={editingCustomer}
          onSubmit={handleSubmit}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default Customers;