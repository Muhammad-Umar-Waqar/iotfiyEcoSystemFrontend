import { useState } from 'react';
import VenueList from './VenueList';
import AddVenue from './AddVenue';
import "../../../styles/pages/management-pages.css";

const VenueManagement = () => {
  const [selectedVenue, setSelectedVenue] = useState(null);

  const handleVenueSelect = (venue) => {
    setSelectedVenue(venue);
  };

  const handleOutsideClick = () => {
    setSelectedVenue(null);
  };

  return (
    <div
      className="md:h-full flex eco-mgmt-shell rounded-[20px] w-full h-auto min-h-full md:min-h-0 overflow-visible md:overflow-hidden"
      onClick={handleOutsideClick}
    >
      <div className="md:p-none p-[1rem] flex flex-col md:flex-row gap-2 md:gap-4 h-full w-full rounded-[20px] min-h-0">
        <VenueList
          className="ListPage venue-list-section"
          onVenueSelect={handleVenueSelect}
          selectedVenue={selectedVenue}
        />
        {/* <div className="hidden md:block eco-mgmt-divider"></div> */}
        <AddVenue className="AddPage venue-add-section" />
      </div>
    </div>
  );
};

export default VenueManagement;
