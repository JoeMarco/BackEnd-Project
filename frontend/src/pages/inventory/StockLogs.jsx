import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Select, 
  Tag, 
  DatePicker, 
  Space, 
  Button,
  Row,
  Col
} from 'antd';
import { 
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { stockService } from '../../api/stock';
import { formatDateTime, getStatusColor, getStatusText, getStockMovementTypeText, getItemTypeText, exportToCSV } from '../../utils/helpers';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const StockLogs = () => {
  const [stockLogs, setStockLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});
  
  useEffect(() => {
    fetchStockLogs();
  }, [pagination.current, pagination.pageSize, filters]);
  
  const fetchStockLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };
      
      const response = await stockService.getStockLogs(params);
      
      setStockLogs(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.totalItems
      }));
    } catch (error) {
      console.error('Error fetching stock logs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };
  
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters };
    
    if (value === undefined || value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
  };
  
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      handleFilterChange('start_date', dates[0].format('YYYY-MM-DD'));
      handleFilterChange('end_date', dates[1].format('YYYY-MM-DD'));
    } else {
      const newFilters = { ...filters };
      delete newFilters.start_date;
      delete newFilters.end_date;
      setFilters(newFilters);
      setPagination(prev => ({ ...prev, current: 1 }));
    }
  };
  
  const handleExport = () => {
    const exportData = stockLogs.map(log => ({
      'Tanggal': formatDateTime(log.created_at),
      'Tipe Item': getItemTypeText(log.item_type),
      'Item': log.item ? log.item.name : '-',
      'SKU': log.item ? log.item.sku : '-',
      'Tipe Pergerakan': getStockMovementTypeText(log.movement_type),
      'Jumlah': log.quantity,
      'Referensi': log.reference_type ? `${log.reference_type}-${log.reference_id}` : '-',
      'Catatan': log.notes || '-',
      'Pengguna': log.creator ? log.creator.full_name : '-'
    }));
    
    exportToCSV(exportData, `stock_logs_${dayjs().format('YYYY-MM-DD')}`);
  };
  
  const columns = [
    {
      title: 'Tanggal',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value) => formatDateTime(value),
      sorter: true,
    },
    {
      title: 'Tipe Item',
      dataIndex: 'item_type',
      key: 'item_type',
      render: (value) => (
        <Tag color={value === 'material' ? 'blue' : 'green'}>
          {getItemTypeText(value)}
        </Tag>
      ),
    },
    {
      title: 'Item',
      dataIndex: 'item',
      key: 'item',
      render: (item) => item ? item.name : '-',
    },
    {
      title: 'SKU',
      dataIndex: ['item', 'sku'],
      key: 'sku',
      render: (sku, record) => {
        if (!record.item) return '-';
        return record.item.sku || '-';
      },
    },
    {
      title: 'Tipe Pergerakan',
      dataIndex: 'movement_type',
      key: 'movement_type',
      render: (value) => {
        const color = value === 'in' ? 'green' : value === 'out' ? 'red' : 'orange';
        return (
          <Tag color={color}>
            {getStockMovementTypeText(value)}
          </Tag>
        );
      },
    },
    {
      title: 'Jumlah',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Referensi',
      key: 'reference',
      render: (_, record) => {
        if (!record.reference_type) return '-';
        return `${record.reference_type}-${record.reference_id}`;
      },
    },
    {
      title: 'Catatan',
      dataIndex: 'notes',
      key: 'notes',
      render: (text) => text || '-',
    },
    {
      title: 'Pengguna',
      dataIndex: ['creator', 'full_name'],
      key: 'user',
      render: (user) => user || '-',
    },
  ];
  
  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space wrap>
            <Select
              placeholder="Tipe Item"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => handleFilterChange('item_type', value)}
            >
              <Option value="material">Bahan Baku</Option>
              <Option value="product">Produk</Option>
            </Select>
            
            <Select
              placeholder="Tipe Pergerakan"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => handleFilterChange('movement_type', value)}
            >
              <Option value="in">Masuk</Option>
              <Option value="out">Keluar</Option>
              <Option value="adjust">Penyesuaian</Option>
            </Select>
            
            <Select
              placeholder="Referensi"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => handleFilterChange('reference_type', value)}
            >
              <Option value="PO">PO</Option>
              <Option value="WO">WO</Option>
              <Option value="SO">SO</Option>
              <Option value="ADJUSTMENT">Penyesuaian</Option>
            </Select>
            
            <RangePicker
              placeholder={['Tanggal Mulai', 'Tanggal Selesai']}
              onChange={handleDateRangeChange}
            />
          </Space>
          
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchStockLogs}
            >
              Refresh
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleExport}
            >
              Export
            </Button>
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={stockLogs}
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
    </div>
  );
};

export default StockLogs;