// src/pages/management/DeviceManagement/AddDevice.jsx
import { useEffect, useState } from "react";
import { Box, Building, Thermometer } from "lucide-react";
import InputField from "../../../components/Inputs/InputField";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrganizationsByOwner, fetchOrganizationsByUser } from "../../../slices/OrganizationSlice";
import { fetchVenuesByOrganization } from "../../../slices/VenueSlice";
import { createDevice, fetchDevicesByVenue } from "../../../slices/DeviceSlice";
import { useDeviceManagement } from "../../../contexts/DeviceManagementContext";
import Swal from "sweetalert2";
import { Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Checkbox, FormControlLabel } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { canManage } from "../../../utils/permissions";
import "../../../styles/pages/management-pages.css";

// Backend device types and their required conditions
const DEVICE_CONDITIONS_MAP = {
  OD: ["temperature", "humidity", "odour"],
  THD: ["temperature", "humidity"],
  AQID: ["temperature", "humidity", "AQI"],
  GLD: ["temperature", "humidity", "gass"],
  ED: ["temperature", "humidity", "voltage", "current"],
};

const CONDITION_LABEL = {
  temperature: "Temperature",
  humidity: "Humidity",
  odour: "Odour",
  AQI: "AQI",
  gass: "Leakage",
  voltage: "Voltage",
  current: "Current",
};

const CONDITION_UNIT = {
  temperature: "°C",
  humidity: "%",
  odour: "%",
  AQI: "AQI",
  gass: "%",
  voltage: "V",
  current: "A",
};

const DEVICE_TYPE_LABEL = {
  OD: "Odour Device (OD)",
  THD: "Temperature Humidity Device (THD)",
  AQID: "Air Quality Index Device (AQID)",
  GLD: "Gas Leakage Device (GLD)",
  ED: "Energy Device (ED)",
};

const CATEGORY_LABEL = {
  monitoring: "Monitoring",
  scheduling: "Scheduling",
  trigger: "Trigger",
};

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

const makeConditionsFor = (deviceType) => {
  const types = DEVICE_CONDITIONS_MAP[deviceType] || ["temperature", "humidity"];
  return types.map((t) => ({
    id: t,
    type: t,
    label: CONDITION_LABEL[t] || t,
    operator: t === "voltage" || t === "current" ? "=" : ">",
    value: "",
  }));
};

// Get available alert access fields for each device type
const ALERT_ACCESS_MAP = {
  OD: ["tempAlertAccess", "humiAlertAccess", "odourAlertAccess"],
  THD: ["tempAlertAccess", "humiAlertAccess"],
  AQID: ["tempAlertAccess", "humiAlertAccess", "aqiAlertAccess"],
  GLD: ["tempAlertAccess", "humiAlertAccess", "glAlertAccess"],
  ED: ["tempAlertAccess", "humiAlertAccess", "voltageAlertAccess", "currentAlertAccess"],
};

const ALERT_ACCESS_LABELS = {
  tempAlertAccess: "Temperature Alert",
  humiAlertAccess: "Humidity Alert",
  odourAlertAccess: "Odour Alert",
  aqiAlertAccess: "AQI Alert",
  glAlertAccess: "Gas Leakage Alert",
  voltageAlertAccess: "Voltage Alert",
  currentAlertAccess: "Current Alert",
};

