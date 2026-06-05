/**
 * Permission utility functions for role-based access control
 */

/**
 * Check if user has manage permission
 * @param {Object} user - User object from auth state
 * @returns {boolean}
 */
export const canManage = (user) => {
  if (!user) return false;

  // Admin and Manager always have manage permission
  if (user.role === 'admin' || user.role === 'manager') {
    return true;
  }

  // Users need explicit manage permission
  if (user.role === 'user' && user.permission === 'manage') {
    return true;
  }

  return false;
};

/**
 * Check if user can only view (read-only)
 * @param {Object} user - User object from auth state
 * @returns {boolean}
 */
export const canOnlyView = (user) => {
  if (!user) return false;

  // Users with view permission are read-only
  if (user.role === 'user' && user.permission === 'view') {
    return true;
  }

  return false;
};

/**
 * Check if user is admin
 * @param {Object} user - User object from auth state
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return user?.role === 'admin';
};

/**
 * Check if user is manager
 * @param {Object} user - User object from auth state
 * @returns {boolean}
 */
export const isManager = (user) => {
  return user?.role === 'manager';
};

/**
 * Check if user is regular user
 * @param {Object} user - User object from auth state
 * @returns {boolean}
 */
export const isUser = (user) => {
  return user?.role === 'user';
};

/**
 * Get user permission level
 * @param {Object} user - User object from auth state
 * @returns {string} - 'admin', 'manager', 'manage', 'view', or 'none'
 */
export const getUserPermissionLevel = (user) => {
  if (!user) return 'none';

  if (user.role === 'admin') return 'admin';
  if (user.role === 'manager') return 'manager';
  if (user.role === 'user' && user.permission === 'manage') return 'manage';
  if (user.role === 'user' && user.permission === 'view') return 'view';

  return 'none';
};
