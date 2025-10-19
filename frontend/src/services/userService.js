import api from './api';

/**
 * User Management Service
 * API service for user CRUD operations (admin only)
 */

/**
 * Get paginated list of users with search and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search term for username/full_name
 * @param {string} params.role - Filter by role (admin/staff/viewer)
 * @param {boolean} params.is_active - Filter by active status
 * @returns {Promise} Response with users array and pagination info
 */
export const getUsers = async (params = {}) => {
  try {
    const response = await api.get('/users', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Get single user by ID
 * @param {number} id - User ID
 * @returns {Promise} Response with user object
 */
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * Create new user
 * @param {Object} userData - User data
 * @param {string} userData.username - Username (required, unique)
 * @param {string} userData.password - Password (required, min 6 chars)
 * @param {string} userData.full_name - Full name (required)
 * @param {string} userData.role - Role: admin/staff/viewer (required)
 * @param {string} userData.email - Email (optional)
 * @param {boolean} userData.is_active - Active status (default: true)
 * @returns {Promise} Response with created user
 */
export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update existing user
 * @param {number} id - User ID
 * @param {Object} userData - Updated user data
 * @param {string} userData.username - Username (unique)
 * @param {string} userData.password - New password (optional, min 6 chars)
 * @param {string} userData.full_name - Full name
 * @param {string} userData.role - Role: admin/staff/viewer
 * @param {string} userData.email - Email
 * @param {boolean} userData.is_active - Active status
 * @returns {Promise} Response with updated user
 */
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Delete user
 * @param {number} id - User ID
 * @returns {Promise} Response with success message
 */
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * Get user statistics (role distribution)
 * @returns {Promise} Response with stats object
 */
export const getUserStats = async () => {
  try {
    const response = await api.get('/users/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats
};
