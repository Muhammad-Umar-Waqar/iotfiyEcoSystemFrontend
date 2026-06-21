// /slices/subscriptionSlice.js

// src/store/slices/subscriptionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const getAllPlans = createAsyncThunk(
  'subscription/getAllPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/subscription/get-all-plans');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch plans' }
      );
    }
  }
);

export const createPlan = createAsyncThunk(
  'subscription/createPlan',
  async (planData, { rejectWithValue }) => {
    try {
      const response = await api.post('/subscription/create-plan', planData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to create plan' }
      );
    }
  }
);

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
    plans: [],
    plansLoading: false,
    plansError: null,
    createPlanLoading: false,
    createPlanError: null,
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
      // Get all plans
      .addCase(getAllPlans.pending, (state) => {
        state.plansLoading = true;
        state.plansError = null;
      })
      .addCase(getAllPlans.fulfilled, (state, action) => {
        state.plansLoading = false;
        state.plans = action.payload.plans || [];
      })
      .addCase(getAllPlans.rejected, (state, action) => {
        state.plansLoading = false;
        state.plansError = action.payload?.message || 'Failed to fetch plans';
      })
      // Create plan
      .addCase(createPlan.pending, (state) => {
        state.createPlanLoading = true;
        state.createPlanError = null;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.createPlanLoading = false;
        // Add the new plan to the list
        if (action.payload.plan) {
          state.plans.push(action.payload.plan);
        }
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.createPlanLoading = false;
        state.createPlanError = action.payload?.message || 'Failed to create plan';
      })
      // Purchase subscription
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