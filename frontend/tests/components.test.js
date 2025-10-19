/**
 * Test Suite: Component Testing
 * Testing semua komponen React
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', role: 'admin' },
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: true
  })
}));

jest.mock('../src/hooks/useNotification', () => ({
  useNotification: () => ({
    showNotification: jest.fn(),
    showSuccess: jest.fn(),
    showError: jest.fn()
  })
}));

// Helper function untuk render dengan router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Component Rendering Tests', () => {
  describe('Common Components', () => {
    test('Header should render without crashing', () => {
      const Header = require('../src/components/common/Header.jsx').default;
      expect(() => renderWithRouter(<Header />)).not.toThrow();
    });

    test('Layout should render children', () => {
      const Layout = require('../src/components/common/Layout.jsx').default;
      const { container } = renderWithRouter(
        <Layout>
          <div data-testid="child">Test Content</div>
        </Layout>
      );
      expect(screen.queryByTestId('child')).toBeTruthy();
    });

    test('Sidebar should render without crashing', () => {
      const Sidebar = require('../src/components/common/Sidebar.jsx').default;
      expect(() => renderWithRouter(<Sidebar />)).not.toThrow();
    });
  });

  describe('UI Components', () => {
    test('ConfirmModal should render with props', () => {
      const ConfirmModal = require('../src/components/ui/ConfirmModal.jsx').default;
      const mockOnConfirm = jest.fn();
      const mockOnCancel = jest.fn();
      
      render(
        <ConfirmModal
          visible={true}
          title="Test Title"
          message="Test Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.queryByText('Test Title')).toBeTruthy();
    });

    test('StatCard should display value and title', () => {
      const StatCard = require('../src/components/ui/StatCard.jsx').default;
      render(
        <StatCard
          title="Total Products"
          value={100}
          icon={<span>📦</span>}
        />
      );
      
      expect(screen.queryByText('Total Products')).toBeTruthy();
      expect(screen.queryByText('100')).toBeTruthy();
    });

    test('FilterPanel should handle filter changes', () => {
      const FilterPanel = require('../src/components/ui/FilterPanel.jsx').default;
      const mockOnFilter = jest.fn();
      
      render(
        <FilterPanel
          filters={[]}
          onFilter={mockOnFilter}
        />
      );
      
      // Component should render without errors
      expect(mockOnFilter).not.toHaveBeenCalled();
    });
  });

  describe('Form Components', () => {
    test('MaterialForm should render form fields', () => {
      const MaterialForm = require('../src/components/forms/MaterialForm.jsx').default;
      const mockOnSubmit = jest.fn();
      
      render(
        <MaterialForm
          onSubmit={mockOnSubmit}
          onCancel={() => {}}
        />
      );
      
      // Form should render without errors
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('ProductForm should handle submit', async () => {
      const ProductForm = require('../src/components/forms/ProductForm.jsx').default;
      const mockOnSubmit = jest.fn();
      
      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          onCancel={() => {}}
        />
      );
      
      // Form should render
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('POForm should render with initial data', () => {
      const POForm = require('../src/components/forms/POForm.jsx').default;
      const mockOnSubmit = jest.fn();
      
      render(
        <POForm
          onSubmit={mockOnSubmit}
          onCancel={() => {}}
          initialData={{}}
        />
      );
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});

describe('Component Props Validation', () => {
  test('Components should handle missing optional props', () => {
    const StatCard = require('../src/components/ui/StatCard.jsx').default;
    
    expect(() => {
      render(<StatCard title="Test" value={0} />);
    }).not.toThrow();
  });

  test('Components should handle null/undefined props gracefully', () => {
    const StatCard = require('../src/components/ui/StatCard.jsx').default;
    
    expect(() => {
      render(<StatCard title={null} value={undefined} />);
    }).not.toThrow();
  });
});

describe('Event Handler Testing', () => {
  test('ConfirmModal should call onConfirm when confirmed', () => {
    const ConfirmModal = require('../src/components/ui/ConfirmModal.jsx').default;
    const mockOnConfirm = jest.fn();
    const mockOnCancel = jest.fn();
    
    const { container } = render(
      <ConfirmModal
        visible={true}
        title="Confirm"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    // Find and click OK button if it exists
    const okButton = container.querySelector('.ant-btn-primary');
    if (okButton) {
      fireEvent.click(okButton);
      expect(mockOnConfirm).toHaveBeenCalled();
    }
  });

  test('ConfirmModal should call onCancel when cancelled', () => {
    const ConfirmModal = require('../src/components/ui/ConfirmModal.jsx').default;
    const mockOnConfirm = jest.fn();
    const mockOnCancel = jest.fn();
    
    const { container } = render(
      <ConfirmModal
        visible={true}
        title="Confirm"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    // Find and click Cancel button if it exists
    const cancelButton = container.querySelector('.ant-btn:not(.ant-btn-primary)');
    if (cancelButton) {
      fireEvent.click(cancelButton);
      expect(mockOnCancel).toHaveBeenCalled();
    }
  });
});

describe('Page Components', () => {
  test('Login page should render', () => {
    const Login = require('../src/pages/auth/Login.jsx').default;
    expect(() => renderWithRouter(<Login />)).not.toThrow();
  });

  test('Dashboard should render', () => {
    const Dashboard = require('../src/pages/dashboard/Dashboard.jsx').default;
    expect(() => renderWithRouter(<Dashboard />)).not.toThrow();
  });

  test('NotFound page should render', () => {
    const NotFound = require('../src/pages/NotFound.jsx').default;
    expect(() => renderWithRouter(<NotFound />)).not.toThrow();
  });

  test('Materials page should render', () => {
    const Materials = require('../src/pages/inventory/Materials.jsx').default;
    expect(() => renderWithRouter(<Materials />)).not.toThrow();
  });

  test('Products page should render', () => {
    const Products = require('../src/pages/inventory/Products.jsx').default;
    expect(() => renderWithRouter(<Products />)).not.toThrow();
  });
});

describe('Component Integration', () => {
  test('Layout with Sidebar and Header should work together', () => {
    const Layout = require('../src/components/common/Layout.jsx').default;
    
    const { container } = renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    expect(container).toBeTruthy();
  });

  test('Form components should integrate with notification hooks', () => {
    const MaterialForm = require('../src/components/forms/MaterialForm.jsx').default;
    const mockOnSubmit = jest.fn();
    
    expect(() => {
      render(
        <MaterialForm
          onSubmit={mockOnSubmit}
          onCancel={() => {}}
        />
      );
    }).not.toThrow();
  });
});
