// src/components/Modals/UserManagement/EditUserModal.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Chip,
  Box,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { fetchOrganizationsByOwner } from "../../../slices/OrganizationSlice";
import { fetchVenuesByOrganization } from "../../../slices/VenueSlice";
import { fetchSingleUser, updateSubUser, fetchSubUsers } from "../../../slices/UserSlice";
import Swal from "sweetalert2";

const PERMISSION_OPTIONS = [
  { value: "view", label: "View Only" },
  { value: "manage", label: "Manage" },
];

const EditUserModal = ({ open, onClose, userId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { selectedUser, isLoading } = useSelector((state) => state.User || {});
  const { Organizations = [], isLoading: orgsLoading } = useSelector(
    (state) => state.Organization || {}
  );
  const { venuesByOrg = {}, loading: venueLoading } = useSelector(
    (state) => state.Venue || {}
  );

  const [formData, setFormData] = useState({
    organizations: [],
    venues: [],
    permission: "view",
  });
  const [saving, setSaving] = useState(false);

  // Fetch user details when modal opens
  useEffect(() => {
    if (open && userId) {
      dispatch(fetchSingleUser(userId));
    }
  }, [open, userId, dispatch]);

  // Fetch organizations
  useEffect(() => {
    if (open && user?.id) {
      dispatch(fetchOrganizationsByOwner(user.id));
    }
  }, [open, user, dispatch]);

  // Populate form when user data is loaded
  useEffect(() => {
    if (selectedUser) {
      const orgIds = selectedUser.organizations?.map((org) => org._id || org) || [];
      const venueIds = selectedUser.venues?.map((v) => v.venueId?._id || v.venueId) || [];

      console.log("orgIds>>", orgIds);
      
      setFormData({
        organizations: orgIds,
        venues: venueIds,
        permission: selectedUser.permission || "view",
      });
    }
  }, [selectedUser]);

  // Fetch venues when organizations change
  useEffect(() => {
    if (formData.organizations.length > 0) {
      formData.organizations.forEach((orgId) => {
        if (!venuesByOrg[orgId]) {
          dispatch(fetchVenuesByOrganization(orgId));
        }
      });
    }
  }, [formData.organizations, dispatch, venuesByOrg]);

  // Get available venues from selected organizations
  const availableVenues = formData.organizations.flatMap(
    (orgId) => venuesByOrg[orgId] || []
  );

  const handleOrganizationsChange = (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      organizations: typeof value === "string" ? value.split(",") : value,
      venues: [], // Reset venues when organizations change
    }));
  };

  const handleVenuesChange = (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      venues: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handlePermissionChange = (event) => {
    setFormData((prev) => ({ ...prev, permission: event.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.organizations.length === 0) {
      return Swal.fire({
        icon: "warning",
        title: "Select Organizations",
        text: "At least one organization is required.",
      });
    }

    setSaving(true);
    try {
      await dispatch(
        updateSubUser({
          userId,
          userData: {
            organizations: formData.organizations,
            venues: formData.venues,
            permission: formData.permission,
          },
        })
      ).unwrap();

      Swal.fire({
        icon: "success",
        title: "User Updated",
        text: "User details updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      // Refresh user list
      if (user?.id) {
        dispatch(fetchSubUsers(user.id));
      }

      onClose();
    } catch (err) {
      console.error("Update user error:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err?.message || String(err) || "Failed to update user",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  return (
    // <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
    //   <DialogTitle>
    //     Edit User
    //     <IconButton
    //       aria-label="close"
    //       onClick={handleClose}
    //       disabled={saving}
    //       sx={{
    //         position: "absolute",
    //         right: 8,
    //         top: 8,
    //       }}
    //     >
    //       <CloseIcon />
    //     </IconButton>
    //   </DialogTitle>

    //   <DialogContent dividers>
    //     {isLoading ? (
    //       <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    //         <CircularProgress />
    //       </Box>
    //     ) : (
    //       <form onSubmit={handleSubmit} className="space-y-4">
    //         {/* User Info (Read-only) */}
    //         {selectedUser && (
    //           <Box mb={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
    //             <div className="text-sm">
    //               <strong>Name:</strong> {selectedUser.name}
    //             </div>
    //             <div className="text-sm">
    //               <strong>Email:</strong> {selectedUser.email}
    //             </div>
    //           </Box>
    //         )}

    //         {/* Organizations - Multi-select */}
    //         <FormControl fullWidth size="small">
    //           <InputLabel id="edit-organizations-label">Organizations *</InputLabel>
    //           <Select
    //             labelId="edit-organizations-label"
    //             multiple
    //             value={formData.organizations}
    //             onChange={handleOrganizationsChange}
    //             input={<OutlinedInput label="Organizations *" />}
    //             renderValue={(selected) => (
    //               <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
    //                 {selected.map((orgId) => {
    //                   const org = Organizations.find((o) => o._id === orgId);
    //                   return <Chip key={orgId} label={org?.name || orgId} size="small" />;
    //                 })}
    //               </Box>
    //             )}
    //             disabled={orgsLoading || saving}
    //           >
    //             {orgsLoading ? (
    //               <MenuItem disabled>Loading organizations...</MenuItem>
    //             ) : Organizations.length === 0 ? (
    //               <MenuItem disabled>No organizations found</MenuItem>
    //             ) : (
    //               Organizations.map((org) => (
    //                 <MenuItem key={org._id} value={org._id}>
    //                   <Checkbox checked={formData.organizations.includes(org._id)} />
    //                   <ListItemText primary={org.name} />
    //                 </MenuItem>
    //               ))
    //             )}
    //           </Select>
    //         </FormControl>

    //         {/* Venues - Multi-select (Optional) */}
    //         {formData.organizations.length > 0 && (
    //           <FormControl fullWidth size="small">
    //             <InputLabel id="edit-venues-label">Venues (Optional)</InputLabel>
    //             <Select
    //               labelId="edit-venues-label"
    //               multiple
    //               value={formData.venues}
    //               onChange={handleVenuesChange}
    //               input={<OutlinedInput label="Venues (Optional)" />}
    //               renderValue={(selected) => (
    //                 <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
    //                   {selected.map((venueId) => {
    //                     const venue = availableVenues.find((v) => v._id === venueId);
    //                     return <Chip key={venueId} label={venue?.name || venueId} size="small" />;
    //                   })}
    //                 </Box>
    //               )}
    //               disabled={venueLoading || saving || availableVenues.length === 0}
    //             >
    //               {venueLoading ? (
    //                 <MenuItem disabled>Loading venues...</MenuItem>
    //               ) : availableVenues.length === 0 ? (
    //                 <MenuItem disabled>No venues found</MenuItem>
    //               ) : (
    //                 availableVenues.map((venue) => (
    //                   <MenuItem key={venue._id} value={venue._id}>
    //                     <Checkbox checked={formData.venues.includes(venue._id)} />
    //                     <ListItemText primary={venue.name} />
    //                   </MenuItem>
    //                 ))
    //               )}
    //             </Select>
    //           </FormControl>
    //         )}

    //         {/* Permission */}
    //         <FormControl fullWidth size="small">
    //           <InputLabel id="edit-permission-label">Permission *</InputLabel>
    //           <Select
    //             labelId="edit-permission-label"
    //             value={formData.permission}
    //             label="Permission *"
    //             onChange={handlePermissionChange}
    //             disabled={saving}
    //           >
    //             {PERMISSION_OPTIONS.map((option) => (
    //               <MenuItem key={option.value} value={option.value}>
    //                 {option.label}
    //               </MenuItem>
    //             ))}
    //           </Select>
    //         </FormControl>
    //       </form>
    //     )}
    //   </DialogContent>

    //   <DialogActions>
    //     <Button onClick={handleClose} disabled={saving}>
    //       Cancel
    //     </Button>
    //     <Button
    //       onClick={handleSubmit}
    //       variant="contained"
    //       disabled={isLoading || saving}
    //     >
    //       {saving ? "Updating..." : "Update User"}
    //     </Button>
    //   </DialogActions>
    // </Dialog>

    <Dialog
  open={open}
  onClose={handleClose}
  maxWidth="xs"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: "20px",
      overflow: "hidden",
      backgroundColor: "#F8FAFC",
      boxShadow: "0 8px 30px rgba(15,23,42,.08)",
    },
  }}
>
  <DialogTitle
    sx={{
      px: 3,
      py: 2.5,
      backgroundColor: "#fff",
      borderBottom: "1px solid #E5E7EB",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Box>
      <div className="text-lg font-semibold text-gray-900">
        Edit User
      </div>
      <div className="text-sm text-gray-500">
        Manage User Details
      </div>
    </Box>

    <IconButton
      onClick={handleClose}
      disabled={saving}
      sx={{
        backgroundColor: "#F3F4F6",
        "&:hover": {
          backgroundColor: "#E5E7EB",
        },
      }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>

  <DialogContent
    sx={{
      backgroundColor: "#F8FAFC",
      p: 3,
    }}
  >
    {isLoading ? (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="250px"
      >
        <CircularProgress />
      </Box>
    ) : (
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* User Info Card */}
        {selectedUser && (
          <Box
            sx={{
              p: 2.5,
              my: 2.5,
              borderRadius: "16px",
              backgroundColor: "#fff",
              border: "1px solid #E5E7EB",
            }}
          >
            <div className="text-base font-semibold text-gray-900">
              {selectedUser.name}
            </div>

            <div className="text-sm text-gray-500 mt-1">
              {selectedUser.email}
            </div>
          </Box>
        )}

        {/* Organizations */}
        <Box>
          <div className="text-sm font-medium text-gray-700 mb-2">
            Organizations *
          </div>

          <FormControl
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: "#fff",
              },
            }}
          >
            <Select
              multiple
              value={formData.organizations}
              onChange={handleOrganizationsChange}
              displayEmpty
              renderValue={(selected) => (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  {selected.map((orgId) => {
                    const org = Organizations.find(
                      (o) => o._id === orgId
                    );

                    return (
                      <Chip
                        key={orgId}
                        label={org?.name || orgId}
                        size="small"
                        sx={{
                          backgroundColor: "#DBEAFE",
                          color: "#1E40AF",
                          fontWeight: 600,
                          borderRadius: "8px",
                        }}
                      />
                    );
                  })}
                </Box>
              )}
              disabled={orgsLoading || saving}
            >
              {orgsLoading ? (
                <MenuItem disabled>
                  Loading organizations...
                </MenuItem>
              ) : Organizations.length === 0 ? (
                <MenuItem disabled>
                  No organizations found
                </MenuItem>
              ) : (
                Organizations.map((org) => (
                  <MenuItem
                    key={org._id}
                    value={org._id}
                  >
                    <Checkbox
                      checked={formData.organizations.includes(
                        org._id
                      )}
                    />
                    <ListItemText primary={org.name} />
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Box>

        {/* Venues */}
        {formData.organizations.length > 0 && (
          <Box>
            <div className="text-sm font-medium text-gray-700 mb-2">
              Venues (Optional)
            </div>

            <FormControl
              fullWidth
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#fff",
                },
              }}
            >
              <Select
                multiple
                value={formData.venues}
                onChange={handleVenuesChange}
                displayEmpty
                renderValue={(selected) => (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    {selected.map((venueId) => {
                      const venue =
                        availableVenues.find(
                          (v) => v._id === venueId
                        );

                      return (
                        <Chip
                          key={venueId}
                          label={venue?.name || venueId}
                          size="small"
                          sx={{
                            backgroundColor: "#DCFCE7",
                            color: "#166534",
                            fontWeight: 600,
                            borderRadius: "8px",
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
                disabled={
                  venueLoading ||
                  saving ||
                  availableVenues.length === 0
                }
              >
                {venueLoading ? (
                  <MenuItem disabled>
                    Loading venues...
                  </MenuItem>
                ) : availableVenues.length === 0 ? (
                  <MenuItem disabled>
                    No venues found
                  </MenuItem>
                ) : (
                  availableVenues.map((venue) => (
                    <MenuItem
                      key={venue._id}
                      value={venue._id}
                    >
                      <Checkbox
                        checked={formData.venues.includes(
                          venue._id
                        )}
                      />
                      <ListItemText
                        primary={venue.name}
                      />
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Permission */}
        <Box>
          <div className="text-sm font-medium text-gray-700 mb-2">
            Permission *
          </div>

          <FormControl
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: "#fff",
              },
            }}
          >
            <Select
              value={formData.permission}
              onChange={handlePermissionChange}
              disabled={saving}
            >
              <MenuItem value="view">
                👁 View Only
              </MenuItem>

              <MenuItem value="manage">
                ⚡ Manage
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </form>
    )}
  </DialogContent>

  <DialogActions
    sx={{
      px: 3,
      py: 2,
      backgroundColor: "#fff",
      borderTop: "1px solid #E5E7EB",
    }}
  >
    <Button
      onClick={handleClose}
      disabled={saving}
      variant="outlined"
      sx={{
        borderRadius: "12px",
        textTransform: "none",
        px: 3,
      }}
    >
      Cancel
    </Button>

    <Button
      onClick={handleSubmit}
      variant="contained"
      disableElevation
      disabled={isLoading || saving}
      sx={{
        borderRadius: "12px",
        textTransform: "none",
        px: 3,
        backgroundColor: "#1E64D9",
        fontWeight: 600,
        "&:hover": {
          backgroundColor: "#1557C7",
        },
      }}
    >
      {saving ? "Updating..." : "Update User"}
    </Button>
  </DialogActions>
</Dialog>
  );
};

export default EditUserModal;
