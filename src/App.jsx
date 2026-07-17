import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './slices/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import RoleHomeRedirect from './components/RoleHomeRedirect';
import ManagementLayout from './layouts/ManagementLayout';
import Login from './pages/auth/Login';
import VerifyOtp from './pages/auth/VerifyOtp';
import SelectPlan from './pages/auth/SelectPlan';
import SetupPassword from './pages/auth/SetupPassword';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard/page';
import OrganizationManagement from './pages/management/OrganizationManagement/page';
import VenueManagement from './pages/management/VenueManagement/page';
import DeviceManagement from './pages/management/DeviceManagement/page';
import UserManagement from './pages/management/UserManagement/page';
import SubscriptionAnalytics from './pages/management/SubscriptionAnalytics/page';
import Plans from './pages/admin/Plans';
import './styles/global/fonts.css';
import { OrgVenueProvider } from './contexts/OrgVenueContext';
import { SchedulerProvider } from "./contexts/SchedulerContext";
import { AcControlProvider } from "./contexts/AcControlContext";
import OTAManagement from './pages/management/OTAManagement/page';
import AdminDashboard from './pages/AdminDashboard/page';
import NotFound from './pages/NotFound';
import HomePage from './pages/home/Home';

// Session restoration component
function SessionRestoration({ children }) {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [token, dispatch]);


  return children;
}

function App() {
  return (
    <SessionRestoration>
       <OrgVenueProvider>
        <SchedulerProvider>
          <AcControlProvider>
      <Router>
        <Routes>
          {/* Guest-only routes (redirect to dashboard if already logged in) */}
          <Route path="/" element={<GuestRoute><HomePage /></GuestRoute>} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/verify-otp" element={<GuestRoute><VerifyOtp /></GuestRoute>} />
          <Route path="/verify-otp/:token" element={<GuestRoute><VerifyOtp /></GuestRoute>} />

          {/* Token flows — allow without session (email links) */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/setup-password/:token" element={<SetupPassword />} />

          {/* Plans — guests and logged-in managers can both access */}
          <Route path="/select-plan" element={<SelectPlan />} />

            {/* Protected Routes - Management (Manager & User) */}
            <Route
              path="/management"
              element={
                <ProtectedRoute allowedRoles={['manager', 'user']}>
                  <ManagementLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="organization" element={<OrganizationManagement />} />
              <Route path="venue" element={<VenueManagement />} />
              <Route path="device" element={<DeviceManagement />} />
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="subscription"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <SubscriptionAnalytics />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Protected Routes - Admin */}
            <Route
              path="/admin/management"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManagementLayout />
                </ProtectedRoute>
              }
            >

              {/* <Route index element={<Dashboard />} /> */}
              <Route index element={<AdminDashboard />} />
              <Route path="plans" element={<Plans />} />
              <Route path="ota" element={<OTAManagement />} />
            </Route>

            <Route path="/unauthorized" element={<RoleHomeRedirect />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
          </AcControlProvider>
          </SchedulerProvider>
      </OrgVenueProvider>
      </SessionRestoration>
  );
}

export default App;
