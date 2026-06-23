// src/slices/DeviceSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

// fetch all devices
export const fetchAllDevices = createAsyncThunk(
  "Devices/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      // if you're using cookie auth, you can omit token here
      if (!token) return rejectWithValue("No authentication token found");

      const res = await fetch(`${BASE}/device/all-devices`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch devices");
      return data; // expect array of devices
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

export const createDevice = createAsyncThunk(
  "Devices/create",
  // async ({ deviceName, venueId, deviceType, category, conditions = [] }, { rejectWithValue }) => {
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue({ message: "No authentication token found" });

      const res = await fetch(`${BASE}/device/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // body: JSON.stringify({ deviceName, venueId, deviceType, category, conditions }),
        body: JSON.stringify({
          ...payload,
          conditions: Array.isArray(payload.conditions) ? payload.conditions : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data || { message: data.message || "Failed to create device" });
      }

      // backend returns { success, message, device: { id, deviceId, deviceName, deviceType, category, apiKey } }
      return data.device;
    } catch (err) {
      return rejectWithValue({ message: err.message || "Network error" });
    }
  }
);


// update device
export const updateDevice = createAsyncThunk(
  "Devices/update",
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("No authentication token found");

      const { id, ...updateData } = payload;

      // Build the request payload with required fields
      const requestPayload = {
        deviceName: updateData.deviceName,
        venueId: updateData.venueId,
        deviceType: updateData.deviceType,
        category: updateData.category,
        conditions: updateData.conditions || [],
      };

      // Only include interval if provided (for trigger devices)
      if (updateData.interval !== undefined && updateData.interval !== null && updateData.interval !== "") {
        requestPayload.interval = Number(updateData.interval);
      }

      // Include alert access fields if provided (for trigger devices)
      if (updateData.tempAlertAccess !== undefined) requestPayload.tempAlertAccess = updateData.tempAlertAccess;
      if (updateData.humiAlertAccess !== undefined) requestPayload.humiAlertAccess = updateData.humiAlertAccess;
      if (updateData.odourAlertAccess !== undefined) requestPayload.odourAlertAccess = updateData.odourAlertAccess;
      if (updateData.aqiAlertAccess !== undefined) requestPayload.aqiAlertAccess = updateData.aqiAlertAccess;
      if (updateData.glAlertAccess !== undefined) requestPayload.glAlertAccess = updateData.glAlertAccess;
      if (updateData.voltageAlertAccess !== undefined) requestPayload.voltageAlertAccess = updateData.voltageAlertAccess;
      if (updateData.currentAlertAccess !== undefined) requestPayload.currentAlertAccess = updateData.currentAlertAccess;

      const res = await fetch(`${BASE}/device/update/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestPayload),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || data || "Failed to update device");

      // backend returns { success, message, device }
      return data.device;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);



// delete device
export const deleteDevice = createAsyncThunk(
  "Devices/delete",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("No authentication token found");

      const res = await fetch(`${BASE}/device/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to delete device");

      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);


export const fetchDevicesByVenue = createAsyncThunk(
  "Devices/fetchByVenue",
  async (venueId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("No authentication token found");

      const res = await fetch(`${BASE}/device/get-by-venue/${venueId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch devices");

      // backend returns { devices: [...] }
      return { venueId, devices: data.devices || [] };
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// fetch single device with populated venue and organization
export const fetchSingleDevice = createAsyncThunk(
  "Devices/fetchSingle",
  async (deviceId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("No authentication token found");

      const res = await fetch(`${BASE}/device/single/${deviceId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch device");

      // backend returns { success, device }
      return data.device;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);


const DeviceSlice = createSlice({
  name: "Device",
  initialState: {
    Devices: [],     // array of deviceId strings (device.deviceId)
    DeviceArray: [], // full device objects
    isLoading: false,
    error: null,
    devicesByVenue: {},
  },
  reducers: {
    setDevices: (state, action) => {
      state.DeviceArray = action.payload;
      state.Devices = action.payload.map((d) => d.deviceId);
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAllDevices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllDevices.fulfilled, (state, action) => {
        state.isLoading = false;
        const arr = Array.isArray(action.payload) ? action.payload : [];
        state.DeviceArray = arr;
        state.Devices = arr.map((d) => d.deviceId);
      })
      .addCase(fetchAllDevices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || "Failed to fetch devices";
        state.DeviceArray = [];
        state.Devices = [];
      })

      // create
      .addCase(createDevice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDevice.fulfilled, (state, action) => {
        state.isLoading = false;
        const device = action.payload;
        state.DeviceArray = [device, ...state.DeviceArray];
        // keep unique deviceIds
        state.Devices = Array.from(new Set([device.deviceId, ...state.Devices]));
      })
      .addCase(createDevice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || "Failed to create device";
      })

      // update
      .addCase(updateDevice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDevice.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload;
        state.DeviceArray = state.DeviceArray.map((d) => (d._id === updated._id ? updated : d));
        state.Devices = state.DeviceArray.map((d) => d.deviceId);
      })
      .addCase(updateDevice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || "Failed to update device";
      })

      // delete
      .addCase(deleteDevice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDevice.fulfilled, (state, action) => {
        state.isLoading = false;
        const removedId = action.payload;
        state.DeviceArray = state.DeviceArray.filter((d) => d._id !== removedId);
        state.Devices = state.DeviceArray.map((d) => d.deviceId);
      })
      .addCase(deleteDevice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || "Failed to delete device";
      })
      // fetchDevicesByVenue cases
      .addCase(fetchDevicesByVenue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDevicesByVenue.fulfilled, (state, action) => {
        state.isLoading = false;
        const { venueId, devices } = action.payload || {};
        if (venueId) {
          state.devicesByVenue[venueId] = Array.isArray(devices) ? devices : [];
        }
      })
      .addCase(fetchDevicesByVenue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || "Failed to fetch devices for venue";
      });
  },
});

export const { setDevices } = DeviceSlice.actions;
export default DeviceSlice.reducer;
