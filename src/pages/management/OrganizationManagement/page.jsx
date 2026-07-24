import { useState } from 'react';
import AddOrganization from "./AddOrganization";
import OrganizationList from "./OrganizationList";
import "../../../styles/pages/management-pages.css"

const OrganizationManagement = () => {
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  const handleOrganizationSelect = (organization) => {
    setSelectedOrganization(organization);
  };

  const handleOutsideClick = () => {
    setSelectedOrganization(null);
  };

  return (



  //     <div
  //   className="flex flex-col md:flex-row w-full h-full min-h-0 bg-white rounded-[20px] shadow-md gap-3 lg:gap-0 p-3 sm:p-4 overflow-hidden"
  //   onClick={handleOutsideClick}
  // >
  //   <div className="w-full md:w-1/2 md:h-full min-h-0 min-w-0 overflow-hidden">
  //     <UserList onUserSelect={handleUserSelect} selectedUser={selectedUser} />
  //   </div>

  //   <div className="hidden lg:block w-px bg-[#E5E7EB] mx-3"></div>

  //   <div className="w-full md:w-1/2 md:h-full min-h-0 min-w-0 overflow-hidden">
  //     <AddUser selectedUser={selectedUser} />
  //   </div>
  // </div>


    // <div
    //   className="MobileBackgroundChange organization-management-container md:h-full flex bg-white rounded-[20px] w-full h-full"
    //   onClick={handleOutsideClick}
    // >
    //   <div className="md:p-none p-[1rem] shadow-md flex flex-col md:flex-row gap-2 lg:gap-0 h-full w-full rounded-[20px]  ">
    //     <OrganizationList className="ListPage organization-list-section"
    //       onOrganizationSelect={handleOrganizationSelect}
    //       selectedOrganization={selectedOrganization}
    //     />
    //     {/* Center Divider */}
    //     <div className="hidden lg:block  bg-[#E5E7EB]"></div>

    //     <AddOrganization className="AddPage organization-add-section" />

    //   </div>
    // </div>
    <div
      className="md:h-full flex eco-mgmt-shell rounded-[20px] w-full h-auto min-h-full md:min-h-0 overflow-visible md:overflow-hidden"
      onClick={handleOutsideClick}
    >
      <div className="md:p-none p-[1rem] flex flex-col md:flex-row gap-2 md:gap-4 h-full w-full rounded-[20px] min-h-0">
        <OrganizationList className="ListPage organization-list-section"
          onOrganizationSelect={handleOrganizationSelect}
          selectedOrganization={selectedOrganization}
        />
        {/* <div className="hidden md:block eco-mgmt-divider"></div> */}

        <AddOrganization className="AddPage organization-add-section" />

      </div>
    </div>
  );
};

export default OrganizationManagement;
