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
    <div className={`h-screen w-screen overflow-hidden flex ${isAdmin && isMobile ? 'flex-col' : 'flex-row'} bg-[#F5F6FA] font-sans`}>
      {/* Conditional Sidebar - AdminSidebar for admin, regular Sidebar for manager/user */}
      {isAdmin ? (
        <AdminSidebar activeTab={adminActiveTab} onTabChange={setAdminActiveTab} />
      ) : (
        <Sidebar />
      )}

      {/* Main area */}
      <main className="z-10 flex-1 overflow-auto md:pr-6 bg-white">
        <div className="MainContentArea h-full">
          <Outlet context={{ adminActiveTab, setAdminActiveTab }} />
        </div>
      </main>
    </div>
  );
};

export default ManagementLayout;
