# Theme System - Factory Inventory System

## Overview
Sistem tema dengan 3 pilihan: Light, Dark Navy, dan Beige.

## Tema yang Tersedia

### 1. Light Theme (Default)
- Background: Putih bersih (#ffffff, #f0f2f5)
- Primary: Biru (#1890ff)
- Sidebar: Gelap (#001529)
- Text: Hitam (#000000)

### 2. Dark Navy Theme (VS Code Style)
- Background: Gelap (#1e1e1e, #252526)
- Primary: Biru (#1890ff)
- Sidebar: Abu gelap (#252526)
- Text: Abu terang (#cccccc)

### 3. Beige Theme (Warm)
- Background: Krem (#faf8f3, #f5f1e8)
- Primary: Coklat (#8b7355)
- Sidebar: Coklat (#8b7355)
- Text: Coklat gelap (#3e2723)

## File Structure
```
frontend/src/
├── context/
│   └── ThemeContext.jsx    # Theme provider & configuration
├── hooks/
│   └── useTheme.js         # Theme hook export
└── components/
    └── common/
        ├── Header.jsx      # Theme selector in settings
        ├── Sidebar.jsx     # Dynamic sidebar colors
        └── Layout.jsx      # Dynamic layout colors
```

## Cara Menggunakan

### Mengubah Tema
1. Klik dropdown user (kanan atas)
2. Pilih "Pengaturan"
3. Pilih tema:
   - 🌞 Light
   - 🌙 Dark Navy
   - 🍂 Beige

### Menggunakan di Komponen
```javascript
import { useTheme } from '../../hooks/useTheme';

function MyComponent() {
  const { currentTheme, changeTheme, themeConfig } = useTheme();
  
  return (
    <div style={{ 
      background: themeConfig?.customColors?.cardBg || '#ffffff',
      color: themeConfig?.token?.colorText || '#000000'
    }}>
      Current theme: {currentTheme}
    </div>
  );
}
```

## Theme Config Properties

### token (Ant Design tokens)
- colorPrimary: Primary color
- colorBgContainer: Container background
- colorBgLayout: Layout background
- colorText: Main text color
- colorTextSecondary: Secondary text color
- colorBorder: Border color

### customColors (Custom properties)
- headerBg: Header background
- siderBg: Sidebar background
- siderText: Sidebar text color
- cardBg: Card background
- tableBg: Table background
- shadow: Box shadow

## Features
✅ Persisten (localStorage)
✅ Real-time switching
✅ Global theming via ConfigProvider
✅ Safe fallback values
✅ Optional chaining for safety

## Troubleshooting

### Error: Cannot read properties of undefined
Pastikan:
1. ThemeProvider membungkus App
2. useTheme hanya digunakan dalam ThemeProvider
3. Semua akses themeConfig menggunakan optional chaining (?.)
4. Ada fallback values untuk setiap property

### Tema tidak tersimpan
Cek:
1. localStorage tidak diblokir browser
2. Key 'app-theme' ada di localStorage
3. Value adalah 'light', 'darkNavy', atau 'beige'

## Update History
- 2025-10-19: Initial implementation
- 2025-10-19: Added safety checks and fallback values
