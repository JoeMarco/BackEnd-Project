import dayjs from 'dayjs';

// Format date
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  return dayjs(date).format(format);
};

// Format date time
export const formatDateTime = (date, format = 'DD/MM/YYYY HH:mm') => {
  return dayjs(date).format(format);
};

// Format currency
export const formatCurrency = (amount, currency = 'Rp ') => {
  return `${currency}${amount.toLocaleString('id-ID')}`;
};

// Get status color
export const getStatusColor = (status) => {
  const statusColors = {
    active: 'green',
    inactive: 'red',
    pending: 'orange',
    approved: 'blue',
    received: 'green',
    cancelled: 'red',
    in_progress: 'blue',
    completed: 'green',
    confirmed: 'blue',
    shipped: 'purple'
  };
  
  return statusColors[status] || 'default';
};

// Get status text
export const getStatusText = (status) => {
  const statusTexts = {
    active: 'Aktif',
    inactive: 'Tidak Aktif',
    pending: 'Menunggu',
    approved: 'Disetujui',
    received: 'Diterima',
    cancelled: 'Dibatalkan',
    in_progress: 'Dalam Proses',
    completed: 'Selesai',
    confirmed: 'Dikonfirmasi',
    shipped: 'Dikirim'
  };
  
  return statusTexts[status] || status;
};

// Get role text
export const getRoleText = (role) => {
  const roleTexts = {
    admin: 'Administrator',
    manager: 'Manager',
    staff: 'Staff'
  };
  
  return roleTexts[role] || role;
};

// Get product type text
export const getProductTypeText = (type) => {
  const typeTexts = {
    sendal: 'Sendal',
    boot: 'Boot'
  };
  
  return typeTexts[type] || type;
};

// Get customer type text
export const getCustomerTypeText = (type) => {
  const typeTexts = {
    retail: 'Retail',
    wholesale: 'Grosir'
  };
  
  return typeTexts[type] || type;
};

// Get stock movement type text
export const getStockMovementTypeText = (type) => {
  const typeTexts = {
    in: 'Masuk',
    out: 'Keluar',
    adjust: 'Penyesuaian'
  };
  
  return typeTexts[type] || type;
};

// Get item type text
export const getItemTypeText = (type) => {
  const typeTexts = {
    material: 'Bahan Baku',
    product: 'Produk'
  };
  
  return typeTexts[type] || type;
};

// Generate table columns
export const generateTableColumns = (columns) => {
  return columns.map(col => ({
    ...col,
    sorter: col.sorter !== false,
    ellipsis: col.ellipsis !== false
  }));
};

// Export data to CSV
export const exportToCSV = (data, filename) => {
  if (!data || !data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    }).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Chart colors for dashboard
export const CHART_COLORS = [
  '#1890ff', // blue
  '#52c41a', // green
  '#faad14', // gold
  '#f5222d', // red
  '#722ed1', // purple
  '#13c2c2', // cyan
  '#eb2f96', // magenta
  '#fa8c16'  // orange
];

// Generate color based on string
export const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += (`00${value.toString(16)}`).substr(-2);
  }
  
  return color;
};