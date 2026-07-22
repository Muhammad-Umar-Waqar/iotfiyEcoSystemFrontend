// // src/pages/management/UserManagement/AddUser.jsx
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchOrganizationsByOwner } from "../../../slices/OrganizationSlice";
// import { fetchVenuesByOrganization } from "../../../slices/VenueSlice";
// import { createSubUser, fetchSubUsers } from "../../../slices/UserSlice";
// import { canManage } from "../../../utils/permissions";
// import InputField from "../../../components/Inputs/InputField";
// import Swal from "sweetalert2";
// import {
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Checkbox,
//   ListItemText,
//   OutlinedInput,
//   Chip,
//   Box,
// } from "@mui/material";
// import "../../../styles/pages/management-pages.css";

// const PERMISSION_OPTIONS = [
//   { value: "view", label: "View Only" },
//   { value: "manage", label: "Manage" },
// ];

// const AddUser = ({ selectedUser }) => {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);
//   const { Organizations = [], isLoading: orgsLoading } = useSelector(
//     (state) => state.Organization || {}
//   );
//   const { venuesByOrg = {}, loading: venueLoading } = useSelector(
//     (state) => state.Venue || {}
//   );

//   const hasManagePermission = canManage(user);
//   const isManager = user?.role === "manager";

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     organizations: [],
//     venues: [],
//     permission: "view",
//   });

//   const [formLoading, setFormLoading] = useState(false);

//   // Fetch organizations on mount
//   useEffect(() => {
//     if (isManager && user?.id) {
//       dispatch(fetchOrganizationsByOwner(user.id));
//     }
//   }, [dispatch, isManager, user]);

//   // Fetch venues when organizations are selected
//   useEffect(() => {
//     if (formData.organizations.length > 0) {
//       formData.organizations.forEach((orgId) => {
//         if (!venuesByOrg[orgId]) {
//           dispatch(fetchVenuesByOrganization(orgId));
//         }
//       });
//     }
//   }, [formData.organizations, dispatch, venuesByOrg]);

