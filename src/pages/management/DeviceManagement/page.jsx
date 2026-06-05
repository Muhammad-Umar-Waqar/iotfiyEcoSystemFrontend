import { useState } from 'react';
import AddDevice from './AddDevice';
import DeviceList from './DeviceList';
import { DeviceManagementProvider } from '../../../contexts/DeviceManagementContext';
import "../../../styles/pages/management-pages.css";

const DeviceManagement = () => {
  const [selectedDevice, setSelectedDevice] = useState(null);

  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);
  };

  const handleOutsideClick = () => {
    setSelectedDevice(null);
  };

  return (
    <DeviceManagementProvider>
      <div
        className="MobileBackgroundChange device-management-container md:h-full flex bg-white rounded-[20px] w-full h-full"
        onClick={handleOutsideClick}
      >
        <div className="shadow-md md:p-none p-[1rem]  flex flex-col lg:flex-row gap-2 lg:gap-0 h-full w-full rounded-[20px]">
          <DeviceList className="ListPage device-list-section"
            onDeviceSelect={handleDeviceSelect}
            selectedDevice={selectedDevice}
          />
          <div className="hidden lg:block w-px bg-[#E5E7EB]"></div>
          <AddDevice className="AddPage device-add-section" />
        </div>
      </div>
    </DeviceManagementProvider>
  );
};

export default DeviceManagement;

