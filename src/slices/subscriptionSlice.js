// /slices/subscriptionSlice.js

// src/store/slices/subscriptionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const purchaseSubscription = createAsyncThunk(
  'subscription/purchase',
  async ({ planId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/subscription/purchase', { planId });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Subscription failed' }
      );
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    pendingPlan: null,
    pendingCustomPlan: null,
    purchasing: false,
    error: null,
  },
  reducers: {
    setPendingPlan: (state, action) => {
      state.pendingPlan = action.payload;
    },
    clearPendingPlan: (state) => {
      state.pendingPlan = null;
    },
    setPendingCustomPlan: (state, action) => {
      state.pendingCustomPlan = action.payload;
    },
    clearPendingCustomPlan: (state) => {
      state.pendingCustomPlan = null;
    },
    clearSubscriptionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(purchaseSubscription.pending, (state) => {
        state.purchasing = true;
        state.error = null;
      })
      .addCase(purchaseSubscription.fulfilled, (state) => {
        state.purchasing = false;
        state.pendingPlan = null;
        state.pendingCustomPlan = null;
      })
      .addCase(purchaseSubscription.rejected, (state, action) => {
        state.purchasing = false;
        state.error = action.payload?.message || 'Subscription failed';
      });
  },
});

export const {
  setPendingPlan,
  clearPendingPlan,
  setPendingCustomPlan,
  clearPendingCustomPlan,
  clearSubscriptionError,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;