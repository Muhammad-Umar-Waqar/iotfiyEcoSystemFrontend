// src/slices/OrganizationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

// fetch all orgs
export const fetchAllOrganizations = createAsyncThunk(
  "Organizations/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("No authentication token found");

      const res = await fetch(`${BASE}/organization/all`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch organizations");
      // backend returns { success, count, organizations }
      return data.organizations || [];
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// create organization
export const createOrganization = createAsyncThunk(
  "Organizations/create",
  async (name, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("No authentication token found");

      const res = await fetch(`${BASE}/organization/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to create organization");

      // backend returns { success, message, organization }
      return data.organization;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// update organization - Note: Backend controller has updateOrganization but no route exposed
export const updateOrganization = createAsyncThunk(
  "Organizations/update",
  async ({ id, name }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("No authentication token found");

      // TODO: Backend needs to add update route in organizationRoutes.js
      const res = await fetch(`${BASE}/organization/update/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to update organization");
      return data.organization;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// delete organization
export const deleteOrganization = createAsyncThunk(
  "Organizations/delete",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("No authentication token found");

      const res = await fetch(`${BASE}/organization/delete-org/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to delete organization");
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// fetch user's organizations (for sub-users)
export const fetchOrganizationsByUser = createAsyncThunk(
  "Organizations/fetchByUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("No authentication token found");

      const res = await fetch(`${BASE}/organization/my-organizations`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch organizations for user");

      // backend returns { success, count, organizations }
      return data.organizations || [];
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// fetch organizations by owner (for managers)
export const fetchOrganizationsByOwner = createAsyncThunk(
  "Organizations/fetchByOwner",
  async (ownerId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("No authentication token found");

      const res = await fetch(`${BASE}/organization/owner/${ownerId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch organizations for owner");

      // backend returns { success, count, organizations }
      return data.organizations || [];
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);
    


const OrganizationSlice = createSlice({
  name: "Organization",
  initialState: {
    Organizations: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    setOrganizations(state, action) {
      state.Organizations = action.payload;
    },
    clearOrganizationError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchAllOrganizations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllOrganizations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.Organizations = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAllOrganizations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || "Failed to fetch organizations";
        state.Organizations = [];
      })

      // create
      .addCase(createOrganization.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        state.Organizations = [action.payload, ...state.Organizations];
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || "Failed to create organization";
      })

      // update
      .addCase(updateOrganization.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || "Failed to update organization";
      })

      // delete
      .addCase(deleteOrganization.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        const removedId = action.payload;
        state.Organizations = state.Organizations.filter((org) => org._id !== removedId);
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || "Failed to delete organization";
      })

      // fetch by user
      .addCase(fetchOrganizationsByUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationsByUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.Organizations = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchOrganizationsByUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || "Failed to fetch user organizations";
        state.Organizations = [];
      })

      // fetch by owner (for managers)
      .addCase(fetchOrganizationsByOwner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationsByOwner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.Organizations = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchOrganizationsByOwner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || "Failed to fetch owner organizations";
        state.Organizations = [];
      });
  },
});

export const { setOrganizations, clearOrganizationError } = OrganizationSlice.actions;
export default OrganizationSlice.reducer;
