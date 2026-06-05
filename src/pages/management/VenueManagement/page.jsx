import { useState } from 'react';
import VenueList from './VenueList';
import AddVenue from './AddVenue';
import "../../../styles/pages/management-pages.css"

const VenueManagement = () => {
  const [selectedVenue, setSelectedVenue] = useState(null);

  const handleVenueSelect = (venue) => {
    setSelectedVenue(venue);
  };

  const handleOutsideClick = () => {
    setSelectedVenue(null);
  };

  return (
    <div className="MobileBackgroundChange venue-management-container md:h-full bg-white rounded-[20px] w-full h-full" onClick={handleOutsideClick}>
      <div className="md:p-none p-[1rem] shadow-md flex flex-col lg:flex-row gap-2 lg:gap-0 h-full w-full rounded-[20px]">
        <VenueList className="ListPage venue-list-section"
          onVenueSelect={handleVenueSelect}
          selectedVenue={selectedVenue}
        />
        <div className="hidden lg:block w-px bg-[#E5E7EB]"></div>
        <AddVenue className="AddPage venue-add-section" />
      </div>
    </div>
  );
};

export default VenueManagement;
