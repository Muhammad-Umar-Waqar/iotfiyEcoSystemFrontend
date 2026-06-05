// src/contexts/DeviceManagementContext.jsx
import { createContext, useContext, useState } from 'react';

const DeviceManagementContext = createContext();

export const useDeviceManagement = () => {
  const context = useContext(DeviceManagementContext);
  if (!context) {
    throw new Error('useDeviceManagement must be used within DeviceManagementProvider');
  }
  return context;
};

export const DeviceManagementProvider = ({ children }) => {
  // State to track the currently selected/filtered venue ID (venue._id) from DeviceList
  const [selectedVenueIdFromDeviceFilter, setSelectedVenueIdFromDeviceFilter] = useState("");

  return (
    <DeviceManagementContext.Provider
      value={{
        selectedVenueIdFromDeviceFilter,
        setSelectedVenueIdFromDeviceFilter
      }}
    >
      {children}
    </DeviceManagementContext.Provider>
  );
};
