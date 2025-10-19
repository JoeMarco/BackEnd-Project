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
  DatePicker,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Tabs,
  Divider,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { workOrderService } from '../../api/workOrder';
import { productService } from '../../api/product';
import { formatCurrency, formatDate, formatDateTime, getStatusColor, getStatusText } from '../../utils/helpers';
import { validationRules } from '../../utils/validators';
import FilterPanel from '../../components/ui/FilterPanel';
import WorkOrderForm from '../../components/forms/WorkOrderForm';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState([]);
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
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [bomModalVisible, setBOMModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [editingWO, setEditingWO] = useState(null);
  const [selectedWO, setSelectedWO] = useState(null);
  const [bomRequirements, setBOMRequirements] = useState([]);
  const [form] = Form.useForm();
  const [completeForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0
  });
  
  useEffect(() => {
    fetchWorkOrders();
    fetchProducts();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters, searchText, activeTab]);
  
  const fetchWorkOrders = async () => {
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
      
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      
      const response = await workOrderService.getWorkOrders(params);
      
      setWorkOrders(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.totalItems
      }));
    } catch (error) {
      message.error('Gagal memuat data pesanan produksi');
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
  
  const fetchStats = async () => {
    try {
      const response = await workOrderService.getWorkOrders({ limit: 1000 });
      const data = response.data;
      
      setStats({
        total: data.length,
        pending: data.filter(item => item.status === 'pending').length,
        in_progress: data.filter(item => item.status === 'in_progress').length,
        completed: data.filter(item => item.status === 'completed').length,
        cancelled: data.filter(item => item.status === 'cancelled').length
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
  
  const handleTabChange = (key) => {
    setActiveTab(key);
    setPagination(prev => ({ ...prev, current: 1 }));
  };
  
  const handleAdd = () => {
    setEditingWO({ status: 'pending' });
    setModalVisible(true);
    form.resetFields();
  };
  
  const handleEdit = (record) => {
    setEditingWO(record);
    setModalVisible(true);
    form.setFieldsValue({
      ...record,
      start_date: record.start_date ? dayjs(record.start_date) : null,
      completion_date: record.completion_date ? dayjs(record.completion_date) : null
    });
  };
  
  const handleView = async (record) => {
    try {
      const response = await workOrderService.getWorkOrderById(record.id);
      setSelectedWO(response.data);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('Gagal memuat detail pesanan produksi');
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await workOrderService.deleteWorkOrder(id);
      message.success('Pesanan produksi berhasil dihapus');
      fetchWorkOrders();
      fetchStats();
    } catch (error) {
      message.error('Gagal menghapus pesanan produksi');
    }
  };
  
  const handleStart = async (id) => {
    try {
      await workOrderService.startWorkOrder(id);
      message.success('Pesanan produksi berhasil dimulai');
      fetchWorkOrders();
      fetchStats();
    } catch (error) {
      message.error(error.response?.data?.message || 'Gagal memulai pesanan produksi');
    }
  };
  
  const handleComplete = (record) => {
    setSelectedWO(record);
    setCompleteModalVisible(true);
    completeForm.setFieldsValue({
      quantity_produced: record.quantity_planned
    });
  };
  
  const handleCompleteSubmit = async (values) => {
    try {
      await workOrderService.completeWorkOrder(selectedWO.id, values);
      message.success('Pesanan produksi berhasil diselesaikan');
      setCompleteModalVisible(false);
      fetchWorkOrders();
      fetchStats();
    } catch (error) {
      message.error(error.response?.data?.message || 'Gagal menyelesaikan pesanan produksi');
    }
  };
  
  const handleCancel = async (id) => {
    try {
      await workOrderService.cancelWorkOrder(id);
      message.success('Pesanan produksi berhasil dibatalkan');
      fetchWorkOrders();
      fetchStats();
    } catch (error) {
      message.error('Gagal membatalkan pesanan produksi');
    }
  };
  
  const handleViewBOM = async (record) => {
    try {
      const response = await workOrderService.getWorkOrderBOMRequirements(record.id);
      setBOMRequirements(response.data);
      setSelectedWO(record);
      setBOMModalVisible(true);
    } catch (error) {
      message.error('Gagal memuat kebutuhan BOM');
    }
  };
  
  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
        completion_date: values.completion_date ? values.completion_date.format('YYYY-MM-DD') : null
      };
      
      if (editingWO && editingWO.id) {
        await workOrderService.updateWorkOrder(editingWO.id, formattedValues);
        message.success('Pesanan produksi berhasil diperbarui');
      } else {
        await workOrderService.createWorkOrder(formattedValues);
        message.success('Pesanan produksi berhasil ditambahkan');
      }
      
      setModalVisible(false);
      fetchWorkOrders();
      fetchStats();
    } catch (error) {
      message.error(editingWO && editingWO.id ? 'Gagal memperbarui pesanan produksi' : 'Gagal menambahkan pesanan produksi');
    }
  };
  
  const columns = [
    {
      title: 'No. WO',
      dataIndex: 'wo_number',
      key: 'wo_number',
      sorter: true,
    },
    {
      title: 'Produk',
      dataIndex: ['product', 'name'],
      key: 'product',
      render: (product, record) => (
        <div>
          <div>{product}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            SKU: {record.product?.sku}
          </div>
        </div>
      ),
    },
    {
      title: 'Qty Rencana',
      dataIndex: 'quantity_planned',
      key: 'quantity_planned',
    },
    {
      title: 'Qty Dihasilkan',
      dataIndex: 'quantity_produced',
      key: 'quantity_produced',
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
      title: 'Tanggal Mulai',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (value) => value ? formatDate(value) : '-',
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleView(record)}
          />
          
          {record.status === 'pending' && (
            <>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                size="small"
                onClick={() => handleEdit(record)}
              />
              <Button 
                type="primary" 
                icon={<ToolOutlined />} 
                size="small"
                onClick={() => handleViewBOM(record)}
              />
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />} 
                size="small"
                onClick={() => handleStart(record.id)}
              />
              <Button 
                type="primary" 
                danger 
                icon={<CloseOutlined />} 
                size="small"
                onClick={() => handleCancel(record.id)}
              />
            </>
          )}
          
          {record.status === 'in_progress' && (
            <Button 
              type="primary" 
              icon={<CheckOutlined />} 
              size="small"
              onClick={() => handleComplete(record)}
            />
          )}
          
          {record.status === 'pending' && (
            <Popconfirm
              title="Apakah Anda yakin ingin menghapus pesanan produksi ini?"
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
          )}
        </Space>
      ),
    },
  ];
  
  const bomColumns = [
    {
      title: 'Bahan Baku',
      dataIndex: 'material_name',
      key: 'material_name',
    },
    {
      title: 'SKU',
      dataIndex: 'material_sku',
      key: 'material_sku',
    },
    {
      title: 'Dibutuhkan',
      dataIndex: 'required_quantity',
      key: 'required_quantity',
      render: (value, record) => (
        <div>
          <div>{value}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.unit}
          </div>
        </div>
      ),
    },
    {
      title: 'Tersedia',
      dataIndex: 'current_stock',
      key: 'current_stock',
    },
    {
      title: 'Kekurangan',
      dataIndex: 'shortage',
      key: 'shortage',
      render: (value) => (
        <span style={{ color: value > 0 ? '#cf1322' : undefined }}>
          {value}
        </span>
      ),
    },
  ];
  
  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total WO" value={stats.total} prefix={<ToolOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Menunggu" value={stats.pending} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Dalam Proses" value={stats.in_progress} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Selesai" value={stats.completed} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>
      
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Search
              placeholder="Cari pesanan produksi"
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
              Tambah WO
            </Button>
          </Space>
        </div>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          items={[
            { key: 'all', label: 'Semua' },
            { key: 'pending', label: 'Menunggu' },
            { key: 'in_progress', label: 'Dalam Proses' },
            { key: 'completed', label: 'Selesai' },
            { key: 'cancelled', label: 'Dibatalkan' }
          ]}
        />
        
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
        </FilterPanel>
        
        <Table
          columns={columns}
          dataSource={workOrders}
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
        title={editingWO && editingWO.id ? 'Edit Pesanan Produksi' : 'Tambah Pesanan Produksi'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <WorkOrderForm
          form={form}
          initialValues={editingWO}
          products={products}
          onSubmit={handleSubmit}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
      
      <Modal
        title="Detail Pesanan Produksi"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Tutup
          </Button>
        ]}
        width={600}
      >
        {selectedWO && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>No. WO:</strong> {selectedWO.wo_number}</p>
                <p><strong>Produk:</strong> {selectedWO.product?.name}</p>
                <p><strong>Qty Rencana:</strong> {selectedWO.quantity_planned}</p>
                <p><strong>Qty Dihasilkan:</strong> {selectedWO.quantity_produced}</p>
              </Col>
              <Col span={12}>
                <p><strong>Status:</strong> 
                  <Tag color={getStatusColor(selectedWO.status)} style={{ marginLeft: 8 }}>
                    {getStatusText(selectedWO.status)}
                  </Tag>
                </p>
                <p><strong>Tanggal Mulai:</strong> {selectedWO.start_date ? formatDate(selectedWO.start_date) : '-'}</p>
                <p><strong>Tanggal Selesai:</strong> {selectedWO.completion_date ? formatDate(selectedWO.completion_date) : '-'}</p>
                <p><strong>Dibuat oleh:</strong> {selectedWO.creator?.full_name}</p>
              </Col>
            </Row>
            
            {selectedWO.notes && (
              <div style={{ marginBottom: 16 }}>
                <p><strong>Catatan:</strong></p>
                <p>{selectedWO.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
      
      <Modal
        title="Kebutuhan Bahan Baku"
        open={bomModalVisible}
        onCancel={() => setBOMModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setBOMModalVisible(false)}>
            Tutup
          </Button>
        ]}
        width={800}
      >
        {selectedWO && (
          <div>
            <p><strong>Produk:</strong> {selectedWO.product?.name}</p>
            <p><strong>Qty Rencana:</strong> {selectedWO.quantity_planned}</p>
            
            {bomRequirements.some(req => req.shortage > 0) && (
              <Alert
                message="Stok Tidak Mencukupi"
                description="Beberapa bahan baku tidak mencukupi untuk memulai produksi."
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
            
            <Table
              columns={bomColumns}
              dataSource={bomRequirements}
              rowKey="material_id"
              pagination={false}
            />
          </div>
        )}
      </Modal>
      
      <Modal
        title="Selesaikan Pesanan Produksi"
        open={completeModalVisible}
        onCancel={() => setCompleteModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedWO && (
          <Form
            form={completeForm}
            layout="vertical"
            onFinish={handleCompleteSubmit}
          >
            <p><strong>Produk:</strong> {selectedWO.product?.name}</p>
            <p><strong>Qty Rencana:</strong> {selectedWO.quantity_planned}</p>
            
            <Form.Item
              name="quantity_produced"
              label="Jumlah yang Dihasilkan"
              rules={[
                validationRules.required,
                validationRules.positiveInteger,
                {
                  validator: (_, value) => {
                    if (value > selectedWO.quantity_planned) {
                      return Promise.reject('Jumlah yang dihasilkan tidak boleh melebihi jumlah rencana');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                max={selectedWO.quantity_planned}
              />
            </Form.Item>
            
            <div className="form-actions">
              <Space>
                <Button onClick={() => setCompleteModalVisible(false)}>
                  Batal
                </Button>
                <Button type="primary" htmlType="submit">
                  Selesaikan
                </Button>
              </Space>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default WorkOrders;