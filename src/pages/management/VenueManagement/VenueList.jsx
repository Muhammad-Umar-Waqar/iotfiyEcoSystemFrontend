// src/pages/management/VenueManagement/VenueList.jsx
import { useEffect, useState } from "react";
import { Pencil, Trash, Menu } from "lucide-react";
import Swal from "sweetalert2";
import { fetchAllVenues, updateVenue, deleteVenue, fetchVenuesByOrganization, fetchSingleVenue } from "../../../slices/VenueSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrganizationsByOwner, fetchOrganizationsByUser } from "../../../slices/OrganizationSlice";
import { canManage } from "../../../utils/permissions";
import SubscriptionUsageIndicator from "../../../components/SubscriptionUsageIndicator";
import "../../../styles/pages/management-pages.css";
import TableSkeleton from "../../../components/skeletons/TableSkeleton";
import {
  Drawer,
  IconButton,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const VenueList = ({ onVenueSelect, selectedVenue }) => {
  const dispatch = useDispatch();
  const { Venues = [], loading = false, error = null, venuesByOrg = {} } = useSelector((state) => state.Venue || {});
  const { Organizations = [], isLoading: orgsLoading } = useSelector((state) => state.Organization || {});
  const { user } = useSelector((state) => state.auth);
  const hasManagePermission = canManage(user);

  const [originalOrgId, setOriginalOrgId] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [venueName, setVenueName] = useState("");
  const [venueId, setVenueId] = useState(null);
  const [orgId, setOrgId] = useState("");
  const [orgFilter, setOrgFilter] = useState("");

  const isDesktop = useMediaQuery("(min-width:768px)");
  const isMobile = !isDesktop;

  // Check if user is manager or regular user
  const isManager = user?.role === "manager";

  useEffect(() => {
    const handler = () => {
      if (orgFilter && isManager) {
        // Only managers fetch from API
        dispatch(fetchVenuesByOrganization(orgFilter)).catch(() => {});
      }
    };
    window.addEventListener("venue:updated", handler);
    return () => window.removeEventListener("venue:updated", handler);
  }, [dispatch, orgFilter, isManager]);

  useEffect(() => {
    // Fetch organizations based on role
    if (!user?.id) return;

    if (isManager) {
      // Manager fetches their owned organizations
      dispatch(fetchOrganizationsByOwner(user.id)).catch(() => {});
    } else if (user.role === "user") {
      // Regular user fetches organizations they're assigned to
      dispatch(fetchOrganizationsByUser()).catch(() => {});
    }
  }, [dispatch, isManager, user]);

  // Auto-select first organization when organizations load
  useEffect(() => {
    if (Organizations.length > 0 && !orgFilter) {
      const firstOrgId = Organizations[0]._id || Organizations[0].id;
      setOrgFilter(firstOrgId);
    }
  }, [Organizations, orgFilter]);

  useEffect(() => {
    if (orgFilter) {
      // Both managers and users fetch venues by organization
      // Users will filter to show only their assigned venues
      dispatch(fetchVenuesByOrganization(orgFilter));
    }
  }, [orgFilter, dispatch]);

  const handleDelete = async (id, name) => {
    if (!hasManagePermission) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete ${name}? This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(deleteVenue(id)).unwrap();
      dispatch(fetchAllVenues()).catch(() => {});

      if (orgFilter) {
        dispatch(fetchVenuesByOrganization(orgFilter)).catch(() => {});
      }

      window.dispatchEvent(new Event("venue:updated"));

      if (isMobile) setDrawerOpen(false);

      Swal.fire({
        title: "Deleted!",
        text: `${name} has been deleted.`,
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      if (isMobile) setDrawerOpen(false);
      Swal.fire({ title: "Error!", text: err?.toString() || "Failed to delete venue", icon: "error" });
    }
  };

  const handleEditOpen = async (id, name) => {
    if (!hasManagePermission) return;

    setVenueId(id);
    setVenueName(name);

    try {
      // Fetch the single venue to get populated organization data
      const venue = await dispatch(fetchSingleVenue(id)).unwrap();

      let initialOrg = "";
      if (venue.organization && typeof venue.organization === "object") {
        initialOrg = venue.organization._id || venue.organization.id || "";
      } else if (venue.organization) {
        initialOrg = venue.organization;
      }

      setOrgId(initialOrg);
      setOriginalOrgId(initialOrg);
      setEditOpen(true);
    } catch (err) {
      console.error("Failed to fetch venue details:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load venue details",
      });
    }
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setVenueId(null);
    setVenueName("");
    setOrgId("");
    setOriginalOrgId("");
  };

  const handleEditSave = async () => {
    if (!hasManagePermission) return;

    const name = venueName?.trim();
    if (!name) return;

    try {
      const payload = { id: venueId, name };
      if (orgId) payload.organizationId = orgId;

      const updated = await dispatch(updateVenue(payload)).unwrap();

      handleEditClose();

      Swal.fire({
        title: "Updated!",
        text: `Venue updated to ${name}.`,
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });

      // Determine the new organization ID from the response
      const newOrgId =
        (updated && (updated.organization?._id ?? updated.organization ?? updated.organizationId)) ||
        orgId ||
        "";

      // Refresh caches for affected organizations:
      // 1. Refresh original organization (where venue was before)
      if (originalOrgId) {
        dispatch(fetchVenuesByOrganization(originalOrgId)).catch(() => {});
      }

      // 2. Refresh new organization (where venue is now)
      if (newOrgId && newOrgId !== originalOrgId) {
        dispatch(fetchVenuesByOrganization(newOrgId)).catch(() => {});
      }

      // 3. IMPORTANT: Refresh the currently displayed organization
      if (orgFilter && orgFilter !== originalOrgId && orgFilter !== newOrgId) {
        dispatch(fetchVenuesByOrganization(orgFilter)).catch(() => {});
      }

      // Notify other listeners
      window.dispatchEvent(new Event("venue:updated"));

      // Clear originalOrgId (reset)
      setOriginalOrgId("");
    } catch (err) {
      console.error(err);
      Swal.fire({ title: "Error!", text: err?.toString() || "Failed to update venue", icon: "error" });
    }
  };

  const handleRowClick = (venue, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    onVenueSelect?.(venue);
    if (isMobile) setDrawerOpen(false);
  };

  const getDisplayedVenues = () => {
    if (!orgFilter) return [];

    // Get venues for selected organization from Redux
    const cached = Array.isArray(venuesByOrg[orgFilter]) ? venuesByOrg[orgFilter] : null;
    const orgVenues = cached || (Venues || []).filter((v) => String(v.organization?._id ?? v.organization ?? "") === String(orgFilter));

    if (isManager) {
      // Manager: Show ALL venues in the organization
      return orgVenues;
    } else {
      // Regular user: Show only assigned venues
      const userAssignedVenueIds = (user?.venues || []).map((v) => String(v.venueId?._id || v.venueId));

      // Filter organization venues to show only those assigned to user
      return orgVenues.filter((venue) => {
        const venueId = String(venue._id || venue.id);
        return userAssignedVenueIds.includes(venueId);
      });
    }
  };

  const displayedVenues = getDisplayedVenues();

  const renderListMarkup = () => (
    <div className="ListPage venue-list-container bg-white rounded-xl shadow-sm w-full h-full border border-[#E5E7EB]">
      {isDesktop ? (
        <h1 className="organization-list-title font-semibold text-gray-800 mb-4">Venue Management</h1>
      ) : (
        <div className="flex justify-end">
          <IconButton onClick={() => setDrawerOpen(false)} edge="start" aria-label="close-details" size="small">
            <CloseIcon />
          </IconButton>
        </div>
      )}

      {/* Subscription Usage Indicator */}
      <SubscriptionUsageIndicator
        resourceType="venue"
        currentCount={displayedVenues.length}
      />

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="venue-list-header text-left font-semibold text-gray-800">Venue List</h2>
          </div>

          <div>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              {/* <Select
                labelId="org-filter-label"
                value={orgFilter || ""}
                onChange={(e) => setOrgFilter(e.target.value)}
                disabled={Organizations.length === 0}
              >
                {Organizations.length === 0 ? (
                  <MenuItem value="" disabled>
                    No organizations found
                  </MenuItem>
                ) : (
                  (Organizations || []).map((org) => (
                    <MenuItem key={org._id ?? org.id} value={org._id ?? org.id}>
                      {org.name}
                    </MenuItem>
                  ))
                )}
              </Select> */}

              <Select
  labelId="org-filter-label"
  value={orgFilter || ""}
  onChange={(e) => setOrgFilter(e.target.value)}
  displayEmpty
>
  {Organizations.length === 0 ? (
    <MenuItem value="" disabled>
      No organizations
    </MenuItem>
  ) : (
    Organizations.map((org) => (
      <MenuItem key={org._id ?? org.id} value={org._id ?? org.id}>
        {org.name}
      </MenuItem>
    ))
  )}
</Select>

            </FormControl>
          </div>
        </div>

        <div className="mx-auto mt-2 h-px w-4/5 bg-[#2563EB]/40"></div>
      </div>

      <div className="overflow-x-auto ">
        <table className="w-full table-auto text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="venue-table-header py-2 px-4 font-bold text-gray-800">Venue Name</th>
              <th className="venue-table-header py-2 px-4 text-center">Actions</th>
            </tr>
          </thead>
        </table>

        <div className="venue-table-scroll overflow-y-auto pr-1  h-[65vh] sm:h-[58vh]">
          {loading ? (
            <table className="w-full table-auto text-left">
              <tbody aria-busy={loading} role="status">
                <TableSkeleton rows={4} showNumber={true} showActions={true} />
              </tbody>
            </table>
          ) : error ? (
            <div className="text-center  py-4 text-gray-500">{(error === "Failed to fetch") && <>No Venues Found</>}</div>
          ) : displayedVenues.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No venues found. Add one to get started.</div>
          ) : (
            <table className="w-full table-auto text-left ">
              <tbody>
                {displayedVenues.map((venue, index) => {
                  const id = venue._id ?? venue.id ?? index;
                  const displayName = venue.name ?? `Venue ${index + 1}`;
                  return (
                    <tr
                      key={id}
                      className={`border-b border-gray-200 cursor-pointer transition-colors hover:bg-blue-50/60 ${
                        selectedVenue?._id === id ? "bg-blue-50 border-blue-300" : ""
                      }`}
                      onClick={(e) => handleRowClick(venue, e)}
                    >
                      <td className="venue-table-cell py-2 sm:py-3 px-2 sm:px-4">
                        {index + 1}. {displayName}
                      </td>
                      <td className="venue-table-cell py-2 sm:py-3 px-2 sm:px-4">
                        <div className="flex justify-center gap-2 sm:gap-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEditOpen(id, displayName)}
                            disabled={!hasManagePermission}
                            className={`venue-action-btn rounded-full border border-green-500/50 bg-white flex items-center justify-center hover:bg-green-50 p-[4px] ${
                              !hasManagePermission ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                          >
                            <Pencil className="text-green-600 venue-action-icon " size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(id, displayName)}
                            disabled={!hasManagePermission}
                            className={`venue-action-btn rounded-full border border-red-500/50 bg-white flex items-center justify-center hover:bg-red-50 p-[4px] ${
                              !hasManagePermission ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                          >
                            <Trash className="text-red-600 venue-action-icon " size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
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
            <img src="/logo-half.png" className="w-auto h-[30px]" />
            <h1 className="venue-list-title font-semibold text-gray-800">Venue Management</h1>
            <div>
              <IconButton aria-label="Open venues" size="small" onClick={() => setDrawerOpen(true)}>
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
            <div className="p-4">{renderListMarkup()}</div>
          </Drawer>
        </>
      )}

      {editOpen && hasManagePermission && (
        <Dialog open={editOpen} onClose={handleEditClose}>
          <DialogTitle>Edit Venue</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Venue Name"
              type="text"
              fullWidth
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
            />

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="demo-simple-select-label">Organization</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Organization"
                value={orgId || ""}
                onChange={(e) => setOrgId(e.target.value)}
              >
                <MenuItem value="">Keep current organization</MenuItem>
                {(Organizations || []).map((org) => (
                  <MenuItem key={org._id || org.id} value={org._id || org.id}>
                    {org.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button onClick={handleEditSave} variant="contained" color="primary" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default VenueList;
