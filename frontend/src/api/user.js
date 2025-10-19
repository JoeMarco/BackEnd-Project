import api from '../services/api';

/**
 * User Management Service
 * API service for user CRUD operations (admin only)
 */

export const userService = {
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
  getUsers: (params = {}) => api.get('/users', { params }),

  /**
   * Get single user by ID
   * @param {number} id - User ID
   * @returns {Promise} Response with user object
   */
  getUserById: (id) => api.get(`/users/${id}`),

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
  createUser: (data) => api.post('/users', data),

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
  updateUser: (id, data) => api.put(`/users/${id}`, data),

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise} Response with success message
   */
  deleteUser: (id) => api.delete(`/users/${id}`),

  /**
   * Get user statistics (role distribution)
   * @returns {Promise} Response with stats object
   */
  getUserStats: () => api.get('/users/stats')
};

export default userService;
