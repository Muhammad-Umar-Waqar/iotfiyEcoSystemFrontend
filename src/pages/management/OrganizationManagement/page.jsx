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
    <div
      className="MobileBackgroundChange organization-management-container md:h-full flex bg-white rounded-[20px] w-full h-full"
      onClick={handleOutsideClick}
    >
      <div className="md:p-none p-[1rem] shadow-md flex flex-col lg:flex-row gap-2 lg:gap-0 h-full w-full rounded-[20px]  ">
        <OrganizationList className="ListPage organization-list-section"
          onOrganizationSelect={handleOrganizationSelect}
          selectedOrganization={selectedOrganization}
        />
        {/* Center Divider */}
        <div className="hidden lg:block  bg-[#E5E7EB]"></div>

        <AddOrganization className="AddPage organization-add-section" />

      </div>
    </div>
  );
};

export default OrganizationManagement;
