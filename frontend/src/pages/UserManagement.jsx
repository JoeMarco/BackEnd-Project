import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
  Typography
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { userService } from '../api/user';

const { Option } = Select;
const { Title } = Typography;

/**
 * User Management Page
 * Admin-only page for managing system users
 */
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [form] = Form.useForm();
  
  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    role: undefined,
    is_active: undefined
  });

  // Load users on mount and when pagination/filters change
  useEffect(() => {
    loadUsers();
    loadStats();
  }, [pagination.current, pagination.pageSize, filters]);

  /**
   * Load users with pagination and filters
   */
  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };
      
      const response = await userService.getUsers(params);
      setUsers(response.data.users);
      setPagination({
        ...pagination,
        total: response.data.total
      });
    } catch (error) {
      message.error('Gagal memuat data pengguna: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load user statistics
   */
  const loadStats = async () => {
    try {
      const response = await userService.getUserStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  /**
   * Handle table pagination change
   */
  const handleTableChange = (newPagination) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total
    });
  };

  /**
   * Handle search input change
   */
  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
    setPagination({ ...pagination, current: 1 });
  };

  /**
   * Handle role filter change
   */
  const handleRoleFilter = (value) => {
    setFilters({ ...filters, role: value });
    setPagination({ ...pagination, current: 1 });
  };

  /**
   * Handle status filter change
   */
  const handleStatusFilter = (value) => {
    setFilters({ ...filters, is_active: value });
    setPagination({ ...pagination, current: 1 });
  };

  /**
   * Open modal for creating new user
   */
  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ is_active: true });
    setModalVisible(true);
  };

  /**
   * Open modal for editing user
   */
  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      username: record.username,
      full_name: record.full_name,
      email: record.email,
      role: record.role,
      is_active: record.is_active
    });
    setModalVisible(true);
  };

  /**
   * Handle form submit (create or update)
   */
  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        // Update existing user
        await userService.updateUser(editingUser.id, values);
        message.success('Pengguna berhasil diperbarui');
      } else {
        // Create new user
        await userService.createUser(values);
        message.success('Pengguna berhasil ditambahkan');
      }
      
      setModalVisible(false);
      form.resetFields();
      loadUsers();
      loadStats();
    } catch (error) {
      message.error(
        editingUser 
          ? 'Gagal memperbarui pengguna: ' + (error.response?.data?.message || error.message)
          : 'Gagal menambahkan pengguna: ' + (error.response?.data?.message || error.message)
      );
    }
  };

  /**
   * Handle user deletion
   */
  const handleDelete = async (id) => {
    try {
      await userService.deleteUser(id);
      message.success('Pengguna berhasil dihapus');
      loadUsers();
      loadStats();
    } catch (error) {
      message.error('Gagal menghapus pengguna: ' + (error.response?.data?.message || error.message));
    }
  };

  /**
   * Get role badge color
   */
  const getRoleColor = (role) => {
    const colors = {
      admin: 'red',
      staff: 'blue',
      viewer: 'green'
    };
    return colors[role] || 'default';
  };

  /**
   * Get role label in Indonesian
   */
  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrator',
      staff: 'Staff Operasional',
      viewer: 'Viewer'
    };
    return labels[role] || role;
  };

  // Table columns definition
  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Nama Lengkap',
      dataIndex: 'full_name',
      key: 'full_name',
      width: 200
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (text) => text || '-'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {getRoleLabel(role)}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Aktif' : 'Nonaktif'}
        </Tag>
      )
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus Pengguna"
            description="Yakin ingin menghapus pengguna ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Tidak"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <UserOutlined /> Kelola Pengguna
      </Title>

      {/* Statistics Cards */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Pengguna"
                value={stats.totalUsers}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Administrator"
                value={stats.byRole?.admin || 0}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Staff"
                value={stats.byRole?.staff || 0}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Viewer"
                value={stats.byRole?.viewer || 0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        {/* Filter and Action Bar */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Input
              placeholder="Cari username atau nama..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Filter Role"
              onChange={handleRoleFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="admin">Administrator</Option>
              <Option value="staff">Staff</Option>
              <Option value="viewer">Viewer</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Filter Status"
              onChange={handleStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value={true}>Aktif</Option>
              <Option value={false}>Nonaktif</Option>
            </Select>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadUsers}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Tambah Pengguna
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Users Table */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Username harus diisi' },
              { min: 3, message: 'Username minimal 3 karakter' },
              { max: 50, message: 'Username maksimal 50 karakter' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { 
                required: !editingUser, 
                message: 'Password harus diisi' 
              },
              { 
                min: 6, 
                message: 'Password minimal 6 karakter' 
              }
            ]}
            extra={editingUser ? 'Kosongkan jika tidak ingin mengubah password' : ''}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item
            name="full_name"
            label="Nama Lengkap"
            rules={[
              { required: true, message: 'Nama lengkap harus diisi' }
            ]}
          >
            <Input placeholder="Nama Lengkap" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: 'email', message: 'Format email tidak valid' }
            ]}
          >
            <Input placeholder="email@example.com" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[
              { required: true, message: 'Role harus dipilih' }
            ]}
          >
            <Select placeholder="Pilih Role">
              <Option value="admin">
                <Tag color="red">Administrator</Tag>
                <span style={{ marginLeft: 8 }}>Akses penuh sistem</span>
              </Option>
              <Option value="staff">
                <Tag color="blue">Staff Operasional</Tag>
                <span style={{ marginLeft: 8 }}>Operasional harian</span>
              </Option>
              <Option value="viewer">
                <Tag color="green">Viewer</Tag>
                <span style={{ marginLeft: 8 }}>Hanya dashboard</span>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Status Aktif"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Aktif" unCheckedChildren="Nonaktif" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Batal
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Perbarui' : 'Tambah'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
