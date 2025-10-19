export const storageService = {
  // Token methods
  getToken: () => {
    const token = localStorage.getItem('token');
    console.log('[Storage] Get token:', token ? 'Found' : 'Not found');
    return token;
  },
  setToken: (token) => {
    console.log('[Storage] Set token:', token ? 'Setting token' : 'Empty token');
    localStorage.setItem('token', token);
  },
  removeToken: () => {
    console.log('[Storage] Remove token');
    localStorage.removeItem('token');
  },
  
  // Refresh token methods
  getRefreshToken: () => {
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('[Storage] Get refresh token:', refreshToken ? 'Found' : 'Not found');
    return refreshToken;
  },
  setRefreshToken: (token) => {
    console.log('[Storage] Set refresh token:', token ? 'Setting' : 'Empty');
    localStorage.setItem('refreshToken', token);
  },
  removeRefreshToken: () => {
    console.log('[Storage] Remove refresh token');
    localStorage.removeItem('refreshToken');
  },
  
  // User methods
  getUser: () => {
    const user = localStorage.getItem('user');
    const parsed = user ? JSON.parse(user) : null;
    console.log('[Storage] Get user:', parsed?.username || 'Not found');
    return parsed;
  },
  setUser: (user) => {
    console.log('[Storage] Set user:', user?.username);
    localStorage.setItem('user', JSON.stringify(user));
  },
  removeUser: () => {
    console.log('[Storage] Remove user');
    localStorage.removeItem('user');
  },
  
  // Clear all data
  clear: () => {
    console.log('[Storage] Clearing all data');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    console.log('[Storage] ✓ All data cleared');
  }
};