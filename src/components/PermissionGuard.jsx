import React from 'react';
import { useSelector } from 'react-redux';
import { canManage, canOnlyView } from '../utils/permissions';
import { Alert, AlertTitle } from '@mui/material';

/**
 * PermissionGuard - Wraps forms and disables inputs for view-only users
 *
 * Usage:
 * <PermissionGuard>
 *   <form>...</form>
 * </PermissionGuard>
 */
const PermissionGuard = ({ children, showAlert = true }) => {
  const { user } = useSelector((state) => state.auth);
  const isViewOnly = canOnlyView(user);
  const hasManagePermission = canManage(user);

  if (!user) {
    return null;
  }

  // If user can manage, render children normally
  if (hasManagePermission) {
    return <>{children}</>;
  }

  // If user can only view, disable all form inputs
  if (isViewOnly) {
    return (
      <div className="permission-guard-wrapper">
        {showAlert && (
          <Alert severity="info" className="mb-4">
            <AlertTitle>View Only Mode</AlertTitle>
            You have view-only access. Forms and actions are disabled.
          </Alert>
        )}
        <div
          style={{
            pointerEvents: 'none',
            opacity: 0.6,
            userSelect: 'none',
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  // Default: no permission
  return (
    <Alert severity="warning">
      <AlertTitle>Access Denied</AlertTitle>
      You do not have permission to access this content.
    </Alert>
  );
};

export default PermissionGuard;
