import React from 'react';
import { Card, Form, Row, Col, Select, Input, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onSearch, 
  onReset,
  loading = false,
  children 
}) => {
  const [form] = Form.useForm();
  
  const handleValuesChange = (changedValues, allValues) => {
    if (onFilterChange) {
      onFilterChange(allValues);
    }
  };
  
  const handleSearch = () => {
    form.validateFields().then(values => {
      if (onSearch) {
        onSearch(values);
      }
    });
  };
  
  const handleReset = () => {
    form.resetFields();
    if (onReset) {
      onReset();
    }
  };
  
  return (
    <Card title="Filter" size="small" style={{ marginBottom: 16 }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={filters}
        onValuesChange={handleValuesChange}
      >
        <Row gutter={16}>
          {children || (
            <>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="search" label="Pencarian">
                  <Input placeholder="Kata kunci" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="status" label="Status">
                  <Select placeholder="Pilih status" allowClear>
                    <Option value="active">Aktif</Option>
                    <Option value="inactive">Tidak Aktif</Option>
                  </Select>
                </Form.Item>
              </Col>
            </>
          )}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item label=" ">
              <Space>
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />} 
                  onClick={handleSearch}
                  loading={loading}
                >
                  Cari
                </Button>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default FilterPanel;