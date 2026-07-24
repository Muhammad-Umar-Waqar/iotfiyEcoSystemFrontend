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
        className="md:h-full flex eco-mgmt-shell rounded-[20px] w-full h-auto min-h-full md:min-h-0 overflow-visible md:overflow-hidden"
        onClick={handleOutsideClick}
      >
        <div className="md:p-none p-[1rem] flex flex-col md:flex-row gap-2 md:gap-4 h-full w-full rounded-[20px] min-h-0">
          <DeviceList
            className="ListPage device-list-section"
            onDeviceSelect={handleDeviceSelect}
            selectedDevice={selectedDevice}
          />
          {/* <div className="hidden md:block eco-mgmt-divider"></div> */}
          <AddDevice className="AddPage device-add-section" />
        </div>
      </div>
    </DeviceManagementProvider>
  );
};

export default DeviceManagement;