//   // Get all available venues from selected organizations
//   const availableVenues = formData.organizations.flatMap(
//     (orgId) => venuesByOrg[orgId] || []
//   );

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleOrganizationsChange = (event) => {
//     const value = event.target.value;
//     setFormData((prev) => ({
//       ...prev,
//       organizations: typeof value === "string" ? value.split(",") : value,
//       venues: [], // Reset venues when organizations change
//     }));
//   };

//   const handleVenuesChange = (event) => {
//     const value = event.target.value;
//     setFormData((prev) => ({
//       ...prev,
//       venues: typeof value === "string" ? value.split(",") : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validation
//     if (!formData.name?.trim()) {
//       return Swal.fire({ icon: "warning", title: "Enter User Name" });
//     }
//     if (!formData.email?.trim()) {
//       return Swal.fire({ icon: "warning", title: "Enter Email" });
//     }
//     if (formData.organizations.length === 0) {
//       return Swal.fire({ icon: "warning", title: "Select at least one Organization" });
//     }
//     if (!formData.permission) {
//       return Swal.fire({ icon: "warning", title: "Select Permission" });
//     }

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(formData.email)) {
//       return Swal.fire({ icon: "warning", title: "Enter a valid Email" });
//     }

//     setFormLoading(true);
//     try {
//       await dispatch(
//         createSubUser({
//           name: formData.name.trim(),
//           email: formData.email.toLowerCase().trim(),
//           organizations: formData.organizations,
//           venues: formData.venues,
//           permission: formData.permission,
//           role: "user",
//         })
//       ).unwrap();

//       Swal.fire({
//         icon: "success",
//         title: "User Created",
//         text: "Setup link has been sent to the user's email.",
//       });

//       // Reset form
//       setFormData({
//         name: "",
//         email: "",
//         organizations: [],
//         venues: [],
//         permission: "view",
//       });

//       // Refresh user list
//       if (user?.id) {
//         dispatch(fetchSubUsers(user.id));
//       }
//     } catch (err) {
//       console.error("Create user error:", err);
//       const text = err?.message || String(err) || "Failed to create user";
//       Swal.fire({ icon: "error", title: "Create Failed", text });
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   // If not manager, show access denied
//   if (!isManager) {
//     return (
//       <div className="AddingPage user-add-container rounded-xl shadow-sm w-full flex flex-col justify-center bg-[#EEF3F9] border border-[#E5E7EB]">
//         <div className="text-center">
//           <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
//           <p className="text-gray-600">Only managers can create users.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="rounded-xl shadow-sm w-full h-full flex flex-col justify-center bg-[#EEF3F9] border border-[#E5E7EB] p-4">
//       <h2 className="user-add-title font-semibold mb-1 text-center">Add User</h2>
//       <p className="user-add-subtitle text-gray-500 mb-6 text-center">
//         {hasManagePermission
//           ? "Create a new sub-user account"
//           : "View Only Mode - Forms are disabled"}
//       </p>

//       <form
//         onSubmit={handleSubmit}
//         className={`space-y-4 max-w-md mx-auto w-full p-6 ${
//           !hasManagePermission ? "opacity-60 pointer-events-none" : ""
//         }`}
//       >
//         {/* Name */}
//         <InputField
//           label="Full Name"
//           type="text"
//           name="name"
//           value={formData.name}
//           onchange={handleChange}
//           placeholder="Enter user's full name"
//           disabled={!hasManagePermission}
//         />

//         {/* Email */}
//         <InputField
//           label="Email"
//           type="email"
//           name="email"
//           value={formData.email}
//           onchange={handleChange}
//           placeholder="user@example.com"
//           disabled={!hasManagePermission}
//         />

// <div className="flex flex-col gap-4 "> 
//         {/* Organizations - Multi-select */}
//         <FormControl fullWidth size="small">
//           <InputLabel id="organizations-label">Organizations *</InputLabel>
//           <Select
//             labelId="organizations-label"
//             multiple
//             name="organizations"
//             value={formData.organizations}
//             onChange={handleOrganizationsChange}
//             input={<OutlinedInput label="Organizations *" />}
//             renderValue={(selected) => (
//               <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
//                 {selected.map((orgId) => {
//                   const org = Organizations.find((o) => o._id === orgId);
//                   return (
//                     <Chip key={orgId} label={org?.name || orgId} size="small" />
//                   );
//                 })}
//               </Box>
//             )}
//             disabled={!hasManagePermission || orgsLoading}
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
//             <InputLabel id="venues-label">Venues (Optional)</InputLabel>
//             <Select
//               labelId="venues-label"
//               multiple
//               name="venues"
//               value={formData.venues}
//               onChange={handleVenuesChange}
//               input={<OutlinedInput label="Venues (Optional)" />}
//               renderValue={(selected) => (
//                 <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
//                   {selected.map((venueId) => {
//                     const venue = availableVenues.find((v) => v._id === venueId);
//                     return (
//                       <Chip key={venueId} label={venue?.name || venueId} size="small" />
//                     );
//                   })}
//                 </Box>
//               )}
//               disabled={!hasManagePermission || venueLoading || availableVenues.length === 0}
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
//           <InputLabel id="permission-label">Permission *</InputLabel>
//           <Select
//             labelId="permission-label"
//             name="permission"
//             value={formData.permission}
//             label="Permission *"
//             onChange={handleChange}
//             disabled={!hasManagePermission}
//           >
//             {PERMISSION_OPTIONS.map((option) => (
//               <MenuItem key={option.value} value={option.value}>
//                 {option.label}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
// </div>
//         {/* Submit Button */}
//         <button
//           type="submit"
//           disabled={formLoading || !hasManagePermission}
//           className={`w-full bg-[#1E64D9] text-white font-semibold py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
//             formLoading || !hasManagePermission
//               ? "opacity-70 cursor-not-allowed"
//               : "cursor-pointer hover:bg-[#1557C7]"
//           }`}
//         >
//           {formLoading ? "Creating User..." : "Create User"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddUser;



// src/pages/management/UserManagement/AddUser.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrganizationsByOwner } from "../../../slices/OrganizationSlice";
import { fetchVenuesByOrganization } from "../../../slices/VenueSlice";
import { createSubUser, fetchSubUsers } from "../../../slices/UserSlice";
import { canManage } from "../../../utils/permissions";
import InputField from "../../../components/Inputs/InputField";
import Swal from "sweetalert2";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Chip,
  Box,
} from "@mui/material";

const PERMISSION_OPTIONS = [
  { value: "view", label: "View Only" },
  { value: "manage", label: "Manage" },
];

