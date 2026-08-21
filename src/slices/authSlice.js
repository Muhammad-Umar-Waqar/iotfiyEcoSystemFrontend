import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import { authService } from '../services/authService';

const ORG_VENUE_KEY = 'iotifiy:org-venue';

/** Clear previous session data without racing mid-login token writes. */
function clearPriorSessionStorage() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem(ORG_VENUE_KEY);
    sessionStorage.removeItem(ORG_VENUE_KEY);
    // redux-persist keys (auth / root) so old user is not restored over QR login
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('persist:')) localStorage.removeItem(key);
    });
  } catch {
    /* ignore */
  }
}

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await authService.login(email, password);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

export const loginWithQr = createAsyncThunk(
  'auth/loginWithQr',
  async (token, { rejectWithValue }) => {
    try {
      clearPriorSessionStorage();

      const data = await authService.loginWithQr(token);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'QR login failed' });
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getMe();
      return data;
    } catch (error) {
      return rejectWithValue({
        ...(error.response?.data || { message: 'Failed to fetch user' }),
        status: error.response?.status,
      });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      localStorage.clear();
      return null;
    } catch (error) {
      localStorage.clear();
      return rejectWithValue(error.response?.data || { message: 'Logout failed' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    loading: false,
    /** True while QR (or similar) bootstrap is in progress — blocks /login kick */
    bootstrapping: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    resetAuthLoading: (state) => {
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(REHYDRATE, (state) => {
        state.loading = false;
        state.bootstrapping = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      .addCase(loginWithQr.pending, (state) => {
        state.loading = true;
        state.bootstrapping = true;
        state.error = null;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(loginWithQr.fulfilled, (state, action) => {
        state.loading = false;
        state.bootstrapping = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginWithQr.rejected, (state, action) => {
        state.loading = false;
        state.bootstrapping = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload?.message || 'QR login failed';
      })
      .addCase(fetchCurrentUser.pending, () => {
        // do not set loading — avoids Login button flicker
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.bootstrapping = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        // Keep a just-established login if /me failed transiently but JWT is still present
        const lsToken = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
        const status = action.payload?.status;
        if (lsToken && state.user && status !== 401) {
          state.isAuthenticated = true;
          state.token = lsToken;
          return;
        }
        if (lsToken && state.token && status !== 401) {
          state.isAuthenticated = true;
          return;
        }
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        try {
          localStorage.removeItem('token');
        } catch {
          /* ignore */
        }
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.bootstrapping = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.bootstrapping = false;
      });
  },
});

export const { clearError, setUser, resetAuthLoading } = authSlice.actions;
export default authSlice.reducer;
