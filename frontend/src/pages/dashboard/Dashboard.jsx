import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Tag, Statistic, Typography } from 'antd';
import { 
  InboxOutlined, 
  ExclamationCircleOutlined,
  FileTextOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { stockService } from '../../api/stock';
import { materialService } from '../../api/material';
import { productService } from '../../api/product';
import { poService } from '../../api/po';
import { salesService } from '../../api/sales';
import { workOrderService } from '../../api/workOrder';
import { formatCurrency, getStatusColor, getStatusText, CHART_COLORS } from '../../utils/helpers';
import StatCard from '../../components/ui/StatCard';

const { Title } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stockSummary, setStockSummary] = useState({});
  const [lowStockMaterials, setLowStockMaterials] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [pendingPOs, setPendingPOs] = useState([]);
  const [pendingSOs, setPendingSOs] = useState([]);
  const [activeWOs, setActiveWOs] = useState([]);
  const [stockByCategory, setStockByCategory] = useState([]);
  const [monthlyTransactions, setMonthlyTransactions] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch stock summary
        const stockRes = await stockService.getStockSummary();
        setStockSummary(stockRes.data.dashboard_summary);
        
        // Fetch low stock items
        const lowMatRes = await materialService.getLowStockMaterials();
        setLowStockMaterials(lowMatRes.data);
        
        const lowProdRes = await productService.getLowStockProducts();
        setLowStockProducts(lowProdRes.data);
        
        // Fetch pending transactions
        const poRes = await poService.getPurchaseOrders({ status: 'pending', limit: 5 });
        setPendingPOs(poRes.data);
        
        const soRes = await salesService.getSalesOrders({ status: 'pending', limit: 5 });
        setPendingSOs(soRes.data);
        
        const woRes = await workOrderService.getWorkOrders({ status: 'in_progress', limit: 5 });
        setActiveWOs(woRes.data);
        
        // Prepare chart data
        // Stock by category
        const categoryData = [];
        
        // Group materials by category
        const materialCategories = {};
        if (stockRes.data.materials && stockRes.data.materials.length > 0) {
          stockRes.data.materials.forEach(item => {
            const category = item.category || 'Bahan Baku Lainnya';
            materialCategories[category] = (materialCategories[category] || 0) + parseInt(item.stock || 0);
          });
        }
        
        // Group products by type (sendal/boot)
        const productTypes = {};
        if (stockRes.data.products && stockRes.data.products.length > 0) {
          stockRes.data.products.forEach(item => {
            const type = item.type === 'sendal' ? 'Sendal' : item.type === 'boot' ? 'Boot' : 'Produk Lainnya';
            productTypes[type] = (productTypes[type] || 0) + parseInt(item.stock || 0);
          });
        }
        
        // Combine materials and products into category data
        Object.keys(materialCategories).forEach(key => {
          categoryData.push({
            name: key,
            value: materialCategories[key]
          });
        });
        
        Object.keys(productTypes).forEach(key => {
          categoryData.push({
            name: key,
            value: productTypes[key]
          });
        });
        
        // If no data, add placeholder
        if (categoryData.length === 0) {
          categoryData.push({ name: 'Tidak Ada Data', value: 0 });
        }
        
        setStockByCategory(categoryData);
        
        // Monthly transactions (mock data for 12 months)
        const monthlyData = [
          { month: 'Jan', pembelian: 45000000, penjualan: 35000000 },
          { month: 'Feb', pembelian: 38000000, penjualan: 42000000 },
          { month: 'Mar', pembelian: 52000000, penjualan: 48000000 },
          { month: 'Apr', pembelian: 47000000, penjualan: 51000000 },
          { month: 'Mei', pembelian: 43000000, penjualan: 46000000 },
          { month: 'Jun', pembelian: 49000000, penjualan: 53000000 },
          { month: 'Jul', pembelian: 55000000, penjualan: 58000000 },
          { month: 'Agt', pembelian: 51000000, penjualan: 54000000 },
          { month: 'Sep', pembelian: 48000000, penjualan: 52000000 },
          { month: 'Oct', pembelian: 53000000, penjualan: 57000000 },
          { month: 'Nov', pembelian: 46000000, penjualan: 49000000 },
          { month: 'Des', pembelian: 50000000, penjualan: 55000000 }
        ];
        setMonthlyTransactions(monthlyData);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Table columns
  const poColumns = [
    {
      title: 'No. PO',
      dataIndex: 'po_number',
      key: 'po_number',
      ellipsis: true,
      width: 120,
    },
    {
      title: 'Pemasok',
      dataIndex: ['Supplier', 'name'],
      key: 'supplier',
      ellipsis: true,
      render: (text) => <span style={{ fontSize: '12px' }}>{text}</span>,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      width: 110,
      render: (value) => (
        <span style={{ fontSize: '12px', fontWeight: 500 }}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 90,
      render: (value) => (
        <Tag color={getStatusColor(value)} style={{ fontSize: '11px', margin: 0 }}>
          {getStatusText(value)}
        </Tag>
      ),
    },
  ];
  
  const soColumns = [
    {
      title: 'No. SO',
      dataIndex: 'so_number',
      key: 'so_number',
      ellipsis: true,
      width: 120,
    },
    {
      title: 'Pelanggan',
      dataIndex: ['Customer', 'name'],
      key: 'customer',
      ellipsis: true,
      render: (text) => <span style={{ fontSize: '12px' }}>{text}</span>,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      width: 110,
      render: (value) => (
        <span style={{ fontSize: '12px', fontWeight: 500 }}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 90,
      render: (value) => (
        <Tag color={getStatusColor(value)} style={{ fontSize: '11px', margin: 0 }}>
          {getStatusText(value)}
        </Tag>
      ),
    },
  ];
  
  const woColumns = [
    {
      title: 'No. WO',
      dataIndex: 'wo_number',
      key: 'wo_number',
    },
    {
      title: 'Produk',
      dataIndex: ['Product', 'name'],
      key: 'product',
    },
    {
      title: 'Qty Rencana',
      dataIndex: 'quantity_planned',
      key: 'quantity_planned',
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
  ];
  
  return (
    <div>
      <Title level={2}>Dashboard</Title>
      
      {/* Statistic Cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <StatCard
            title="Total Bahan Baku"
            value={stockSummary.total_materials || 0}
            prefix={<InboxOutlined />}
          />
        </Col>
        <Col span={6}>
          <StatCard
            title="Total Produk"
            value={stockSummary.total_products || 0}
            prefix={<InboxOutlined />}
          />
        </Col>
        <Col span={6}>
          <StatCard
            title="Stok Menipis"
            value={(stockSummary.low_stock_materials || 0) + (stockSummary.low_stock_products || 0)}
            prefix={<ExclamationCircleOutlined />}
            valueStyle={{ color: '#cf1322' }}
          />
        </Col>
        <Col span={6}>
          <StatCard
            title="Total Stok"
            value={(stockSummary.total_material_stock || 0) + (stockSummary.total_product_stock || 0)}
            prefix={<ShoppingCartOutlined />}
          />
        </Col>
      </Row>
      
      {/* Charts */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card title="Transaksi Bulanan" loading={loading}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart 
                data={monthlyTransactions}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  stroke="#8c8c8c"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#8c8c8c"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                  iconType="rect"
                  iconSize={12}
                />
                <Bar 
                  dataKey="pembelian" 
                  fill="#1890ff" 
                  radius={[4, 4, 0, 0]}
                  name="Pembelian"
                />
                <Bar 
                  dataKey="penjualan" 
                  fill="#52c41a" 
                  radius={[4, 4, 0, 0]}
                  name="Penjualan"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Stok per Kategori" loading={loading}>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={stockByCategory}
                  cx="50%"
                  cy="45%"
                  labelLine={true}
                  label={({ name, percent }) => `${(percent * 100).toFixed(1)}%`}
                  outerRadius={90}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {stockByCategory.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[Object.keys(CHART_COLORS)[index % Object.keys(CHART_COLORS).length]]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value} unit`}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px'
                  }}
                />
              </PieChart>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                justifyContent: 'center', 
                marginTop: '10px',
                gap: '8px'
              }}>
                {stockByCategory.map((entry, index) => (
                  <div 
                    key={`legend-${index}`}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      fontSize: '12px',
                      padding: '4px 8px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px'
                    }}
                  >
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: CHART_COLORS[Object.keys(CHART_COLORS)[index % Object.keys(CHART_COLORS).length]],
                      marginRight: '6px',
                      borderRadius: '2px'
                    }} />
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      
      {/* Tables */}
      <Row gutter={16}>
        <Col span={8}>
          <Card 
            title="Stok Menipis - Bahan Baku" 
            size="small"
            headStyle={{ backgroundColor: '#fafafa', fontWeight: 600 }}
          >
            <Table
              dataSource={lowStockMaterials.slice(0, 5)}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ y: 240 }}
              columns={[
                {
                  title: 'Nama',
                  dataIndex: 'name',
                  key: 'name',
                  ellipsis: true,
                },
                {
                  title: 'Stok',
                  dataIndex: 'stock',
                  key: 'stock',
                  align: 'right',
                  width: 70,
                  render: (value) => (
                    <span style={{ color: '#cf1322', fontWeight: 500 }}>{value}</span>
                  ),
                },
                {
                  title: 'Min',
                  dataIndex: 'min_stock',
                  key: 'min_stock',
                  align: 'right',
                  width: 70,
                },
              ]}
              loading={loading}
              locale={{ emptyText: 'Tidak ada data' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            title="Pesanan Pembelian Pending" 
            size="small"
            headStyle={{ backgroundColor: '#fafafa', fontWeight: 600 }}
          >
            <Table
              dataSource={pendingPOs.slice(0, 5)}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ y: 240 }}
              columns={poColumns}
              loading={loading}
              locale={{ emptyText: 'Tidak ada data' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            title="Pesanan Penjualan Pending" 
            size="small"
            headStyle={{ backgroundColor: '#fafafa', fontWeight: 600 }}
          >
            <Table
              dataSource={pendingSOs.slice(0, 5)}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ y: 240 }}
              columns={soColumns}
              loading={loading}
              locale={{ emptyText: 'Tidak ada data' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;