const AddDevice = () => {
  const { user } = useSelector((state) => state.auth);
  const hasManagePermission = canManage(user);

  // Get context to check if created device belongs to currently filtered venue
  const { selectedVenueIdFromDeviceFilter } = useDeviceManagement();

  const [formData, setFormData] = useState({
    deviceName: "",
    organization: "",
    venue: "",
    deviceType: "",
    category: "",
  });

  const [alertAccess, setAlertAccess] = useState({
    tempAlertAccess: false,
    humiAlertAccess: false,
    odourAlertAccess: false,
    aqiAlertAccess: false,
    glAlertAccess: false,
    voltageAlertAccess: false,
    currentAlertAccess: false,
  });

  const dispatch = useDispatch();
  const { Organizations = [], isLoading: orgsLoading, error: orgError } = useSelector(
    (s) => s.Organization || {}
  );
  const { loading: venueLoading, error: venueError, venuesByOrg = {} } =
    useSelector((s) => s.Venue || {});

  const isManager = user?.role === "manager";

  // Fetch organizations based on user role
  useEffect(() => {
    if (!user?.id) return;

    if (user.role === "manager") {
      dispatch(fetchOrganizationsByOwner(user.id));
    } else if (user.role === "user") {
      dispatch(fetchOrganizationsByUser());
    }
  }, [dispatch, user]);

  // Get available venues based on role
  const availableVenues = (() => {
    if (!formData.organization) return [];

    if (isManager) {
      // Manager: Use venues from API
      return venuesByOrg[formData.organization] ?? [];
    } else {
      // User: Filter assigned venues by organization
      const userVenues = user?.venues || [];
      return userVenues
        .filter((v) => v.organization?.id === formData.organization)
        .map((v) => ({
          _id: v.venueId,
          name: v.venueName,
          organization: formData.organization,
        }));
    }
  })();

  const [conditions, setConditions] = useState(makeConditionsFor("THD"));
  const [createdDevice, setCreatedDevice] = useState(null);
  const [deviceLoading, setDeviceLoading] = useState(false);

  useEffect(() => {
    if (formData.organization && isManager) {
      // Only managers fetch venues from API
      dispatch(fetchVenuesByOrganization(formData.organization));
    }
    // Users use their assigned venues from user.venues
  }, [formData.organization, dispatch, isManager]);

  useEffect(() => {
    if (formData.deviceType) {
      setConditions(makeConditionsFor(formData.deviceType));
      // Reset alert access when device type changes
      setAlertAccess({
        tempAlertAccess: false,
        humiAlertAccess: false,
        odourAlertAccess: false,
        aqiAlertAccess: false,
        glAlertAccess: false,
        voltageAlertAccess: false,
        currentAlertAccess: false,
      });
    } else {
      setConditions(makeConditionsFor("THD"));
    }
  }, [formData.deviceType]);

  const [condModalOpen, setCondModalOpen] = useState(false);
  useEffect(() => {
    if (formData.deviceType) {
      setCondModalOpen(true);
    }
  }, [formData.deviceType]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "organization") {
      setFormData((prev) => ({ ...prev, organization: value, venue: "" }));
      return;
    }

    if (name === "deviceType") {
      setFormData((prev) => ({ ...prev, deviceType: value }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConditionChange = (index, key, value) => {
    setConditions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const handleAlertAccessChange = (field) => {
    setAlertAccess((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSaveDevice = async () => {
    if (!formData.deviceName?.trim()) {
      return Swal.fire({ icon: "warning", title: "Enter Device Name" });
    }
    if (!formData.organization) {
      return Swal.fire({ icon: "warning", title: "Select Organization" });
    }
    if (!formData.venue) {
      return Swal.fire({ icon: "warning", title: "Select Venue" });
    }
    if (!formData.deviceType) {
      return Swal.fire({ icon: "warning", title: "Select Device Type" });
    }
    if (!formData.category) {
      return Swal.fire({ icon: "warning", title: "Select Category" });
    }

    const payloadConditions = Array.isArray(conditions)
      ? conditions.map((c) => ({
          type: c.type,
          operator: (c.operator || "").toString().trim(),
          value: c.value === "" || c.value === undefined ? "" : c.value,
        }))
      : [];

    const filtered = payloadConditions.filter((c) => c.type && c.operator && c.value !== "");

    const requiredTypes = DEVICE_CONDITIONS_MAP[formData.deviceType] || ["temperature", "humidity"];
    const providedTypes = filtered.map((c) => c.type);
    for (const t of requiredTypes) {
      if (!providedTypes.includes(t)) {
        return Swal.fire({
          icon: "warning",
          title: "Missing condition",
          text: `${DEVICE_TYPE_LABEL[formData.deviceType]} requires "${CONDITION_LABEL[t] || t}" condition.`,
        });
      }
    }

    const validTypes = ["temperature", "humidity", "odour", "AQI", "gass", "voltage", "current"];
    const validOps = [">", "<", "="];

    for (const c of filtered) {
      if ((c.type === "voltage" || c.type === "current") && c.operator !== "=") {
        return Swal.fire({
          icon: "warning",
          title: "Invalid operator",
          text: `${CONDITION_LABEL[c.type]} condition only supports '=' operator.`,
        });
      }

      if (!validTypes.includes(c.type)) {
        return Swal.fire({
          icon: "warning",
          title: "Invalid condition type",
          text: `Type "${c.type}" not allowed`,
        });
      }

      if (!validOps.includes(c.operator)) {
        return Swal.fire({
          icon: "warning",
          title: "Invalid operator",
          text: `Operator "${c.operator}" not allowed. Use >, <, or =`,
        });
      }

      const num = Number(c.value);
      if (!Number.isFinite(num)) {
        return Swal.fire({
          icon: "warning",
          title: "Invalid condition value",
          text: `Value for ${CONDITION_LABEL[c.type] || c.type} must be a number.`,
        });
      }
      c.value = num;
    }

    const finalConditions = filtered;

    const payload = {
      deviceName: formData.deviceName.trim(),
      venueId: formData.venue,
      deviceType: formData.deviceType,
      category: formData.category,
      conditions: finalConditions,
    };

    // Add alert access fields for trigger category
    if (formData.category === "trigger") {
      payload.tempAlertAccess = alertAccess.tempAlertAccess;
      payload.humiAlertAccess = alertAccess.humiAlertAccess;
      payload.odourAlertAccess = alertAccess.odourAlertAccess;
      payload.aqiAlertAccess = alertAccess.aqiAlertAccess;
      payload.glAlertAccess = alertAccess.glAlertAccess;
      payload.voltageAlertAccess = alertAccess.voltageAlertAccess;
      payload.currentAlertAccess = alertAccess.currentAlertAccess;
    }

    setDeviceLoading(true);

    console.log('payload:<>', payload);

    try {
      const device = await dispatch(
        createDevice(payload)
      ).unwrap();

      setCreatedDevice(device);
      Swal.fire({ icon: "success", title: "Device Created" });
      // console.log('payload:<>', Devi);
    
      // Only refresh device list if created device belongs to currently filtered venue
      // Compare formData.venue (created device's venue._id) with selectedVenueIdFromDeviceFilter (filter's venue._id)
      
      console.log("Created device venue:", formData.venue);
      console.log("Currently filtered venue:", selectedVenueIdFromDeviceFilter);
      
      if (formData.venue === selectedVenueIdFromDeviceFilter) {
        dispatch(fetchDevicesByVenue(formData.venue));
      }

      setFormData({ deviceName: "", organization: "", venue: "", deviceType: "", category: "" });
      setConditions(makeConditionsFor("THD"));
      setAlertAccess({
        tempAlertAccess: false,
        humiAlertAccess: false,
        odourAlertAccess: false,
        aqiAlertAccess: false,
        glAlertAccess: false,
        voltageAlertAccess: false,
        currentAlertAccess: false,
      });
      setCondModalOpen(false);
    } catch (err) {
      console.error("Create device error:", err);
      const text = (err && (err.message || err)) || "Something went wrong while creating device";
      Swal.fire({ icon: "error", title: "Create failed", text });
    } finally {
      setDeviceLoading(false);
    }
  };

  const handleCopyApiKey = () => {
    if (!createdDevice?.apiKey) return;

    navigator.clipboard.writeText(createdDevice.apiKey)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Copied!",
          timer: 1200,
          width: 150,
          showConfirmButton: false,
          position: "top-end",
          toast: true,
          customClass: { popup: "small-toast" },
        });
      })
      .catch(() => {
        Swal.fire({ icon: "error", title: "Copy failed" });
      });
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#EEF3F9] rounded-xl shadow-sm w-full md:flex flex-col justify-center border border-[#E5E7EB]">
      <div className="AddingPage device-add-container w-full">
      <h2 className="device-add-title font-semibold mb-1 text-center">Add Device</h2>
      <p className="device-add-subtitle text-gray-500 mb-6 text-center">
        {hasManagePermission
          ? "Welcome back! Fill in device details"
          : "View Only Mode - Forms are disabled"
        }
      </p>

      <div className={`space-y-4 mx-auto  md:w-[70%] px-4 ${!hasManagePermission ? 'opacity-60 pointer-events-none' : ''}`}>
        <InputField
          id="deviceName"
          name="deviceName"
          label="Device Name"
          type="text"
          value={formData.deviceName}
          onchange={handleChange}
          placeholder="Device Name"
          icon={<Box size={20} />}
          disabled={!hasManagePermission}
        />

        <div className="relative">
          <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-30" size={20} />
          <FormControl fullWidth>
            <Select
              displayEmpty
              value={formData.organization}
              onChange={handleChange}
              inputProps={{ name: "organization" }}
              MenuProps={menuProps}
              disabled={!hasManagePermission}
              sx={{ pl: "1.5rem", height: SELECT_HEIGHT, backgroundColor: "white", borderRadius: "0.375rem" }}
              renderValue={(selected) => {
                if (!selected) return <span className="text-gray-500">Select an organization</span>;
                const org = Organizations.find((o) => String(o._id ?? o.id) === String(selected));
                return org?.name ?? selected;
              }}
            >
              {orgsLoading ? (
                <MenuItem disabled sx={{ height: ITEM_HEIGHT }}>Loading orgs...</MenuItem>
              ) : orgError ? (
                <MenuItem disabled sx={{ height: ITEM_HEIGHT }}>{String(orgError)}</MenuItem>
              ) : Organizations.length === 0 ? (
                <MenuItem disabled sx={{ height: ITEM_HEIGHT }}>No organizations</MenuItem>
              ) : (
                Organizations.map((org, idx) => {
                  const id = org._id ?? org.id ?? idx;
                  return (
                    <MenuItem key={id} value={id} sx={{ height: ITEM_HEIGHT, display: "flex", alignItems: "center" }}>
                      {org.name}
                    </MenuItem>
                  );
                })
              )}
            </Select>
          </FormControl>
        </div>

        {formData.organization && (
          <div className="relative">
            <FormControl fullWidth>
              <Select
                displayEmpty
                value={formData.venue}
                onChange={handleChange}
                inputProps={{ name: "venue" }}
                MenuProps={menuProps}
                disabled={!hasManagePermission}
                sx={{ pl: "1.5rem", height: SELECT_HEIGHT, backgroundColor: "white", borderRadius: "0.375rem" }}
                renderValue={(selected) => {
                  if (!selected) return <span className="text-gray-500">Select a venue</span>;
                  const v = (availableVenues || []).find((x) => String(x._id ?? x.id) === String(selected));
                  return v?.name ?? selected;
                }}
              >
                {venueLoading ? (
                  <MenuItem disabled sx={{ height: ITEM_HEIGHT }}>Loading venues...</MenuItem>
                ) : venueError ? (
                  <MenuItem disabled sx={{ height: ITEM_HEIGHT }}>{String(venueError)}</MenuItem>
                ) : (availableVenues || []).length === 0 ? (
                  <MenuItem disabled sx={{ height: ITEM_HEIGHT }}>No venues for this organization</MenuItem>
                ) : (
                  (availableVenues || []).map((venue, index) => {
                    const id = venue._id ?? venue.id ?? index;
                    const name = venue.name ?? `Venue ${index + 1}`;
                    return (
                      <MenuItem key={id} value={id} sx={{ height: ITEM_HEIGHT, display: "flex", alignItems: "center" }}>
                        {name}
                      </MenuItem>
                    );
                  })
                )}
              </Select>
            </FormControl>
          </div>
        )}

        {formData.venue && (
          <>
            <div>
              <FormControl fullWidth>
                <InputLabel id="device-type-label">Device Type</InputLabel>
                <Select
                  labelId="device-type-label"
                  value={formData.deviceType || ""}
                  label="Device Type"
                  name="deviceType"
                  onChange={handleChange}
                  MenuProps={menuProps}
                  disabled={!hasManagePermission}
                  sx={{ height: SELECT_HEIGHT, borderRadius: "0.375rem" }}
                >
                  <MenuItem value="">Select Device Type</MenuItem>
                  <MenuItem value="OD">{DEVICE_TYPE_LABEL.OD}</MenuItem>
                  <MenuItem value="THD">{DEVICE_TYPE_LABEL.THD}</MenuItem>
                  <MenuItem value="AQID">{DEVICE_TYPE_LABEL.AQID}</MenuItem>
                  <MenuItem value="GLD">{DEVICE_TYPE_LABEL.GLD}</MenuItem>
                  <MenuItem value="ED">{DEVICE_TYPE_LABEL.ED}</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div>
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={formData.category || ""}
                  label="Category"
                  name="category"
                  onChange={handleChange}
                  MenuProps={menuProps}
                  disabled={!hasManagePermission}
                  sx={{ height: SELECT_HEIGHT, borderRadius: "0.375rem" }}
                >
                  <MenuItem value="">Select Category</MenuItem>
                  <MenuItem value="monitoring">{CATEGORY_LABEL.monitoring}</MenuItem>
                  <MenuItem value="scheduling">{CATEGORY_LABEL.scheduling}</MenuItem>
                  <MenuItem value="trigger">{CATEGORY_LABEL.trigger}</MenuItem>
                </Select>
              </FormControl>
            </div>

            {formData.category === "trigger" && formData.deviceType && (
              <div className="mt-4 p-4 bg-white rounded-md border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Alert Access Configuration</h3>
                <div className="space-y-2">
                  {ALERT_ACCESS_MAP[formData.deviceType]?.map((accessField) => (
                    <FormControlLabel
                      key={accessField}
                      control={
                        <Checkbox
                          checked={alertAccess[accessField]}
                          onChange={() => handleAlertAccessChange(accessField)}
                          disabled={!hasManagePermission}
                          sx={{
                            color: "#1E64D9",
                            "&.Mui-checked": {
                              color: "#1E64D9",
                            },
                          }}
                        />
                      }
                      label={ALERT_ACCESS_LABELS[accessField]}
                      sx={{ display: "flex", alignItems: "center" }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-6">
          <button
            onClick={handleSaveDevice}
            disabled={deviceLoading || !hasManagePermission}
            className={`
              w-full py-2.5 px-4 rounded-md font-semibold text-white
              ${deviceLoading || !hasManagePermission ? "bg-[#1E64D9]/70 cursor-not-allowed" : "bg-[#1E64D9] hover:bg-[#1557C7] cursor-pointer"}
            `}
          >
            {deviceLoading ? "Saving..." : "Save"}
          </button>
        </div>

        {createdDevice?.apiKey && (
          <div className="mt-3 p-3 rounded-md bg-white border border-gray-200 text-sm text-gray-700 break-words px-5">
            <strong>Device Created Successfully!</strong>
            <div className="mt-2 text-sm">
              <strong>Device ID:</strong> {createdDevice.deviceId}
            </div>
            <div className="mt-2">
              <strong>API Key:</strong>
              <div className="flex items-center justify-between">
                <div>
                  <div className="mt-2 text-sm font-mono md:hidden" title={createdDevice.apiKey}>
                    {createdDevice.apiKey ? `${createdDevice.apiKey.slice(0, 15)}...` : ""}
                  </div>
                  <div className="mt-2 text-sm font-mono hidden md:block" title={createdDevice.apiKey}>
                    {createdDevice.apiKey ? `${createdDevice.apiKey.slice(0, 25)}...` : ""}
                  </div>
                </div>
                <img
                  src="/copyicon.svg"
                  alt="Copy API KEY Icon"
                  className="w-[20px] h-[30px] cursor-pointer"
                  onClick={handleCopyApiKey}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      <Dialog open={condModalOpen} onClose={() => setCondModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle className="flex items-center justify-between">
          <span>Configure Conditions</span>
          <IconButton onClick={() => setCondModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <div className="space-y-3">
            {conditions.map((cond, idx) => (
              <div key={cond.id} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={cond.label}
                    readOnly
                    className="w-full pl-9 pr-4 py-2 rounded-md bg-transparent outline-none border-none text-gray-600 text-sm"
                  />
                </div>

                <div className="relative flex-[0.5]">
                  <select
                    value={cond.operator}
                    onChange={(e) => handleConditionChange(idx, "operator", e.target.value)}
                    className="w-full pl-3 pr-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 text-sm"
                    disabled={cond.type === "voltage" || cond.type === "current"}
                  >
                    {cond.type === "voltage" || cond.type === "current" ? (
                      <option value="=">=</option>
                    ) : (
                      <>
                        <option value=">">&gt;</option>
                        <option value="<">&lt;</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="relative flex-[0.6] sm:flex-[1]">
                  <input
                    type="number"
                    placeholder={cond.type === "temperature" ? "25" : cond.type === "AQI" ? "50" : "50"}
                    value={cond.value}
                    onChange={(e) => handleConditionChange(idx, "value", e.target.value)}
                    className="w-full pl-3 pr-10 py-2 rounded-md bg-white border border-gray-300 text-gray-700 text-sm"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                    {CONDITION_UNIT[cond.type] ?? ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setCondModalOpen(false)} variant="outlined">Cancel</Button>
          <Button
            onClick={() => {
              setCondModalOpen(false);
            }}
            variant="contained"
          >
            Save conditions
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddDevice;
