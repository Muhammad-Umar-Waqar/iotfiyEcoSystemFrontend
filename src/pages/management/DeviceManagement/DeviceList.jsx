// src/pages/management/DeviceManagement/DeviceList.jsx
import { useEffect, useState } from "react";
import { Pencil, Trash, Menu } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDevicesByVenue, deleteDevice } from "../../../slices/DeviceSlice";
import { fetchOrganizationsByOwner, fetchOrganizationsByUser } from "../../../slices/OrganizationSlice";
import { fetchVenuesByOrganization } from "../../../slices/VenueSlice";
import { canManage } from "../../../utils/permissions";
import { useDeviceManagement } from "../../../contexts/DeviceManagementContext";
import Swal from "sweetalert2";
import EditDeviceModal from "../../../components/Modals/DeviceManagement/EditDeviceModal";
import "../../../styles/pages/management-pages.css";
import { Drawer, IconButton, useMediaQuery, Chip, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import TableSkeleton from "../../../components/skeletons/TableSkeleton";
import TruncatedText from "../../../components/TruncatedText";

const DEVICE_TYPE_LABEL = {
  OD: "Odour Device",
  THD: "Temperature/Humidity",
  AQID: "Air Quality",
  GLD: "Gas Leakage",
  ED: "Energy Device",
};

const DEVICE_TYPE_COLOR = {
  OD: "warning",
  THD: "primary",
  AQID: "success",
  GLD: "error",
  ED: "secondary",
};

const CATEGORY_LABEL = {
  monitoring: "Monitoring",
  scheduling: "Scheduling",
  trigger: "Trigger",
};

const DeviceList = ({ onDeviceSelect, selectedDevice }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { Organizations = [], isLoading: orgsLoading } = useSelector((state) => state.Organization || {});
  const { venuesByOrg = {}, loading: venueLoading } = useSelector((state) => state.Venue || {});
  const { devicesByVenue = {}, isLoading: devicesLoading, error } = useSelector((state) => state.Device || {});

  // Get context to share selectedVenueId with AddDevice
  const { setSelectedVenueIdFromDeviceFilter } = useDeviceManagement();

  const hasManagePermission = canManage(user);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const isDesktop = useMediaQuery("(min-width:768px)");
  const isMobile = !isDesktop;

  const isManager = user?.role === "manager";

  // Filter states
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState(null);

  // Fetch organizations on mount based on user role
  useEffect(() => {
    if (!user?.id) return;

    if (user.role === "manager") {
      dispatch(fetchOrganizationsByOwner(user.id));
    } else if (user.role === "user") {
      dispatch(fetchOrganizationsByUser());
    }
  }, [dispatch, user]);

  // Auto-select first organization when organizations load
  useEffect(() => {
    if (Organizations.length > 0 && !selectedOrganization) {
      const firstOrg = Organizations[0];
      const orgId = firstOrg._id || firstOrg.id;
      setSelectedOrganization(orgId);
    }
  }, [Organizations, selectedOrganization]);

  // Fetch venues when organization is selected
  useEffect(() => {
    if (selectedOrganization) {
      if (isManager) {
        // Only managers fetch venues from API
        dispatch(fetchVenuesByOrganization(selectedOrganization));
      }
      // Users use their assigned venues from user.venues
      setSelectedVenue(""); // Reset venue when org changes
    }
  }, [dispatch, selectedOrganization, isManager]);

  // Get available venues based on role
  const availableVenues = (() => {
    if (!selectedOrganization) return [];

    if (isManager) {
      // Manager: Use venues from API
      return venuesByOrg[selectedOrganization] || [];
    } else {
      // User: Filter assigned venues by organization
      const userVenues = user?.venues || [];
      return userVenues
        .filter((v) => v.organization?.id === selectedOrganization)
        .map((v) => ({
          _id: v.venueId,
          id: v.venueId,
          name: v.venueName,
          organization: selectedOrganization,
        }));
    }
  })();

  // Auto-select first venue when venues load for selected org
  useEffect(() => {
    if (selectedOrganization && availableVenues.length > 0 && !selectedVenue) {
      const firstVenue = availableVenues[0];
      const venueId = firstVenue._id || firstVenue.id;
      setSelectedVenue(venueId);
    }
  }, [selectedOrganization, availableVenues, selectedVenue]);

  // Fetch devices when venue is selected
  useEffect(() => {
    if (selectedVenue) {
      dispatch(fetchDevicesByVenue(selectedVenue));
      // Update context with selected venue ID from filter
      setSelectedVenueIdFromDeviceFilter(selectedVenue);
    }
  }, [dispatch, selectedVenue, setSelectedVenueIdFromDeviceFilter]);

  useEffect(() => {
    if (error) {
      console.error("Device error:", error);
    }
  }, [error]);

  const handleOrganizationChange = (e) => {
    setSelectedOrganization(e.target.value);
  };

  const handleVenueChange = (e) => {
    setSelectedVenue(e.target.value);
  };

  const handleRowClick = (device, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    onDeviceSelect?.(device);
    if (isMobile) setDrawerOpen(false);
  };

  const handleEdit = (device, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!hasManagePermission) return;

    // Open edit modal with device._id (not deviceId)
    setEditingDeviceId(device._id);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditingDeviceId(null);
  };

  const handleDelete = async (device, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!hasManagePermission) return;

    const result = await Swal.fire({
      title: `Delete "${device.deviceName}"?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setWorking(true);
      await dispatch(deleteDevice(device._id)).unwrap();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Device has been deleted.",
        timer: 1500,
        showConfirmButton: false,
      });

      // Refresh device list for current venue - ensure selectedVenue is available
      if (selectedVenue) {
        await dispatch(fetchDevicesByVenue(selectedVenue));
      }

      if (isMobile) setDrawerOpen(false);
    } catch (err) {
      console.error("Delete device error:", err);
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: err?.message || String(err) || "Failed to delete device",
      });
    } finally {
      setWorking(false);
    }
  };

  // Get devices for selected venue
  const displayDevices = selectedVenue ? (devicesByVenue[selectedVenue] || []) : [];

  const renderListMarkup = () => (
    <div className="bg-white rounded-xl shadow-sm w-full border border-[#E5E7EB] p-5 flex flex-col">
      {isDesktop ? (
        <h1 className="organization-list-title font-semibold text-gray-800 mb-4">
          Device Management
        </h1>
      ) : (
        <div className="flex justify-end">
          <IconButton onClick={() => setDrawerOpen(false)} edge="start" aria-label="close-details" size="small">
            <CloseIcon />
          </IconButton>
        </div>
      )}

      <div className="mb-4 flex items-center gap-4 justify-between">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="org-filter-label">Organization</InputLabel>
          <Select
            labelId="org-filter-label"
            value={selectedOrganization}
            label="Organization"
            onChange={handleOrganizationChange}
            disabled={orgsLoading || Organizations.length === 0}
          >
            {orgsLoading ? (
              <MenuItem disabled>Loading organizations...</MenuItem>
            ) : Organizations.length === 0 ? (
              <MenuItem disabled>No organizations found</MenuItem>
            ) : (
              Organizations.map((org) => {
                const orgId = org._id || org.id;
                return (
                  <MenuItem key={orgId} value={orgId}>
                    {org.name || orgId}
                  </MenuItem>
                );
              })
            )}
          </Select>
        </FormControl>

        {selectedOrganization && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="venue-filter-label">Venue</InputLabel>
            <Select
              labelId="venue-filter-label"
              value={selectedVenue}
              label="Venue"
              onChange={handleVenueChange}
              disabled={venueLoading || availableVenues.length === 0}
            >
              {venueLoading ? (
                <MenuItem disabled>Loading venues...</MenuItem>
              ) : availableVenues.length === 0 ? (
                <MenuItem disabled>No venues found</MenuItem>
              ) : (
                availableVenues.map((venue) => {
                  const venueId = venue._id || venue.id;
                  return (
                    <MenuItem key={venueId} value={venueId}>
                      {venue.name || venueId}
                    </MenuItem>
                  );
                })
              )}
            </Select>
          </FormControl>
        )}
      </div>

      <div className="mb-4">
        <h2 className="organization-list-header text-center font-semibold text-gray-800">
          Device List
        </h2>
      </div>

      <div className="organization-table-scroll overflow-y-auto flex-1 min-h-0 pr-1">
        <table className="w-full table-auto text-left">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="bg-gray-100">
              <th className="text-lg py-5 px-4 font-bold text-gray-800">
                Device Name
              </th>
              <th className="text-lg py-5 px-4 text-center">
                Type
              </th>
              <th className="text-lg py-5 px-4 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {devicesLoading && <TableSkeleton rows={5} />}

            {!devicesLoading && !selectedVenue && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  Please select an organization and venue to view devices.
                </td>
              </tr>
            )}

            {!devicesLoading && selectedVenue && displayDevices.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  No devices found for this venue. Add one to get started.
                </td>
              </tr>
            )}

            {!devicesLoading && displayDevices.map((device, index) => {
              const id = device._id || index;
              const deviceName = device.deviceName || `Device ${index + 1}`;
              const deviceType = device.deviceType || "THD";
              const category = device.category || "monitoring";

              return (
                <tr
                  key={id}
                  className={`border-b border-gray-200 cursor-pointer transition-colors hover:bg-blue-50/60 ${
                    selectedDevice?._id === id ? "bg-blue-50 border-blue-300" : ""
                  }`}
                  onClick={(e) => handleRowClick(device, e)}
                >
                  <td className="organization-table-cell py-2 sm:py-3 px-2 sm:px-4">
                    <TruncatedText
                      text={deviceName}
                      className="font-normal text-gray-900"
                      maxLines={1}
                      tooltipPlacement="top"
                    />
                  </td>
                  <td className="organization-table-cell py-2 sm:py-3 px-2 sm:px-4 text-center">
                    <div className="flex flex-col gap-1 items-center">
                      <Chip
                        label={DEVICE_TYPE_LABEL[deviceType] || deviceType}
                        size="small"
                        color={DEVICE_TYPE_COLOR[deviceType] || "default"}
                      />
                      <span className="text-xs text-gray-500">{CATEGORY_LABEL[category]}</span>
                    </div>
                  </td>
                  <td className="organization-table-cell py-2 sm:py-3 px-2 sm:px-4">
                    <div className="flex justify-center gap-2 sm:gap-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleEdit(device, e)}
                        disabled={!hasManagePermission || working}
                        className={`organization-action-btn rounded-full border border-green-500/50 bg-white flex items-center justify-center hover:bg-green-50 p-[4px] ${
                          !hasManagePermission || working ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        }`}
                        title="Edit device"
                      >
                        <Pencil className="text-green-600 organization-action-icon" size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(device, e)}
                        disabled={!hasManagePermission || working}
                        className={`organization-action-btn rounded-full border border-red-500/50 bg-white flex items-center justify-center hover:bg-red-50 p-[4px] ${
                          !hasManagePermission || working ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        }`}
                        title="Delete device"
                      >
                        <Trash className="text-red-600 organization-action-icon" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      {isDesktop ? (
        renderListMarkup()
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <img src="/logo-half.png" className="w-auto h-[30px]" alt="Logo" />
            <h1 className="organization-list-title font-semibold text-gray-800">Device Management</h1>
            <div>
              <IconButton aria-label="Open devices" size="small" onClick={() => setDrawerOpen(true)}>
                <Menu size={20} />
              </IconButton>
            </div>
          </div>

          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{ style: { width: "100%" } }}
          >
            {renderListMarkup()}
          </Drawer>
        </>
      )}

      {/* Edit Device Modal */}
      {editModalOpen && (
        <EditDeviceModal
          open={editModalOpen}
          onClose={handleEditModalClose}
          deviceId={editingDeviceId}
          currentVenueId={selectedVenue}
        />
      )}
    </>
  );
};

export default DeviceList;
