// // src/slices/ManagerSlice.js
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050";
// const getToken = () => localStorage.getItem("token");

// // fetch all managers/users
// export const fetchAllManagers = createAsyncThunk(
//   "Manager/fetchAll",
//   async (_, { rejectWithValue }) => {
//     try {
//       const token = getToken();
//       if (!token) return rejectWithValue("No authentication token found");

//       const res = await fetch(`${BASE}/users/all`, {
//         method: "GET",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();
//       if (!res.ok) return rejectWithValue(data.message || "Failed to fetch users");
//       // backend returns array of users
//       return data;
//     } catch (err) {
//       return rejectWithValue(err.message || "Network error");
//     }
//   }
// );

// // delete manager/user
// export const DeleteManager = createAsyncThunk(
//   "Manager/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       const token = getToken();
//       if (!token) return rejectWithValue("No authentication token found");

//       const res = await fetch(`${BASE}/users/delete/${id}`, {
//         method: "DELETE",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();
//       if (!res.ok) return rejectWithValue(data.message || "Failed to delete user");
//       return id; // return deleted id to reducer
//     } catch (err) {
//       return rejectWithValue(err.message || "Network error");
//     }
//   }
// );

// // update user profile (name, email, password, organization)
// export const UpdateManager = createAsyncThunk(
//   "Manager/update",
//   async ({ id, name, email, password, organization }, { rejectWithValue }) => {
//     try {
//       const token = getToken();
//       if (!token) return rejectWithValue("No authentication token found");

//       const body = {};
//       if (name !== undefined) body.name = name;
//       if (email !== undefined) body.email = email;
//       if (password !== undefined && password !== "") body.password = password;
//       if (organization !== undefined) body.organization = organization;

//       const res = await fetch(`${BASE}/users/update/${id}`, {
//         method: "PUT",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(body),
//       });

//       const data = await res.json();
//       if (!res.ok) return rejectWithValue(data.message || "Failed to update user");
//       // backend returns { message, user }
//       return data.user;
//     } catch (err) {
//       return rejectWithValue(err.message || "Network error");
//     }
//   }
// );

// // update user active status (optional)
// export const UpdateManagerStatus = createAsyncThunk(
//   "Manager/updateStatus",
//   async ({ id, isActive, suspensionReason }, { rejectWithValue }) => {
//     try {
//       const token = getToken();
//       if (!token) return rejectWithValue("No authentication token found");

//       const res = await fetch(`${BASE}/users/update-status/${id}`, {
//         method: "PUT",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ isActive, suspensionReason }),
//       });

//       const data = await res.json();
//       if (!res.ok) return rejectWithValue(data.message || "Failed to update status");
//       return data.user; // backend returns user in response
//     } catch (err) {
//       return rejectWithValue(err.message || "Network error");
//     }
//   }
// );

// // --- new thunk: fetch users created by a given creatorId ---
// export const fetchUsersByCreator = createAsyncThunk(
//   "Manager/fetchByCreator",
//   async (creatorId, { rejectWithValue }) => {
//     try {
//       const token = getToken();
//       if (!token) return rejectWithValue("No authentication token found");

//       const res = await fetch(`${BASE}/users/${creatorId}`, {
//         method: "GET",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();
//       if (!res.ok) return rejectWithValue(data.message || "Failed to fetch users by creator");
//       // your backend returns { message, users }
//       return Array.isArray(data.users) ? data.users : [];
//     } catch (err) {
//       return rejectWithValue(err.message || "Network error");
//     }
//   }
// );


// const ManagerSlice = createSlice({
//   name: "Manager",
//   initialState: {
//     Managers: [],
//     isLoading: false,
//     error: null,
//     ManagerDeleteModalOpen: false,
//     ManagerEditModalOpen: false,
//   },
//   reducers: {
//     setManagers(state, action) {
//       state.Managers = action.payload;
//     },
//     setManagerDeleteModalOpen(state, action) {
//       state.ManagerDeleteModalOpen = action.payload;
//     },
//     setManagerEditModalOpen(state, action) {
//       state.ManagerEditModalOpen = action.payload;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // fetch
//       .addCase(fetchAllManagers.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllManagers.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.Managers = Array.isArray(action.payload) ? action.payload : [];
//       })
//       .addCase(fetchAllManagers.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload || action.error?.message || "Failed to fetch users";
//         state.Managers = [];
//       })

//       // delete
//       .addCase(DeleteManager.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(DeleteManager.fulfilled, (state, action) => {
//         state.isLoading = false;
//         const removedId = action.payload;
//         state.Managers = state.Managers.filter((m) => m._id !== removedId);
//       })
//       .addCase(DeleteManager.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload || action.error?.message || "Failed to delete user";
//       })

