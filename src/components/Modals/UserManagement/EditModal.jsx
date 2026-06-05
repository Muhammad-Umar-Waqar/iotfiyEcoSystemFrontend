
import * as React from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  Stack,
  MenuItem,
  TextField,
  useMediaQuery,
  useTheme,
  Autocomplete,
  Chip,
} from "@mui/material";
import { Lock, Mail, Timer, User2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import InputField from "../../Inputs/InputField";
import PasswordField from "../../Inputs/PasswordField";
import Swal from "sweetalert2";
import {
  fetchAllManagers,
  UpdateManager,
  setManagerEditModalOpen,
} from "../../../slices/ManagerSlice";
import { fetchOrganizationsByOwner, fetchOrganizationsByUser } from "../../../slices/OrganizationSlice";
import { fetchAllVenues, fetchVenuesByOrganization } from "../../../slices/VenueSlice"; // ensure this thunk exists and is exported
import { useStore } from "../../../contexts/storecontexts";
import { useNavigate } from "react-router";
import './EditModalStyle.css'

export default function UserEditModal({ handleClose, id }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [timer, setTimer] = React.useState("");
  const [timerError, setTimerError] = React.useState("");

  const { ManagerEditModalOpen, Managers, isLoading } = useSelector(
    (s) => s.Manager || {}
  );
  const { Organizations = [] } = useSelector((s) => s.Organization || {});
  // const { Venues = [], loading: venuesLoading,  } = useSelector((s) => s.Venue || {});

  const { Venues = [], loading: venuesLoading, venuesByOrg = {} } = useSelector((s) => s.Venue || {});


  const [formData, setFormData] = React.useState({
    id: null,
    name: "",
    current_email: "",
    updated_email: "",
    updated_password: "",
    organizationId: "",
    role: "",
    createdBy: "",
  });

  // selected venue objects for Autocomplete
  const [selectedVenues, setSelectedVenues] = React.useState([]);

  React.useEffect(() => {
    if (!user?.id) return;

    // Fetch organizations based on role
    if (user.role === "manager") {
      dispatch(fetchOrganizationsByOwner(user.id));
    } else if (user.role === "user") {
      dispatch(fetchOrganizationsByUser());
    } else if (user.role === "admin") {
      // Admin might need different logic - for now skip or add admin-specific fetch
    }
  }, [dispatch, user]);

  // React.useEffect(() => {
  //   if (!ManagerEditModalOpen || !id) return;

  //   const mgr = (Managers || []).find((m) => String(m._id) === String(id));
  //   if (mgr) {
  //     console.log("mgr", mgr)
  //     const orgId =
  //       mgr.organization && typeof mgr.organization === "object"
  //         ? mgr.organization._id || mgr.organization.id
  //         : mgr.organization || "";

  //     // set base form data
  //     setFormData({
  //       id: mgr._id,
  //       name: mgr.name || "",
  //       current_email: mgr.email || "",
  //       updated_email: "",
  //       updated_password: "",
  //       organizationId: orgId,
  //       role: mgr.role || "",
  //       createdBy: mgr.createdBy || "",
  //     });


  //       if (orgId) {
  //       dispatch(fetchVenuesByOrganization(orgId)).catch(() => {});
  //     }

  //     // pre-select assigned venues if available on manager object
  //     // Expected format on manager: mgr.venues = [{ venueId, venueName }, ...] OR simple [{ _id, name }, ...]
  //     if (Array.isArray(mgr.venues) && mgr.venues.length > 0) {
  //       const assignedIds = mgr.venues.map((v) => v.venueId || v._id || v.id);

  //       // const mapped = mgr.venues.map((v) => {
  //       //   // normalize to { _id, name }
  //       //   if (v.venueId || v.venueName) {
  //       //     return { _id: v.venueId, name: v.venueName };
  //       //   }
  //       //   return { _id: v._id || v.id, name: v.name || v.title || v.venueName };
  //       // });


  //       // setSelectedVenues(mapped);
  //      setSelectedVenues(assignedIds.map((id) => ({ _id: id })));
  //     } else {
  //       setSelectedVenues([]);
  //     }

  //   } else {
  //     // if manager not found in memory, fetch managers
  //     dispatch(fetchAllManagers()).catch(() => {});
  //   }
  // }, [ManagerEditModalOpen, id, Managers, dispatch]);

   // When venues for the selected organization load (from venuesByOrg), sync selectedVenues to the actual option objects
  
  React.useEffect(() => {
  if (!ManagerEditModalOpen || !id) return;

  const mgr = (Managers || []).find((m) => String(m._id) === String(id));
  if (mgr) {


    console.log("mgr>>", mgr)
    const orgId =
      mgr.organization && typeof mgr.organization === "object"
        ? mgr.organization._id || mgr.organization.id
        : mgr.organization || "";

      if (user?.role === "admin") {
        setTimer(mgr.timer || ""); // mgr.timer can be null
      }
    
      setFormData({
      id: mgr._id,
      name: mgr.name || "",
      current_email: mgr.email || "",
      updated_email: "",
      updated_password: "",
      organizationId: orgId,
      role: mgr.role || "",
      createdBy: mgr.createdBy || "",
    });

    if (orgId) {
      dispatch(fetchVenuesByOrganization(orgId)).catch(() => {});
    }

    // Pre-select assigned venues properly
    if (Array.isArray(mgr.venues) && mgr.venues.length > 0) {
      setSelectedVenues(mgr.venues.map((v) => ({
        _id: v.venueId || v._id || v.id,
        name: v.venueName || v.name || v.title,
      })));
    } else {
      setSelectedVenues([]);
    }
  }
}, [ManagerEditModalOpen, id, Managers, dispatch]);

const validateTimer = (value) => {
  if (!value || typeof value !== "string") return { valid: false, message: "Timer required" };
  const re = /^(?:[1-9]|[1-5][0-9]|60)(s|m)$/;
  const match = value.trim().match(re);
  if (!match) return { valid: false, message: "Use 1–60s or 1–60m" };
  return { valid: true };
};


const handleTimerChange = (e) => {
  const val = e.target.value;
  setTimer(val);

  if (!val) {
    setTimerError("");
    return;
  }

  const { valid, message } = validateTimer(val);
  setTimerError(valid ? "" : message);
};



   React.useEffect(() => {
    const orgId = formData.organizationId;
    if (!orgId) return;

    const orgVenues = venuesByOrg[orgId] || []; // this will be the array returned by fetchVenuesByOrganization
    console.log("orgVenues>", orgVenues)
    if (!Array.isArray(orgVenues)) return;

    // If selectedVenues currently hold simple {_id: id} objects, replace them with the full option objects from orgVenues
    // Also handle case where selectedVenues already contains full venue objects
    if (selectedVenues && selectedVenues.length > 0) {
      // produce a map for quick lookup
      const mapById = orgVenues.reduce((acc, v) => {
        const id = v._id || v.id;
        acc[id] = { _id: id, name: v.name || v.title || "" , ...v};
        return acc;
      }, {});

      const replaced = selectedVenues
        .map((sv) => {
          const id = sv._id || sv.id || sv.venueId;
          return mapById[id] || (sv.name ? sv : null); // keep if already full object (has name), else null
        })
        .filter(Boolean); // remove nulls (assigned venue id might no longer exist in org)

      // If any replacements were found, update to the real option objects so Autocomplete recognizes them
      if (replaced.length > 0) {
        setSelectedVenues(replaced);
      }
    }
  }, [venuesByOrg, formData.organizationId]); // intentionally not including selectedVenues to avoid loop

   // When admin changes organization selection in the select box, fetch that org's venues
  const handleOrgChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (value) dispatch(fetchVenuesByOrganization(value)).catch(() => {});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const closeModal = () => {
    dispatch(setManagerEditModalOpen(false));
    handleClose && handleClose();
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.organizationId) {
      return Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Name and Organization are required.",
      });
    }

    
    // console.log("venuesPayload", venuesPayload)
    try {
      // Prepare venues payload - send array  [venueId]
      
      const venuesPayload =  (user?.role === "user") ? (selectedVenues || []).map((v) => (v._id || v.id)) : [];
      

     
      const payload = {
        id: formData.id,
        name: formData.name,
        email: formData.updated_email !== "" ? formData.updated_email : undefined,
        password:
          formData.updated_password && formData.updated_password.length > 0
            ? formData.updated_password
            : undefined,
        organization: formData.organizationId,
        // include venues only for users (optional), backend should ignore if not applicable
        venues: venuesPayload,
      };

      // add timer if admin and valid
      if (user?.role === "admin" && timer && !timerError) {
        payload.timer = timer;
      }

      console.log("payload>", payload);
      

      
      // refresh lists depending on current user's role:
      if (user && user?.role === "admin") {
        await dispatch(fetchAllManagers()).unwrap();
      }
      const updated = await dispatch(UpdateManager(payload)).unwrap();
      
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "User updated successfully.",
      });

      closeModal();

      // if (user && (String(user._id) === String(updated._id) || user.email === formData.current_email)) {
      //   navigate("/logout");
      //   return;
      // }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err || "Failed to update user",
        customClass: { container: "swal2-topmost" },
      });
    }
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobile ? "90%" : 500,
    maxWidth: 500,
    bgcolor: "background.paper",
    borderRadius: "8px",
    boxShadow: 24,
    p: 4,
  };

  // Determine role to decide which fields to show. Prefer formData.role (populated from manager)
  const role = user?.role;

  return (
    <Modal
      open={!!ManagerEditModalOpen}
      onClose={closeModal}
    >
      <Box sx={modalStyle}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Edit User
        </Typography>
        <Stack spacing={2}>
          <InputField
            label="Current Email"
            id="Current_Email"
            name="current_email"
            type="email"
            value={formData.current_email}
            disabled={true}
            placeholder="Current Email"
            icon={<Mail size={18} className="text-gray-400" />}
          />

          <InputField
            label="Name"
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onchange={handleChange}
            placeholder="Full name"
            icon={<User2 size={18} className="text-gray-400" />}
          />

          <InputField
            label="Updated Email (optional)"
            id="Updated_Email"
            name="updated_email"
            type="email"
            value={formData.updated_email}
            onchange={handleChange}
            placeholder="Enter updated email (leave blank to keep)"
            icon={<Mail size={18} className="text-gray-400" />}
          />

          <PasswordField
            label="New Password (optional)"
            id="password"
            name="updated_password"
            value={formData.updated_password}
            onchange={handleChange}
            placeholder="Enter new password (leave blank to keep)"
            icon={<Lock size={18} className="text-gray-400"/>}
          />

          {/* {
            role === "admin" ? (
              <TextField
                select
                fullWidth
                label="Organization"
                name="organizationId"
                value={formData.organizationId || ""}
                onChange={handleChange}
                sx={{ mt: 2 }}
              >
                <MenuItem value="">Select Organization</MenuItem>
                {(Organizations || []).map((org) => (
                  <MenuItem key={org._id || org.id} value={org._id || org.id}>
                    {org.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              // For users (role === "user") show the multi-select Autocomplete with checkboxes
              role === "user" && (
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={(Venues || []).map((v) => ({ _id: v._id || v.id, name: v.name || v.title }))}
                  getOptionLabel={(option) => option.name || ""}
                  value={selectedVenues}
                  onChange={(e, newValue) => {
                    setSelectedVenues(newValue);
                  }}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip label={option.name} {...getTagProps({ index })} key={option._id || index} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Assigned Venues"
                      placeholder="Select venues"
                    />
                  )}
                />
              )
            )
          } */}


           {
          role === "admin" ? (
    
              <>
                <TextField
                  select
                  fullWidth
                  label="Organization"
                  name="organizationId"
                  value={formData.organizationId || ""}
                  onChange={handleOrgChange} // <--- use handler to fetch venues on change
                  sx={{ mt: 2 }}
                >
                  <MenuItem value="">Select Organization</MenuItem>
                  {(Organizations || []).map((org) => (
                    <MenuItem key={org._id || org.id} value={org._id || org.id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </TextField>

                <InputField
                  type="text"
                  name="timer"
                  label="Timer"
                  placeholder="eg: 1s or 1m"
                  value={timer}
                  onchange={handleTimerChange}
                  icon={<Timer />}
                />
    {timerError && <p className="mt-1 text-sm text-red-600">{timerError}</p>}
            </>
          ) : (
            role === "user" && (
              <Autocomplete
                multiple
                disableCloseOnSelect
                // options: prefer cached org-specific venues; fall back to top-level Venues if needed
                options={
                  (venuesByOrg[formData.organizationId] && venuesByOrg[formData.organizationId].map(v => ({ _id: v._id || v.id, name: v.name || v.title, ...v })))
                  || (Venues || []).map((v) => ({ _id: v._id || v.id, name: v.name || v.title, ...v }))
                }
                getOptionLabel={(option) => option.name || ""}
                // ensure matching compares by _id (this is critical)
                isOptionEqualToValue={(option, value) => String(option._id) === String(value._id)}
                value={selectedVenues}
                onChange={(e, newValue) => {
                  setSelectedVenues(newValue || []);
                }}
              
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assigned Venues"
                    placeholder="Select venues"
                  />
                )}
              />
            )
          )
        }

        </Stack>

        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
          <Button onClick={closeModal} variant="outlined" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} variant="contained" color="primary" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
