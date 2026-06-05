
// src/slices/alertsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

/**
 * normalizeVenue - make a stable shape for UI/reducers
 */
const normalizeVenue = (v = {}) => {
  const venueId = String(v.venueId ?? v._id ?? (v.venue?._id) ?? "");
  const venueName = v.venueName ?? v.name ?? (v.venue?.name) ?? "Unknown Venue";

  const tempArr = Array.isArray(v.temperatureAlertDevices) ? v.temperatureAlertDevices : [];
  const humidityArr = Array.isArray(v.humidityAlertDevices) ? v.humidityAlertDevices : [];
  const odourArr = Array.isArray(v.odourAlertDevices) ? v.odourAlertDevices : [];
  const aqiArr = Array.isArray(v.aqiAlertDevices) ? v.aqiAlertDevices : [];
  const glArr = Array.isArray(v.glAlertDevices) ? v.glAlertDevices : [];

  const makeDevice = (d) => ({
    id: d.deviceId ?? d.id ?? d._id ?? d.name ?? "unknown-id",
    name: d.name ?? d.deviceId ?? d.id ?? d._id ?? "Unknown Device",
    date: d.date ?? d.timestamp ?? null,
    temperature: d.temperature ?? d.espTemprature ?? d.AmbientData?.temperature ?? null,
    humidity: d.humidity ?? d.espHumidity ?? d.AmbientData?.humidity ?? null,
    odour: d.odour ?? d.espOdour ?? null,
    AQI: d.AQI ?? d.espAQI ?? null,
    gass: d.gass ?? d.espGL ?? null,
  });

  const temperatureAlertDevices = tempArr.map(makeDevice);
  const humidityAlertDevices = humidityArr.map(makeDevice);
  const odourAlertDevices = odourArr.map(makeDevice);
  const aqiAlertDevices = aqiArr.map(makeDevice);
  const glAlertDevices = glArr.map(makeDevice);

  const temperatureAlertCount = Number(v.temperatureAlertCount ?? temperatureAlertDevices.length ?? 0) || 0;
  const humidityAlertCount = Number(v.humidityAlertCount ?? humidityAlertDevices.length ?? 0) || 0;
  const odourAlertCount = Number(v.odourAlertCount ?? odourAlertDevices.length ?? 0) || 0;
  const aqiAlertCount = Number(v.aqiAlertCount ?? aqiAlertDevices.length ?? 0) || 0;
  const glAlertCount = Number(v.glAlertCount ?? glAlertDevices.length ?? 0) || 0;

  const totalAlerts =
    Number(v.totalAlerts ?? 0) ||
    (temperatureAlertCount + humidityAlertCount + odourAlertCount + aqiAlertCount + glAlertCount) || 0;

  return {
    venueId,
    venueName,
    totalDevices: Number(v.totalDevices ?? 0) || 0,
    totalAlerts,
    temperatureAlertCount,
    temperatureAlertDevices,
    humidityAlertCount,
    humidityAlertDevices,
    odourAlertCount,
    odourAlertDevices,
    aqiAlertCount,
    aqiAlertDevices,
    glAlertCount,
    glAlertDevices,
  };
};

/**
 * Thunk: fetch alerts for an organization
 */