//       // update
//       .addCase(UpdateManager.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(UpdateManager.fulfilled, (state, action) => {
//         state.isLoading = false;
//         const updated = action.payload;
//         if (updated && updated._id) {
//           state.Managers = state.Managers.map((m) => (m._id === updated._id ? updated : m));
//         }
//       })
//       .addCase(UpdateManager.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload || action.error?.message || "Failed to update user";
//       })

//       // update status
//       .addCase(UpdateManagerStatus.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(UpdateManagerStatus.fulfilled, (state, action) => {
//         state.isLoading = false;
//         const updated = action.payload;
//         if (updated && updated._id) {
//           state.Managers = state.Managers.map((m) => (m._id === updated._id ? updated : m));
//         }
//       })
//       .addCase(UpdateManagerStatus.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload || action.error?.message || "Failed to update status";
//       });
//   },
// });

// export const { setManagers, setManagerDeleteModalOpen, setManagerEditModalOpen } = ManagerSlice.actions;
// export default ManagerSlice.reducer;
// src/slices/ManagerSlice.js


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";
const getToken = () => localStorage.getItem("token");

// fetch all managers/users
export const fetchAllManagers = createAsyncThunk(
  "Manager/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) return rejectWithValue("No authentication token found");

      const res = await fetch(`${BASE}/users/all`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch users");
      // backend returns array of users
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// delete manager/user
export const DeleteManager = createAsyncThunk(
  "Manager/delete",
  async (id, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) return rejectWithValue("No authentication token found");

      const res = await fetch(`${BASE}/users/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to delete user");
      return id; // return deleted id to reducer
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// update user profile (name, email, password, organization)
export const UpdateManager = createAsyncThunk(
  "Manager/update",
  async ({ id, name, email, password, organization, venues, timer }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) return rejectWithValue("No authentication token found");

      const body = {};
      if (name !== undefined) body.name = name;
      if (email !== undefined) body.email = email;
      if (password !== undefined && password !== "") body.password = password;
      if (organization !== undefined) body.organization = organization;
      if (timer !== undefined) body.timer = timer;
      if (Array.isArray(venues) && venues.length > 0) body.venues = venues;

      

      const res = await fetch(`${BASE}/users/update/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to update user");
      // backend returns { message, user }
      return data.user;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// update user active status (optional)
export const UpdateManagerStatus = createAsyncThunk(
  "Manager/updateStatus",
  async ({ id, isActive, suspensionReason }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) return rejectWithValue("No authentication token found");

      const res = await fetch(`${BASE}/users/update-status/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive, suspensionReason }),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to update status");
      return data.user; // backend returns user in response
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// --- new thunk: fetch users created by a given creatorId ---
export const fetchUsersByCreator = createAsyncThunk(
  "Manager/fetchByCreator",
  async (creatorId, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) return rejectWithValue("No authentication token found");

      const res = await fetch(`${BASE}/users/${creatorId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch users by creator");
      // your backend returns { message, users }
      return Array.isArray(data.users) ? data.users : [];
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);


const ManagerSlice = createSlice({
  name: "Manager",
  initialState: {
    Managers: [],
    isLoading: false,
    error: null,
    ManagerDeleteModalOpen: false,
    ManagerEditModalOpen: false,
  },
  reducers: {
    setManagers(state, action) {
      state.Managers = action.payload;
    },
    setManagerDeleteModalOpen(state, action) {
      state.ManagerDeleteModalOpen = action.payload;
    },
    setManagerEditModalOpen(state, action) {
      state.ManagerEditModalOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAllManagers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllManagers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.Managers = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAllManagers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || "Failed to fetch users";
        state.Managers = [];
      })
      
      // NEW: fetchUsersByCreator
      .addCase(fetchUsersByCreator.pending, (state) => {
        state.isLoading = true; state.error = null;
      })
      .addCase(fetchUsersByCreator.fulfilled, (state, action) => {
        state.isLoading = false;
        state.Managers = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchUsersByCreator.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || "Failed to fetch users by creator";
        state.Managers = [];
      })

      // delete
      .addCase(DeleteManager.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(DeleteManager.fulfilled, (state, action) => {
        state.isLoading = false;
        const removedId = action.payload;
        state.Managers = state.Managers.filter((m) => m._id !== removedId);
      })
      .addCase(DeleteManager.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || "Failed to delete user";
      })

      // update
      .addCase(UpdateManager.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(UpdateManager.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload;
        if (updated && updated._id) {
          state.Managers = state.Managers.map((m) => (m._id === updated._id ? updated : m));
        }
      })
      .addCase(UpdateManager.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || "Failed to update user";
      })

      // update status
      .addCase(UpdateManagerStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(UpdateManagerStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload;
        if (updated && updated._id) {
          state.Managers = state.Managers.map((m) => (m._id === updated._id ? updated : m));
        }
      })
      .addCase(UpdateManagerStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || "Failed to update status";
      });
  },
});

export const { setManagers, setManagerDeleteModalOpen, setManagerEditModalOpen } = ManagerSlice.actions;
export default ManagerSlice.reducer;
