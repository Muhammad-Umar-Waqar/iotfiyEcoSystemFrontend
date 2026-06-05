import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './slices/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import ManagementLayout from './layouts/ManagementLayout';
import Login from './pages/auth/Login';
import VerifyOtp from './pages/auth/VerifyOtp';
import SelectPlan from './pages/auth/SelectPlan';
import SetupPassword from './pages/auth/SetupPassword';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import OrganizationManagement from './pages/management/OrganizationManagement/page';
import VenueManagement from './pages/management/VenueManagement/page';
import DeviceManagement from './pages/management/DeviceManagement/page';
import UserManagement from './pages/management/UserManagement/page';
import './styles/global/fonts.css';

// Session restoration component
function SessionRestoration({ children }) {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // If we have a token but no user, fetch the current user
    if (token && !isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [token, isAuthenticated, dispatch]);

  return children;
}

function App() {
  return (
    <SessionRestoration>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/verify-otp/:token" element={<VerifyOtp />} />
          <Route path="/select-plan" element={<SelectPlan />} />
          <Route path="/setup-password/:token" element={<SetupPassword />} />

            {/* Protected Routes - Management (Manager & User) */}
            <Route
              path="/management"
              element={
                <ProtectedRoute allowedRoles={['manager', 'user']}>
                  <ManagementLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<div className="p-8"><h1 className="text-2xl font-bold">Dashboard</h1></div>} />
              <Route path="organization" element={<OrganizationManagement />} />
              <Route path="venue" element={<VenueManagement />} />
              <Route path="device" element={<DeviceManagement />} />
              <Route path="users" element={<UserManagement />} />
            </Route>

            {/* Protected Routes - Admin */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Unauthorized */}
            <Route
              path="/unauthorized"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-600">Unauthorized</h1>
                    <p className="mt-4 text-gray-600">You don't have permission to access this page.</p>
                  </div>
                </div>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </SessionRestoration>
  );
}

export default App;
