// src/slices/UserSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

// Create sub-user (manager only)
export const createSubUser = createAsyncThunk(
  "user/createSubUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register-user", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create user"
      );
    }
  }
);

// Fetch users created by manager
export const fetchSubUsers = createAsyncThunk(
  "user/fetchSubUsers",
  async (managerId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/user/manager/${managerId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch users"
      );
    }
  }
);

// Fetch single user details
export const fetchSingleUser = createAsyncThunk(
  "user/fetchSingleUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/user/single/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch user"
      );
    }
  }
);

// Update sub-user
export const updateSubUser = createAsyncThunk(
  "user/updateSubUser",
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/user/update-user/${userId}`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update user"
      );
    }
  }
);

// Delete sub-user
export const deleteSubUser = createAsyncThunk(
  "user/deleteSubUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/auth/sub-users/${userId}`);
      return { userId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete user"
      );
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    subUsers: [],
    selectedUser: null,
    isLoading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Sub-User
      .addCase(createSubUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSubUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subUsers.push(action.payload.user);
        state.success = "User created successfully";
      })
      .addCase(createSubUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Sub-Users
      .addCase(fetchSubUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subUsers = action.payload.subUsers || [];
      })
      .addCase(fetchSubUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Single User
      .addCase(fetchSingleUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSingleUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload.user;
      })
      .addCase(fetchSingleUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Sub-User
      .addCase(updateSubUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSubUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.subUsers.findIndex(
          (user) => user._id === action.payload.user._id
        );
        if (index !== -1) {
          state.subUsers[index] = action.payload.user;
        }
        state.success = "User updated successfully";
      })
      .addCase(updateSubUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Sub-User
      .addCase(deleteSubUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSubUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subUsers = state.subUsers.filter(
          (user) => user._id !== action.payload.userId
        );
        state.success = "User deleted successfully";
      })
      .addCase(deleteSubUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = userSlice.actions;
export default userSlice.reducer;
