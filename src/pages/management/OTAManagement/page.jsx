import React, { useState } from 'react'
import OTADeviceList from './OTADeviceList'
import OTAFileUpload from './OTAFileUpload'
import "../../../styles/pages/management-pages.css"

const OTAManagement = () => {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleVersionSelect = (version) => {
    setSelectedVersion(version);
  };

  const handleOutsideClick = () => {
    setSelectedVersion(null);
  };


  // Function to trigger refresh of device list
  const refreshDevices = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    // <div className="MobileBackgroundChange brand-management-container md:h-full bg-white rounded-[20px] w-full h-full" onClick={handleOutsideClick}>
    <div className="MobileBackgroundChange  md:h-full bg-white rounded-[20px] w-full h-full" onClick={handleOutsideClick}>
      {/* <div className="md:p-none p-[1rem] shadow-md flex flex-col md:flex-row gap-2 lg:gap-0 h-full w-full rounded-[20px]"> */}
      <div className="md:p-none p-[1rem]  flex flex-col md:flex-row gap-2 lg:gap-0 h-full w-full rounded-[20px]">
        
        <OTADeviceList className="ListPage brand-list-section" 
          key={refreshTrigger}
          selectedVersion={selectedVersion}
          onVersionSelect={handleVersionSelect}
          />
          
         
        <OTAFileUpload className="AddPage brand-add-section" onUploadSuccess={refreshDevices} />
      
        <div className="hidden lg:block w-px bg-[#E5E7EB]"></div>
      </div>
    </div>
  )
}

export default OTAManagement




