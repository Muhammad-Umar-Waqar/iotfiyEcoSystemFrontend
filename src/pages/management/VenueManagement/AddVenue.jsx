// src/pages/management/VenueManagement/AddVenue.jsx
import { useState, useEffect } from "react";
import { Box as LucideBox } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { createVenue, fetchAllVenues, fetchVenuesByOrganization } from "../../../slices/VenueSlice";
import { fetchOrganizationsByOwner, fetchOrganizationsByUser } from "../../../slices/OrganizationSlice";
import { canManage } from "../../../utils/permissions";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import "../../../styles/pages/management-pages.css";

const AddVenue = () => {
  const [form, setForm] = useState({ name: "", organization: "" });

  const dispatch = useDispatch();
  const { isLoading, Venues = [] } = useSelector((s) => s.Venue || { isLoading: false, Venues: [] });
  const { Organizations = [] } = useSelector((s) => s.Organization || { Organizations: [] });
  const { user } = useSelector((state) => state.auth);
  const hasManagePermission = canManage(user);

  const [formLoading, setFormLoading] = useState(false);

  const SELECT_HEIGHT = 48;
  const ITEM_HEIGHT = 48;
  const VISIBLE_ITEMS = 4;

  const menuProps = {
    PaperProps: {
      sx: {
        maxHeight: ITEM_HEIGHT * VISIBLE_ITEMS,
        mt: 1,
      },
    },
    MenuListProps: {
      disablePadding: true,
    },
  };

  useEffect(() => {
    if (!user?.id) return;

    // Fetch organizations based on role
    if (user.role === "manager") {
      dispatch(fetchOrganizationsByOwner(user.id));
    } else if (user.role === "user") {
      dispatch(fetchOrganizationsByUser());
    }

    dispatch(fetchAllVenues());
  }, [dispatch, user]);

  const onchange = (e) => {
    if (!hasManagePermission) return;
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleVenue = async (e) => {
    e.preventDefault();

    if (!hasManagePermission) {
      Swal.fire({
        icon: "warning",
        title: "Permission Denied",
        text: "You don't have permission to create venues."
      });
      return;
    }

    const name = (form.name || "").trim();
    const organization = form.organization;

    if (!name || !organization) {
      return Swal.fire({ icon: "warning", title: "Missing field", text: "Name and organization are required." });
    }

    setFormLoading(true);
    try {
      const created = await dispatch(createVenue({ name, organization })).unwrap();

      Swal.fire({ icon: "success", title: "Created", text: `Venue "${created.name}" created.` });
      setForm({ name: "", organization: "" });

      await dispatch(fetchAllVenues());

      if (organization) {
        dispatch(fetchVenuesByOrganization(organization)).catch(() => {});
      }

      window.dispatchEvent(new Event("venue:updated"));
    } catch (err) {
      Swal.fire({ icon: "error", title: "Create failed", text: err || "Unable to create venue." });
      console.error("create venue error:", err);
    } finally {
      setFormLoading(false);
    }
  };

  return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#EEF3F9] rounded-xl shadow-sm w-full md:flex flex-col justify-center  border border-[#E5E7EB]">
      
    <div className="AddingPage venue-add-container ">
      <h2 className="venue-add-title font-semibold mb-1 text-center">Add Venues</h2>
      <p className="venue-add-subtitle text-gray-500 mb-6 text-center">
        {hasManagePermission
          ? "Welcome back! Select method to add venue"
          : "View Only Mode - Forms are disabled"
        }
      </p>

      <form className={`space-y-4 max-w-sm mx-auto w-full ${!hasManagePermission ? 'opacity-60 pointer-events-none' : ''}`} onSubmit={handleVenue}>
        <div className="relative bg-white">
          <LucideBox className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            name="name"
            placeholder="Enter venue name"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.name}
            onChange={onchange}
            disabled={!hasManagePermission}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Select Organization</label>

          <div className="relative">
            <img
              src="/OrganizationChecklist.svg"
              alt="org icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 h-[25px] w-[25px] pointer-events-none"
            />

            <FormControl fullWidth>
              <Select
                displayEmpty
                value={form.organization}
                onChange={onchange}
                inputProps={{ name: "organization" }}
                MenuProps={menuProps}
                disabled={!hasManagePermission}
                renderValue={(selected) => {
                  if (!selected) return <span className="text-gray-500">Select Organization</span>;
                  const org = Organizations?.find((o) => (o._id ?? o.id) === selected);
                  return org?.name ?? selected;
                }}
                sx={{
                  pl: "1.5rem",
                  height: `${SELECT_HEIGHT}px`,
                  backgroundColor: "white",
                  borderRadius: "0.375rem",
                }}
              >
                {(Organizations || []).length === 0 ? (
                  <MenuItem disabled sx={{ height: ITEM_HEIGHT }}>
                    No organizations found
                  </MenuItem>
                ) : (
                  (Organizations || []).map((org) => {
                    const id = org._id ?? org.id;
                    return (
                      <MenuItem key={id} value={id} sx={{ height: ITEM_HEIGHT }}>
                        {org.name}
                      </MenuItem>
                    );
                  })
                )}
              </Select>
            </FormControl>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full bg-[#1E64D9] text-white font-semibold py-2.5 px-4 rounded-md transition duration-300 shadow-md ${
            (formLoading || !hasManagePermission) ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:bg-[#1557C7]"
          }`}
          disabled={formLoading || !hasManagePermission}
        >
          {formLoading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
    </div>
  );
};

export default AddVenue;
