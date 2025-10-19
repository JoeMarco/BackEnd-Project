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
  App,
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
  ShoppingCartOutlined
} from '@ant-design/icons';
import { poService } from '../../api/po';
import { supplierService } from '../../api/supplier';
import { materialService } from '../../api/material';
import { formatCurrency, formatDate, formatDateTime, getStatusColor, getStatusText } from '../../utils/helpers';
import { validationRules } from '../../utils/validators';
import FilterPanel from '../../components/ui/FilterPanel';
import POForm from '../../components/forms/POForm';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

const PurchaseOrders = () => {
  const { message } = App.useApp();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
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
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingPO, setEditingPO] = useState(null);
  const [selectedPO, setSelectedPO] = useState(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    received: 0,
    cancelled: 0
  });
  
  useEffect(() => {
    fetchPurchaseOrders();
    fetchSuppliers();
    fetchMaterials();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters, searchText, activeTab]);
  
  const fetchPurchaseOrders = async () => {
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
      
      const response = await poService.getPurchaseOrders(params);
      
      setPurchaseOrders(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.totalItems
      }));
    } catch (error) {
      message.error('Gagal memuat data pesanan pembelian');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getSuppliers({ limit: 1000 });
      setSuppliers(response.data);
    } catch (error) {
      message.error('Gagal memuat data pemasok');
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
      const response = await poService.getPurchaseOrders({ limit: 1000 });
      const data = response.data;
      
      setStats({
        total: data.length,
        pending: data.filter(item => item.status === 'pending').length,
        approved: data.filter(item => item.status === 'approved').length,
        received: data.filter(item => item.status === 'received').length,
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
    setEditingPO(null);
    setModalVisible(true);
    form.resetFields();
  };
  
  const handleEdit = async (record) => {
    try {
      // Fetch full details including items
      const response = await poService.getById(record.id);
      const fullData = response.data;
      
      setEditingPO(fullData);
      setModalVisible(true);
      form.setFieldsValue({
        ...fullData,
        order_date: dayjs(fullData.order_date)
      });
    } catch (error) {
      console.error('❌ Failed to load PO for editing:', error);
      message.error('Gagal memuat data pesanan pembelian');
    }
  };
  
  const handleView = async (record) => {
    try {
      const response = await poService.getById(record.id);
      console.log('🔍 PO Detail Response:', response);
      console.log('🔍 PO Data:', response.data);
      console.log('🔍 PO Items:', response.data?.POItems);
      setSelectedPO(response.data);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('❌ Failed to load PO detail:', error);
      message.error('Gagal memuat detail pesanan pembelian');
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await poService.delete(id);
      message.success('Pesanan pembelian berhasil dihapus');
      fetchPurchaseOrders();
      fetchStats();
    } catch (error) {
      message.error('Gagal menghapus pesanan pembelian');
    }
  };
  
  const handleApprove = async (id) => {
    try {
      await poService.approve(id);
      message.success('Pesanan pembelian berhasil disetujui');
      fetchPurchaseOrders();
      fetchStats();
    } catch (error) {
      message.error('Gagal menyetujui pesanan pembelian');
    }
  };
  
  const handleReceive = async (id) => {
    try {
      await poService.receive(id);
      message.success('Pesanan pembelian berhasil diterima');
      fetchPurchaseOrders();
      fetchStats();
    } catch (error) {
      message.error('Gagal menerima pesanan pembelian');
    }
  };
  
  const handleCancel = async (id) => {
    try {
      await poService.cancel(id);
      message.success('Pesanan pembelian berhasil dibatalkan');
      fetchPurchaseOrders();
      fetchStats();
    } catch (error) {
      message.error('Gagal membatalkan pesanan pembelian');
    }
  };
  
  const handleSubmit = async (values) => {
    try {
      console.log('🔍 PO Form values received:', values);
      console.log('🔍 order_date type:', typeof values.order_date);
      console.log('🔍 order_date value:', values.order_date);
      
      const formattedValues = {
        ...values,
        order_date: values.order_date.format('YYYY-MM-DD')
      };
      
      console.log('📤 Sending formatted values:', formattedValues);
      
      if (editingPO) {
        await poService.update(editingPO.id, formattedValues);
        message.success('Pesanan pembelian berhasil diperbarui');
      } else {
        await poService.create(formattedValues);
        message.success('Pesanan pembelian berhasih ditambahkan');
      }
      
      setModalVisible(false);
      fetchPurchaseOrders();
      fetchStats();
    } catch (error) {
      console.error('❌ PO Submit Error:', error);
      console.error('❌ Error response:', error.response?.data);
      message.error(editingPO ? 'Gagal memperbarui pesanan pembelian' : 'Gagal menambahkan pesanan pembelian');
    }
  };
  
  const columns = [
    {
      title: 'No. PO',
      dataIndex: 'po_number',
      key: 'po_number',
      sorter: true,
    },
    {
      title: 'Pemasok',
      dataIndex: ['Supplier', 'name'],
      key: 'supplier',
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
                onClick={() => handleApprove(record.id)}
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
          
          {record.status === 'approved' && (
            <Button 
              type="primary" 
              icon={<CheckOutlined />} 
              size="small"
              onClick={() => handleReceive(record.id)}
            />
          )}
          
          {(record.status === 'pending' || record.status === 'approved') && (
            <Popconfirm
              title="Apakah Anda yakin ingin menghapus pesanan pembelian ini?"
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
      title: 'Bahan Baku',
      dataIndex: ['RawMaterial', 'name'],
      key: 'material',
      render: (material, record) => (
        <div>
          <div>{material}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            SKU: {record.RawMaterial?.sku}
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
            {record.RawMaterial?.unit}
          </div>
        </div>
      ),
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
            <Statistic title="Total PO" value={stats.total} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Menunggu" value={stats.pending} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Disetujui" value={stats.approved} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Diterima" value={stats.received} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>
      
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Search
              placeholder="Cari pesanan pembelian"
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
              Tambah PO
            </Button>
          </Space>
        </div>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          items={[
            { key: 'all', label: 'Semua' },
            { key: 'pending', label: 'Menunggu' },
            { key: 'approved', label: 'Disetujui' },
            { key: 'received', label: 'Diterima' },
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
          dataSource={purchaseOrders}
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
        title={editingPO ? 'Edit Pesanan Pembelian' : 'Tambah Pesanan Pembelian'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <POForm
          form={form}
          initialValues={editingPO}
          suppliers={suppliers}
          materials={materials}
          onSubmit={handleSubmit}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
      
      <Modal
        title="Detail Pesanan Pembelian"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Tutup
          </Button>
        ]}
        width={800}
      >
        {selectedPO && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>No. PO:</strong> {selectedPO.po_number}</p>
                <p><strong>Pemasok:</strong> {selectedPO.Supplier?.name}</p>
                <p><strong>Tanggal Pesanan:</strong> {formatDate(selectedPO.order_date)}</p>
              </Col>
              <Col span={12}>
                <p><strong>Status:</strong> 
                  <Tag color={getStatusColor(selectedPO.status)} style={{ marginLeft: 8 }}>
                    {getStatusText(selectedPO.status)}
                  </Tag>
                </p>
                <p><strong>Total:</strong> {formatCurrency(selectedPO.total)}</p>
                <p><strong>Dibuat oleh:</strong> {selectedPO.creator?.full_name}</p>
              </Col>
            </Row>
            
            {selectedPO.notes && (
              <div style={{ marginBottom: 16 }}>
                <p><strong>Catatan:</strong></p>
                <p>{selectedPO.notes}</p>
              </div>
            )}
            
            <Divider />
            
            <Table
              columns={detailColumns}
              dataSource={selectedPO.items}
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

export default PurchaseOrders;