import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const ManagementLayout = () => {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-row bg-[#F5F6FA] font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <main className="z-10 flex-1 overflow-auto md:pr-6 bg-white">
        <div className="MainContentArea h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ManagementLayout;