const AddUser = ({ selectedUser }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { Organizations = [], isLoading: orgsLoading } = useSelector(
    (state) => state.Organization || {}
  );
  const { venuesByOrg = {}, loading: venueLoading } = useSelector(
    (state) => state.Venue || {}
  );

  const hasManagePermission = canManage(user);
  const isManager = user?.role === "manager";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organizations: [],
    venues: [],
    permission: "view",
  });

  const [formLoading, setFormLoading] = useState(false);

  // Fetch organizations on mount
  useEffect(() => {
    if (isManager && user?.id) {
      dispatch(fetchOrganizationsByOwner(user.id));
    }
  }, [dispatch, isManager, user]);

  // Fetch venues when organizations are selected
  useEffect(() => {
    if (formData.organizations.length > 0) {
      formData.organizations.forEach((orgId) => {
        if (!venuesByOrg[orgId]) {
          dispatch(fetchVenuesByOrganization(orgId));
        }
      });
    }
  }, [formData.organizations, dispatch, venuesByOrg]);

  // Get all available venues from selected organizations
  const availableVenues = formData.organizations.flatMap(
    (orgId) => venuesByOrg[orgId] || []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name?.trim()) {
      return Swal.fire({ icon: "warning", title: "Enter User Name" });
    }
    if (!formData.email?.trim()) {
      return Swal.fire({ icon: "warning", title: "Enter Email" });
    }
    if (formData.organizations.length === 0) {
      return Swal.fire({ icon: "warning", title: "Select at least one Organization" });
    }
    if (!formData.permission) {
      return Swal.fire({ icon: "warning", title: "Select Permission" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return Swal.fire({ icon: "warning", title: "Enter a valid Email" });
    }

    setFormLoading(true);
    try {
      await dispatch(
        createSubUser({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          organizations: formData.organizations,
          venues: formData.venues,
          permission: formData.permission,
          role: "user",
        })
      ).unwrap();

      Swal.fire({
        icon: "success",
        title: "User Created",
        text: "Setup link has been sent to the user's email.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        organizations: [],
        venues: [],
        permission: "view",
      });

      // Refresh user list
      if (user?.id) {
        dispatch(fetchSubUsers(user.id));
      }
    } catch (err) {
      console.error("Create user error:", err);
      const text = err?.message || String(err) || "Failed to create user";
      Swal.fire({ icon: "error", title: "Create Failed", text });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="rounded-xl shadow-sm w-full h-full  flex flex-col items-center justify-center bg-[#EEF3F9] border border-[#E5E7EB] p-4 sm:p-5">
      <div className="hidden md:flex justify-center mb-4" aria-hidden="true">
        <img
          src="/user-add-hero.svg"
          alt=""
          className="h-[120px] w-auto select-none pointer-events-none"
        />
      </div>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 text-center">
        Add User
      </h2>
      <p className="text-sm text-gray-500 mb-6 text-center">
        {hasManagePermission
          ? "Create a new sub-user account"
          : "View Only Mode - Forms are disabled"}
      </p>

      <form
        onSubmit={handleSubmit}
        className={`space-y-4 mx-auto md:w-[70%] flex flex-col ${
          !hasManagePermission ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        {/* Name */}
        <InputField
          label="Full Name"
          type="text"
          name="name"
          value={formData.name}
          onchange={handleChange}
          placeholder="Enter user's full name"
          disabled={!hasManagePermission}
        />

        {/* Email */}
        <InputField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onchange={handleChange}
          placeholder="user@example.com"
          disabled={!hasManagePermission}
        />

        <div className="flex flex-col gap-4">
          {/* Organizations - Multi-select */}
          <FormControl fullWidth size="small">
            <InputLabel id="organizations-label">Organizations *</InputLabel>
            <Select
              labelId="organizations-label"
              multiple
              name="organizations"
              value={formData.organizations}
              onChange={handleOrganizationsChange}
              input={<OutlinedInput label="Organizations *" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((orgId) => {
                    const org = Organizations.find((o) => o._id === orgId);
                    return (
                      <Chip key={orgId} label={org?.name || orgId} size="small" />
                    );
                  })}
                </Box>
              )}
              disabled={!hasManagePermission || orgsLoading}
            >
              {orgsLoading ? (
                <MenuItem disabled>Loading organizations...</MenuItem>
              ) : Organizations.length === 0 ? (
                <MenuItem disabled>No organizations found</MenuItem>
              ) : (
                Organizations.map((org) => (
                  <MenuItem key={org._id} value={org._id}>
                    <Checkbox checked={formData.organizations.includes(org._id)} />
                    <ListItemText primary={org.name} />
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* Venues - Multi-select (Optional) */}
          {formData.organizations.length > 0 && (
            <FormControl fullWidth size="small">
              <InputLabel id="venues-label">Venues (Optional)</InputLabel>
              <Select
                labelId="venues-label"
                multiple
                name="venues"
                value={formData.venues}
                onChange={handleVenuesChange}
                input={<OutlinedInput label="Venues (Optional)" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((venueId) => {
                      const venue = availableVenues.find((v) => v._id === venueId);
                      return (
                        <Chip key={venueId} label={venue?.name || venueId} size="small" />
                      );
                    })}
                  </Box>
                )}
                disabled={!hasManagePermission || venueLoading || availableVenues.length === 0}
              >
                {venueLoading ? (
                  <MenuItem disabled>Loading venues...</MenuItem>
                ) : availableVenues.length === 0 ? (
                  <MenuItem disabled>No venues found</MenuItem>
                ) : (
                  availableVenues.map((venue) => (
                    <MenuItem key={venue._id} value={venue._id}>
                      <Checkbox checked={formData.venues.includes(venue._id)} />
                      <ListItemText primary={venue.name} />
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          )}

          {/* Permission */}
          <FormControl fullWidth size="small">
            <InputLabel id="permission-label">Permission *</InputLabel>
            <Select
              labelId="permission-label"
              name="permission"
              value={formData.permission}
              label="Permission *"
              onChange={handleChange}
              disabled={!hasManagePermission}
            >
              {PERMISSION_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={formLoading || !hasManagePermission}
          className={`w-full bg-[#1E64D9] text-white font-semibold py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            formLoading || !hasManagePermission
              ? "opacity-70 cursor-not-allowed"
              : "cursor-pointer hover:bg-[#1557C7]"
          }`}
        >
          {formLoading ? "Creating User..." : "Create User"}
        </button>
      </form>
    </div>
  );
};

export default AddUser;