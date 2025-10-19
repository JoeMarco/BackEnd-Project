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
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  TruckOutlined
} from '@ant-design/icons';
import { salesService } from '../../api/sales';
import { customerService } from '../../api/customer';
import { productService } from '../../api/product';
import { formatCurrency, formatDate, formatDateTime, getStatusColor, getStatusText } from '../../utils/helpers';
import { validationRules } from '../../utils/validators';
import FilterPanel from '../../components/ui/FilterPanel';
import SalesOrderForm from '../../components/forms/SalesOrderForm';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

const SalesOrders = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
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
  const [editingSO, setEditingSO] = useState(null);
  const [selectedSO, setSelectedSO] = useState(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    completed: 0
  });
  
  useEffect(() => {
    fetchSalesOrders();
    fetchCustomers();
    fetchProducts();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters, searchText, activeTab]);
  
  const fetchSalesOrders = async () => {
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
      
      const response = await salesService.getSalesOrders(params);
      
      setSalesOrders(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.totalItems
      }));
    } catch (error) {
      message.error('Gagal memuat data pesanan penjualan');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCustomers = async () => {
    try {
      const response = await customerService.getCustomers({ limit: 1000 });
      setCustomers(response.data);
    } catch (error) {
      message.error('Gagal memuat data pelanggan');
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
      const response = await salesService.getSalesOrders({ limit: 1000 });
      const data = response.data;
      
      setStats({
        total: data.length,
        pending: data.filter(item => item.status === 'pending').length,
        confirmed: data.filter(item => item.status === 'confirmed').length,
        shipped: data.filter(item => item.status === 'shipped').length,
        completed: data.filter(item => item.status === 'completed').length
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
    setEditingSO(null);
    setModalVisible(true);
    form.resetFields();
  };
  
  const handleEdit = async (record) => {
    try {
      // Fetch full details including items
      const response = await salesService.getSalesOrderById(record.id);
      const fullData = response.data;
      
      setEditingSO(fullData);
      setModalVisible(true);
      form.setFieldsValue({
        ...fullData,
        order_date: dayjs(fullData.order_date)
      });
    } catch (error) {
      console.error('❌ Failed to load SO for editing:', error);
      message.error('Gagal memuat data pesanan penjualan');
    }
  };
  
  const handleView = async (record) => {
    try {
      const response = await salesService.getSalesOrderById(record.id);
      console.log('🔍 SO Detail Response:', response);
      console.log('🔍 SO Data:', response.data);
      console.log('🔍 SO Items:', response.data?.items);
      setSelectedSO(response.data);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('❌ Failed to load SO detail:', error);
      message.error('Gagal memuat detail pesanan penjualan');
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await salesService.deleteSalesOrder(id);
      message.success('Pesanan penjualan berhasil dihapus');
      fetchSalesOrders();
      fetchStats();
    } catch (error) {
      message.error('Gagal menghapus pesanan penjualan');
    }
  };
  
  const handleConfirm = async (id) => {
    try {
      await salesService.confirmSalesOrder(id);
      message.success('Pesanan penjualan berhasil dikonfirmasi');
      fetchSalesOrders();
      fetchStats();
    } catch (error) {
      message.error('Gagal mengkonfirmasi pesanan penjualan');
    }
  };
  
  const handleShip = async (id) => {
    try {
      await salesService.shipSalesOrder(id);
      message.success('Pesanan penjualan berhasil dikirim');
      fetchSalesOrders();
      fetchStats();
    } catch (error) {
      message.error(error.response?.data?.message || 'Gagal mengirim pesanan penjualan');
    }
  };
  
  const handleComplete = async (id) => {
    try {
      await salesService.completeSalesOrder(id);
      message.success('Pesanan penjualan berhasil diselesaikan');
      fetchSalesOrders();
      fetchStats();
    } catch (error) {
      message.error('Gagal menyelesaikan pesanan penjualan');
    }
  };
  
  const handleCancel = async (id) => {
    try {
      await salesService.cancelSalesOrder(id);
      message.success('Pesanan penjualan berhasil dibatalkan');
      fetchSalesOrders();
      fetchStats();
    } catch (error) {
      message.error('Gagal membatalkan pesanan penjualan');
    }
  };
  
  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        order_date: values.order_date.format('YYYY-MM-DD')
      };
      
      if (editingSO) {
        await salesService.updateSalesOrder(editingSO.id, formattedValues);
        message.success('Pesanan penjualan berhasil diperbarui');
      } else {
        await salesService.createSalesOrder(formattedValues);
        message.success('Pesanan penjualan berhasil ditambahkan');
      }
      
      setModalVisible(false);
      fetchSalesOrders();
      fetchStats();
    } catch (error) {
      message.error(editingSO ? 'Gagal memperbarui pesanan penjualan' : 'Gagal menambahkan pesanan penjualan');
    }
  };
  
  const columns = [
    {
      title: 'No. SO',
      dataIndex: 'so_number',
      key: 'so_number',
      sorter: true,
    },
    {
      title: 'Pelanggan',
      dataIndex: ['Customer', 'name'],
      key: 'customer',
    },
    {
      title: 'Tanggal Pesanan',
      dataIndex: 'order_date',
      key: 'order_date',
      render: (value) => formatDate(value),
      sorter: true,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (value) => formatCurrency(value),
      sorter: true,
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
                icon={<CheckOutlined />} 
                size="small"
                onClick={() => handleConfirm(record.id)}
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
          
          {record.status === 'confirmed' && (
            <Button 
              type="primary" 
              icon={<TruckOutlined />} 
              size="small"
              onClick={() => handleShip(record.id)}
            />
          )}
          
          {record.status === 'shipped' && (
            <Button 
              type="primary" 
              icon={<CheckOutlined />} 
              size="small"
              onClick={() => handleComplete(record.id)}
            />
          )}
          
          {(record.status === 'pending' || record.status === 'confirmed') && (
            <Popconfirm
              title="Apakah Anda yakin ingin menghapus pesanan penjualan ini?"
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
  
  const detailColumns = [
    {
      title: 'Produk',
      dataIndex: ['Product', 'name'],
      key: 'product',
      render: (product, record) => (
        <div>
          <div>{product}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            SKU: {record.Product?.sku}
          </div>
        </div>
      ),
    },
    {
      title: 'Jumlah',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Harga',
      dataIndex: 'price',
      key: 'price',
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (value) => formatCurrency(value),
    },
  ];
  
  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total SO" value={stats.total} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Menunggu" value={stats.pending} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Dikonfirmasi" value={stats.confirmed} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Dikirim" value={stats.shipped} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
      </Row>
      
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Search
              placeholder="Cari pesanan penjualan"
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
              Tambah SO
            </Button>
          </Space>
        </div>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          items={[
            { key: 'all', label: 'Semua' },
            { key: 'pending', label: 'Menunggu' },
            { key: 'confirmed', label: 'Dikonfirmasi' },
            { key: 'shipped', label: 'Dikirim' },
            { key: 'completed', label: 'Selesai' }
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
            <Form.Item name="customer_id" label="Pelanggan">
              <Select placeholder="Pilih pelanggan" allowClear>
                {customers.map(customer => (
                  <Option key={customer.id} value={customer.id}>
                    {customer.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </FilterPanel>
        
        <Table
          columns={columns}
          dataSource={salesOrders}
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
        title={editingSO ? 'Edit Pesanan Penjualan' : 'Tambah Pesanan Penjualan'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <SalesOrderForm
          form={form}
          initialValues={editingSO}
          customers={customers}
          products={products}
          onSubmit={handleSubmit}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
      
      <Modal
        title="Detail Pesanan Penjualan"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Tutup
          </Button>
        ]}
        width={800}
      >
        {selectedSO && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>No. SO:</strong> {selectedSO.so_number}</p>
                <p><strong>Pelanggan:</strong> {selectedSO.Customer?.name}</p>
                <p><strong>Tanggal Pesanan:</strong> {formatDate(selectedSO.order_date)}</p>
              </Col>
              <Col span={12}>
                <p><strong>Status:</strong> 
                  <Tag color={getStatusColor(selectedSO.status)} style={{ marginLeft: 8 }}>
                    {getStatusText(selectedSO.status)}
                  </Tag>
                </p>
                <p><strong>Total:</strong> {formatCurrency(selectedSO.total)}</p>
                <p><strong>Dibuat oleh:</strong> {selectedSO.creator?.full_name}</p>
              </Col>
            </Row>
            
            {selectedSO.notes && (
              <div style={{ marginBottom: 16 }}>
                <p><strong>Catatan:</strong></p>
                <p>{selectedSO.notes}</p>
              </div>
            )}
            
            <Divider />
            
            <Table
              columns={detailColumns}
              dataSource={selectedSO.items}
              rowKey="id"
              pagination={false}
              summary={pageData => {
                const total = pageData.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <strong>Total</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <strong>{formatCurrency(total)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalesOrders;