// src/components/Modals/DeviceManagement/EditDeviceModal.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  IconButton
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { Thermometer } from "lucide-react";
import Swal from "sweetalert2";
import { fetchSingleDevice, updateDevice, fetchDevicesByVenue } from "../../../slices/DeviceSlice";
import { fetchOrganizationsByOwner, fetchOrganizationsByUser } from "../../../slices/OrganizationSlice";
import { fetchVenuesByOrganization } from "../../../slices/VenueSlice";

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

const makeConditionsFor = (deviceType, existingConditions = []) => {
  const types = DEVICE_CONDITIONS_MAP[deviceType] || ["temperature", "humidity"];
  return types.map((t) => {
    // Find existing condition value if any
    const existing = existingConditions.find(c => c.type === t);
    return {
      id: t,
      type: t,
      label: CONDITION_LABEL[t] || t,
      operator: existing?.operator || (t === "voltage" || t === "current" ? "=" : ">"),
      value: existing?.value !== undefined ? String(existing.value) : "",
    };
  });
};

const EditDeviceModal = ({ open, onClose, deviceId, currentVenueId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { Organizations = [], isLoading: orgsLoading } = useSelector((s) => s.Organization || {});
  const { venuesByOrg = {}, loading: venueLoading } = useSelector((s) => s.Venue || {});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [condModalOpen, setCondModalOpen] = useState(false);

  const isManager = user?.role === "manager";

  const [formData, setFormData] = useState({
    deviceName: "",
    organization: "",
    venue: "",
    deviceType: "",
    category: "",
    interval: "",
  });

  const [conditions, setConditions] = useState([]);

  // Fetch organizations when modal opens
  useEffect(() => {
    if (open && user?.id) {
      if (user.role === "manager") {
        dispatch(fetchOrganizationsByOwner(user.id));
      } else if (user.role === "user") {
        dispatch(fetchOrganizationsByUser());
      }
    }
  }, [open, dispatch, user]);

  // Fetch device data when modal opens
  useEffect(() => {
    if (open && deviceId) {
      fetchDeviceData();
    }
  }, [open, deviceId]);

  const fetchDeviceData = async () => {
    try {
      setLoading(true);
      const device = await dispatch(fetchSingleDevice(deviceId)).unwrap();

      // Extract organization and venue from populated data
      const orgId = device.venue?.organization?._id || device.venue?.organization;
      const venueId = device.venue?._id || device.venue;

      setFormData({
        deviceName: device.deviceName || "",
        organization: orgId || "",
        venue: venueId || "",
        deviceType: device.deviceType || "",
        category: device.category || "",
        interval: device.interval !== undefined ? String(device.interval) : "",
      });

      // Set conditions based on device type
      setConditions(makeConditionsFor(device.deviceType, device.conditions || []));

      // Fetch venues for the organization (only managers)
      if (orgId && isManager) {
        dispatch(fetchVenuesByOrganization(orgId));
      }
    } catch (err) {
      console.error("Fetch device error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load device data",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "organization") {
      setFormData((prev) => ({ ...prev, organization: value, venue: "" }));
      if (value && isManager) {
        // Only managers fetch venues from API
        dispatch(fetchVenuesByOrganization(value));
      }
      return;
    }

    if (name === "deviceType") {
      setFormData((prev) => ({ ...prev, deviceType: value }));
      // Update conditions when device type changes
      setConditions(makeConditionsFor(value, []));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Get available venues based on role
  const availableVenues = (() => {
    if (!formData.organization) return [];

    if (isManager) {
      // Manager: Use venues from API
      return venuesByOrg[formData.organization] || [];
    } else {
      // User: Filter assigned venues by organization
      const userVenues = user?.venues || [];
      return userVenues
        .filter((v) => v.organization?.id === formData.organization)
        .map((v) => ({
          _id: v.venueId,
          id: v.venueId,
          name: v.venueName,
          organization: formData.organization,
        }));
    }
  })();

  const handleConditionChange = (index, key, value) => {
    setConditions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const handleSave = async () => {
    if (!formData.deviceName?.trim()) {
      return Swal.fire({ icon: "warning", title: "Enter Device Name" });
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

    // Validate interval for trigger devices
    if (formData.category === "trigger") {
      if (!formData.interval || formData.interval === "") {
        return Swal.fire({ icon: "warning", title: "Interval Required", text: "Interval is required for trigger devices" });
      }
      const intervalNum = Number(formData.interval);
      if (!Number.isInteger(intervalNum) || intervalNum < 1) {
        return Swal.fire({ icon: "warning", title: "Invalid Interval", text: "Interval must be a positive integer" });
      }
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

    setSaving(true);
    try {
      await dispatch(
        updateDevice({
          id: deviceId,
          deviceName: formData.deviceName.trim(),
          venueId: formData.venue,
          deviceType: formData.deviceType,
          category: formData.category,
          conditions: finalConditions,
          interval: formData.category === "trigger" ? formData.interval : undefined,
        })
      ).unwrap();

      Swal.fire({
        icon: "success",
        title: "Device Updated",
        timer: 1500,
        showConfirmButton: false,
      });

      // Refresh device list for current venue
      if (currentVenueId) {
        await dispatch(fetchDevicesByVenue(currentVenueId));
      }

      onClose();
    } catch (err) {
      console.error("Update device error:", err);
      const text = (err && (err.message || err)) || "Something went wrong while updating device";
      Swal.fire({ icon: "error", title: "Update failed", text });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle className="flex items-center justify-between">
          <span>Edit Device</span>
          <IconButton onClick={onClose} size="small" disabled={saving}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <CircularProgress />
            </div>
          ) : (
            <div className="space-y-3">
              <TextField
                fullWidth
                label="Device Name"
                value={formData.deviceName}
                onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                size="small"
              />

              <FormControl fullWidth size="small">
                <InputLabel>Organization</InputLabel>
                <Select
                  value={formData.organization}
                  label="Organization"
                  name="organization"
                  onChange={handleChange}
                  disabled={orgsLoading}
                >
                  {Organizations.map((org) => (
                    <MenuItem key={org._id || org.id} value={org._id || org.id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {formData.organization && (
                <FormControl fullWidth size="small">
                  <InputLabel>Venue</InputLabel>
                  <Select
                    value={formData.venue}
                    label="Venue"
                    name="venue"
                    onChange={handleChange}
                    disabled={venueLoading}
                  >
                    {availableVenues.map((venue) => (
                      <MenuItem key={venue._id || venue.id} value={venue._id || venue.id}>
                        {venue.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth size="small">
                <InputLabel>Device Type</InputLabel>
                <Select
                  value={formData.deviceType}
                  label="Device Type"
                  name="deviceType"
                  onChange={handleChange}
                >
                  <MenuItem value="OD">{DEVICE_TYPE_LABEL.OD}</MenuItem>
                  <MenuItem value="THD">{DEVICE_TYPE_LABEL.THD}</MenuItem>
                  <MenuItem value="AQID">{DEVICE_TYPE_LABEL.AQID}</MenuItem>
                  <MenuItem value="GLD">{DEVICE_TYPE_LABEL.GLD}</MenuItem>
                  <MenuItem value="ED">{DEVICE_TYPE_LABEL.ED}</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  name="category"
                  onChange={handleChange}
                >
                  <MenuItem value="monitoring">{CATEGORY_LABEL.monitoring}</MenuItem>
                  <MenuItem value="scheduling">{CATEGORY_LABEL.scheduling}</MenuItem>
                  <MenuItem value="trigger">{CATEGORY_LABEL.trigger}</MenuItem>
                </Select>
              </FormControl>

              {formData.category === "trigger" && (
                <TextField
                  fullWidth
                  label="Interval (seconds)"
                  type="number"
                  value={formData.interval}
                  onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                  size="small"
                  helperText="Required for trigger devices"
                />
              )}

              <Button
                variant="outlined"
                fullWidth
                onClick={() => setCondModalOpen(true)}
                disabled={!formData.deviceType}
              >
                Configure Conditions
              </Button>
            </div>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || loading}
            endIcon={saving ? <CircularProgress size={18} /> : null}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Conditions Modal */}
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
                    placeholder={cond.type === "temperature" ? "25" : "50"}
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
          <Button onClick={() => setCondModalOpen(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditDeviceModal;
