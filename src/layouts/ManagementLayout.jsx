import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { useMediaQuery } from '@mui/material';
import Sidebar from '../components/Sidebar';
import AdminSidebar from '../components/AdminSidebar';
import { useIsMobile } from '../hooks/responsiveQuery';


const ManagementLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const [adminActiveTab, setAdminActiveTab] = useState('managers');

  const isMobile = useIsMobile();
  const isAdmin = user?.role === 'admin';

  return (
    <div
      className={`h-screen w-screen overflow-hidden flex ${isAdmin && isMobile ? 'flex-col' : 'flex-row'} font-sans`}
      style={{ background: "var(--eco-page-bg)" }}
    >
      {/* Conditional Sidebar - AdminSidebar for admin, regular Sidebar for manager/user */}
      {isAdmin ? (
        <AdminSidebar activeTab={adminActiveTab} onTabChange={setAdminActiveTab} />
      ) : (
        <Sidebar />
      )}

      {/* Main area — transparent so page gradient shows through */}
      <main className="z-10 flex-1 min-h-0 overflow-auto bg-transparent">
        <div className="MainContentArea h-full min-h-0">
          <Outlet context={{ adminActiveTab, setAdminActiveTab }} />
        </div>
      </main>
    </div>
  );
};

export default ManagementLayout;
