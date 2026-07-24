import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
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
      {isAdmin ? (
        <AdminSidebar activeTab={adminActiveTab} onTabChange={setAdminActiveTab} />
      ) : (
        <Sidebar />
      )}

      {/* Mobile: scroll Add forms when tall; scrollbar hidden. Desktop: lock to viewport. */}
      <main className="z-10 flex-1 min-h-0 overflow-hidden bg-transparent p-2 pb-[4.5rem] md:pb-2">
        <div className="MainContentArea eco-mgmt-page-scroll h-full min-h-0 overflow-y-auto md:overflow-hidden">
          <Outlet context={{ adminActiveTab, setAdminActiveTab }} />
        </div>
      </main>
    </div>
  );
};

export default ManagementLayout;
