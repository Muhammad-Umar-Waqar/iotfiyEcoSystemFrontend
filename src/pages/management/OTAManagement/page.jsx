// import React, { useState } from 'react'
// import OTADeviceList from './OTADeviceList'
// import OTAFileUpload from './OTAFileUpload'
// import "../../../styles/pages/management-pages.css"

// const OTAManagement = () => {
//   const [selectedVersion, setSelectedVersion] = useState(null);
//   const [refreshTrigger, setRefreshTrigger] = useState(0);

//   const handleVersionSelect = (version) => {
//     setSelectedVersion(version);
//   };

//   const handleOutsideClick = () => {
//     setSelectedVersion(null);
//   };


//   // Function to trigger refresh of device list
//   const refreshDevices = () => {
//     setRefreshTrigger(prev => prev + 1);
//   };

//   return (
//     // <div className="MobileBackgroundChange brand-management-container md:h-full bg-white rounded-[20px] w-full h-full" onClick={handleOutsideClick}>
//     <div className="MobileBackgroundChange  md:h-full bg-white rounded-[20px] w-full h-full" onClick={handleOutsideClick}>
//       {/* <div className="md:p-none p-[1rem] shadow-md flex flex-col md:flex-row gap-2 lg:gap-0 h-full w-full rounded-[20px]"> */}
//       <div className="md:p-none p-[1rem]  flex flex-col md:flex-row gap-2 lg:gap-0 h-full w-full rounded-[20px]">
        
//         <OTADeviceList className="ListPage brand-list-section" 
//           key={refreshTrigger}
//           selectedVersion={selectedVersion}
//           onVersionSelect={handleVersionSelect}
//           />
          
         
//         <OTAFileUpload className="AddPage brand-add-section" onUploadSuccess={refreshDevices} />
      
//         <div className="hidden lg:block w-px bg-[#E5E7EB]"></div>
//       </div>
//     </div>
//   )
// }

// export default OTAManagement





// src/components/ota/OTAManagement.jsx
// UI RESKIN ONLY — all state and handler logic is untouched.
import React, { useState } from "react";
import OTADeviceList from "./OTADeviceList";
import OTAFileUpload from "./OTAFileUpload";

const OTAManagement = () => {
  // ── ALL STATE & HANDLERS — completely unchanged ──────────
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [refreshTrigger, setRefreshTrigger]   = useState(0);

  const handleVersionSelect  = (version) => setSelectedVersion(version);
  const handleOutsideClick   = () => setSelectedVersion(null);
  const refreshDevices       = () => setRefreshTrigger((prev) => prev + 1);

  // ══════════════════════════════════════════════════════════
  // RESKINNED MARKUP
  // Replaces the old brand-management-container / brand-list-section
  // classes with the same white-surface + indigo-accent system
  // used in AdminDashboard and PlanManagement.
  // ══════════════════════════════════════════════════════════
  return (
    <div
      className="w-full h-full bg-slate-50 rounded-[20px] md:h-full"
      onClick={handleOutsideClick}
    >
      {/*
        Two-column split on md+:
          Left  → OTADeviceList (device picker, version selector, start button)
          Right → OTAFileUpload (firmware upload form)
        Stacked on mobile (existing MUI Drawer handles mobile nav for DeviceList)
      */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-0 h-full p-4 md:p-0 rounded-[20px]">
        <div className="md:flex-1 md:min-w-0 h-full">
          <OTADeviceList
            key={refreshTrigger}
            selectedVersion={selectedVersion}
            onVersionSelect={handleVersionSelect}
          />
        </div>

        {/* Vertical divider — desktop only */}
        <div className="hidden md:block w-px bg-slate-200 flex-shrink-0" />

        <div className="md:flex-1 md:min-w-0 h-full">
          <OTAFileUpload onUploadSuccess={refreshDevices} />
        </div>
      </div>
    </div>
  );
};

export default OTAManagement;