export const fetchAlertsByOrg = createAsyncThunk(
  "alerts/fetchByOrg",
  async (organizationId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/alert/${organizationId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch alerts");

      const rawVenues = Array.isArray(data) ? data : data.venues ?? data.payload ?? [];

      return { organizationId, venues: rawVenues };
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

const initialState = {
  byOrg: {},
};

const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    /**
     * deviceDataReceived
     * payload: { organizationId, device }
     * This is used for real-time updates (merge single device)
     */
    deviceDataReceived(state, action) {
      const { organizationId, device } = action.payload || {};
      if (!organizationId || !device) return;

      if (!state.byOrg[organizationId]) {
        state.byOrg[organizationId] = { venues: [], loading: false, error: null, unassigned: [] };
      }

      const org = state.byOrg[organizationId];
      const deviceId = device.deviceId ?? device.id ?? device._id ?? null;
      if (!deviceId) return;

      // find venue by venueId or existing device membership
      let targetIndex = -1;
      if (device.venueId) {
        targetIndex = org.venues.findIndex((vv) => String(vv.venueId) === String(device.venueId));
      }
      if (targetIndex === -1) {
        targetIndex = org.venues.findIndex((vv) =>
          (vv.temperatureAlertDevices || []).some((d) => String(d.id) === String(deviceId)) ||
          (vv.humidityAlertDevices || []).some((d) => String(d.id) === String(deviceId)) ||
          (vv.odourAlertDevices || []).some((d) => String(d.id) === String(deviceId)) ||
          (vv.aqiAlertDevices || []).some((d) => String(d.id) === String(deviceId)) ||
          (vv.glAlertDevices || []).some((d) => String(d.id) === String(deviceId))
        );
      }

      const makeDeviceEntry = () => ({
        id: deviceId,
        name: device.name ?? deviceId,
        date: device.timestamp ?? device.date ?? null,
        temperature: device.temperature ?? device.espTemprature ?? device.AmbientData?.temperature ?? null,
        humidity: device.humidity ?? device.espHumidity ?? device.AmbientData?.humidity ?? null,
        odour: device.odour ?? device.espOdour ?? null,
        AQI: device.AQI ?? device.espAQI ?? null,
        gass: device.gass ?? device.espGL ?? null,
      });

      const updateVenueAlerts = (vv) => {
        const tempDevices = Array.isArray(vv.temperatureAlertDevices) ? vv.temperatureAlertDevices.slice() : [];
        const humidityDevices = Array.isArray(vv.humidityAlertDevices) ? vv.humidityAlertDevices.slice() : [];
        const odourDevices = Array.isArray(vv.odourAlertDevices) ? vv.odourAlertDevices.slice() : [];
        const aqiDevices = Array.isArray(vv.aqiAlertDevices) ? vv.aqiAlertDevices.slice() : [];
        const glDevices = Array.isArray(vv.glAlertDevices) ? vv.glAlertDevices.slice() : [];

        const tempIdx = tempDevices.findIndex((d) => String(d.id) === String(deviceId));
        const humidityIdx = humidityDevices.findIndex((d) => String(d.id) === String(deviceId));
        const odourIdx = odourDevices.findIndex((d) => String(d.id) === String(deviceId));
        const aqiIdx = aqiDevices.findIndex((d) => String(d.id) === String(deviceId));
        const glIdx = glDevices.findIndex((d) => String(d.id) === String(deviceId));

        // Helper to upsert entry
        const upsert = (arr, idx, entry) => {
          if (idx === -1) arr.unshift(entry);
          else arr[idx] = { ...arr[idx], ...entry };
        };

        // temperature alert handling
        const tempIsAlert = device.temperatureAlert === "ALERT" || device.temperatureAlert === true;
        if (tempIsAlert) upsert(tempDevices, tempIdx, makeDeviceEntry());
        else if (tempIdx !== -1 && device.temperatureAlert === false) tempDevices.splice(tempIdx, 1);
        else if (tempIdx !== -1) tempDevices[tempIdx] = { ...tempDevices[tempIdx], ...makeDeviceEntry() };

        // humidity alert handling
        const humidityIsAlert = device.humidityAlert === "ALERT" || device.humidityAlert === true;
        if (humidityIsAlert) upsert(humidityDevices, humidityIdx, makeDeviceEntry());
        else if (humidityIdx !== -1 && device.humidityAlert === false) humidityDevices.splice(humidityIdx, 1);
        else if (humidityIdx !== -1) humidityDevices[humidityIdx] = { ...humidityDevices[humidityIdx], ...makeDeviceEntry() };

        // odour alert handling
        const odourIsAlert = device.odourAlert === "ALERT" || device.odourAlert === true;
        if (odourIsAlert) upsert(odourDevices, odourIdx, makeDeviceEntry());
        else if (odourIdx !== -1 && device.odourAlert === false) odourDevices.splice(odourIdx, 1);
        else if (odourIdx !== -1) odourDevices[odourIdx] = { ...odourDevices[odourIdx], ...makeDeviceEntry() };

        // AQI alert handling
        const aqiIsAlert = device.aqiAlert === "ALERT" || device.aqiAlert === true;
        if (aqiIsAlert) upsert(aqiDevices, aqiIdx, makeDeviceEntry());
        else if (aqiIdx !== -1 && device.aqiAlert === false) aqiDevices.splice(aqiIdx, 1);
        else if (aqiIdx !== -1) aqiDevices[aqiIdx] = { ...aqiDevices[aqiIdx], ...makeDeviceEntry() };

        // Gas/leakage alert handling
        const glIsAlert = device.glAlert === "ALERT" || device.glAlert === true;
        if (glIsAlert) upsert(glDevices, glIdx, makeDeviceEntry());
        else if (glIdx !== -1 && device.glAlert === false) glDevices.splice(glIdx, 1);
        else if (glIdx !== -1) glDevices[glIdx] = { ...glDevices[glIdx], ...makeDeviceEntry() };

        return {
          ...vv,
          temperatureAlertDevices: tempDevices,
          temperatureAlertCount: tempDevices.length,
          humidityAlertDevices: humidityDevices,
          humidityAlertCount: humidityDevices.length,
          odourAlertDevices: odourDevices,
          odourAlertCount: odourDevices.length,
          aqiAlertDevices: aqiDevices,
          aqiAlertCount: aqiDevices.length,
          glAlertDevices: glDevices,
          glAlertCount: glDevices.length,
          totalAlerts: tempDevices.length + humidityDevices.length + odourDevices.length + aqiDevices.length + glDevices.length,
        };
      };

      if (targetIndex !== -1) {
        org.venues[targetIndex] = updateVenueAlerts(org.venues[targetIndex]);
      } else {
        const entry = makeDeviceEntry();
        const unassigned = org.unassigned || [];
        const existingIdx = unassigned.findIndex((u) => u.id === deviceId);
        if (existingIdx !== -1) {
          unassigned[existingIdx] = { ...unassigned[existingIdx], ...entry };
        } else {
          unassigned.unshift({
            id: deviceId,
            ...entry,
            temperatureAlert: device.temperatureAlert,
            humidityAlert: device.humidityAlert,
            odourAlert: device.odourAlert,
            aqiAlert: device.aqiAlert,
            glAlert: device.glAlert,
          });
        }
        org.unassigned = unassigned;
      }
    },

    clearOrgAlerts(state, action) {
      const orgId = action.payload;
      if (orgId && state.byOrg[orgId]) {
        delete state.byOrg[orgId];
      }
    },

    upsertVenue(state, action) {
      const { organizationId, rawVenue } = action.payload || {};
      if (!organizationId || !rawVenue) return;
      if (!state.byOrg[organizationId]) state.byOrg[organizationId] = { venues: [], loading: false, error: null, unassigned: [] };
      const norm = normalizeVenue(rawVenue);
      const idx = state.byOrg[organizationId].venues.findIndex((v) => v.venueId === norm.venueId);
      if (idx === -1) state.byOrg[organizationId].venues.unshift(norm);
      else state.byOrg[organizationId].venues[idx] = norm;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlertsByOrg.pending, (state, action) => {
        const orgId = action.meta.arg;
        if (!state.byOrg[orgId]) state.byOrg[orgId] = { venues: [], loading: true, error: null, unassigned: [] };
        else {
          state.byOrg[orgId].loading = true;
          state.byOrg[orgId].error = null;
        }
      })
      .addCase(fetchAlertsByOrg.fulfilled, (state, action) => {
        const { organizationId, venues } = action.payload || {};
        if (!organizationId) return;
        const normalized = Array.isArray(venues) ? venues.map(normalizeVenue) : [];
        state.byOrg[organizationId] = { venues: normalized, loading: false, error: null, unassigned: [] };
      })
      .addCase(fetchAlertsByOrg.rejected, (state, action) => {
        const orgId = action.meta.arg;
        if (!state.byOrg[orgId]) state.byOrg[orgId] = { venues: [], loading: false, error: action.payload || action.error?.message || "Failed to fetch alerts", unassigned: [] };
        else {
          state.byOrg[orgId].loading = false;
          state.byOrg[orgId].error = action.payload || action.error?.message || "Failed to fetch alerts";
        }
      });
  },
});

export const { deviceDataReceived, clearOrgAlerts, upsertVenue } = alertsSlice.actions;
export default alertsSlice.reducer;
