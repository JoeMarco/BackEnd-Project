import React, { createContext, useState, useContext, useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

const ThemeContext = createContext(undefined);

export const themes = {
  light: {
    name: 'Light',
    token: {
      colorPrimary: '#1890ff',
      colorBgContainer: '#ffffff',
      colorBgLayout: '#f0f2f5',
      colorText: '#000000',
      colorTextSecondary: '#8c8c8c',
      colorBorder: '#d9d9d9',
    },
    algorithm: antdTheme.defaultAlgorithm,
    customColors: {
      headerBg: '#ffffff',
      siderBg: '#001529',
      siderText: '#ffffff',
      cardBg: '#ffffff',
      tableBg: '#ffffff',
      tableHeaderBg: '#fafafa',
      tableRowHoverBg: '#e6f7ff',
      menuSelectedBg: 'rgba(24, 144, 255, 0.2)',
      menuActiveBg: 'rgba(24, 144, 255, 0.15)',
      menuHoverBg: 'rgba(255, 255, 255, 0.08)',
      shadow: '0 2px 8px rgba(0,0,0,0.06)',
    }
  },
  darkNavy: {
    name: 'Dark Navy',
    token: {
      colorPrimary: '#1890ff',
      colorBgContainer: '#1e1e1e',
      colorBgLayout: '#252526',
      colorText: '#cccccc',
      colorTextSecondary: '#858585',
      colorBorder: '#3e3e42',
    },
    algorithm: antdTheme.darkAlgorithm,
    customColors: {
      headerBg: '#1e1e1e',
      siderBg: '#252526',
      siderText: '#cccccc',
      cardBg: '#1e1e1e',
      tableBg: '#1e1e1e',
      tableHeaderBg: '#2d2d30',
      tableRowHoverBg: '#2a2d2e',
      menuSelectedBg: 'rgba(24, 144, 255, 0.3)',
      menuActiveBg: 'rgba(24, 144, 255, 0.2)',
      menuHoverBg: 'rgba(255, 255, 255, 0.05)',
      shadow: '0 2px 8px rgba(0,0,0,0.3)',
    }
  },
  beige: {
    name: 'Beige',
    token: {
      colorPrimary: '#8b7355',
      colorBgContainer: '#faf8f3',
      colorBgLayout: '#f5f1e8',
      colorText: '#3e2723',
      colorTextSecondary: '#795548',
      colorBorder: '#d7ccc8',
    },
    algorithm: antdTheme.defaultAlgorithm,
    customColors: {
      headerBg: '#faf8f3',
      siderBg: '#8b7355',
      siderText: '#ffffff',
      cardBg: '#faf8f3',
      tableBg: '#ffffff',
      tableHeaderBg: '#f5f1e8',
      tableRowHoverBg: '#f0ebe0',
      menuSelectedBg: 'rgba(255, 255, 255, 0.25)',
      menuActiveBg: 'rgba(255, 255, 255, 0.2)',
      menuHoverBg: 'rgba(255, 255, 255, 0.1)',
      shadow: '0 2px 8px rgba(139,115,85,0.1)',
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved && themes[saved]) ? saved : 'light';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', currentTheme);
    
    // Update body background
    const theme = themes[currentTheme];
    if (theme && theme.token) {
      document.body.style.backgroundColor = theme.token.colorBgLayout;
    }
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const themeConfig = themes[currentTheme] || themes.light;

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      changeTheme, 
      themeConfig,
      themes 
    }}>
      <ConfigProvider
        theme={{
          token: themeConfig?.token || themes.light.token,
          algorithm: themeConfig?.algorithm || themes.light.algorithm,
          components: {
            Table: {
              headerBg: themeConfig?.customColors?.tableHeaderBg || '#fafafa',
              headerColor: themeConfig?.token?.colorText || '#000000',
              rowHoverBg: themeConfig?.customColors?.tableRowHoverBg || '#e6f7ff',
              borderColor: themeConfig?.token?.colorBorder || '#f0f0f0',
              bodySortBg: themeConfig?.customColors?.tableBg || '#ffffff',
              headerSortActiveBg: themeConfig?.customColors?.tableHeaderBg || '#fafafa',
            },
            Card: {
              colorBgContainer: themeConfig?.customColors?.cardBg || '#ffffff',
            },
            Menu: {
              itemBg: themeConfig?.customColors?.siderBg || '#001529',
              itemSelectedBg: themeConfig?.customColors?.menuSelectedBg || 'rgba(255, 255, 255, 0.1)',
              itemActiveBg: themeConfig?.customColors?.menuActiveBg || 'rgba(255, 255, 255, 0.15)',
              itemHoverBg: themeConfig?.customColors?.menuHoverBg || 'rgba(255, 255, 255, 0.08)',
              itemColor: themeConfig?.customColors?.siderText || '#ffffff',
              itemSelectedColor: themeConfig?.customColors?.siderText || '#ffffff',
              itemHoverColor: themeConfig?.customColors?.siderText || '#ffffff',
              subMenuItemBg: themeConfig?.customColors?.siderBg || '#001529',
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  
  // Ensure themeConfig has all required properties
  const safeThemeConfig = {
    ...context.themeConfig,
    token: context.themeConfig?.token || themes.light.token,
    algorithm: context.themeConfig?.algorithm || themes.light.algorithm,
    customColors: context.themeConfig?.customColors || themes.light.customColors
  };
  
  return {
    ...context,
    themeConfig: safeThemeConfig
  };
};

export default ThemeProvider;
