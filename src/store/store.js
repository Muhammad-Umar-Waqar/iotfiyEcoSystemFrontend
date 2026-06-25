// import { configureStore } from '@reduxjs/toolkit';
// import { persistStore, persistReducer } from 'redux-persist';
// import { combineReducers } from 'redux';
// import authReducer from '../slices/authSlice';
// import subscriptionReducer from '../slices/subscriptionSlice';
// import OrganizationReducer from '../slices/OrganizationSlice';
// import VenueReducer from "../slices/VenueSlice";
// import DeviceReducer from '../slices/DeviceSlice';
// import ManagerReducer from '../slices/ManagerSlice';
// import UserReducer from '../slices/UserSlice';


// const storage = {
//   getItem: (key) => Promise.resolve(localStorage.getItem(key)),
//   setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
//   removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
// };

// const persistConfig = {
//   key: 'root',
//   storage,               // ✅ use your custom storage
//   whitelist: ['auth'],
// };

// const rootReducer = combineReducers({
//   auth: authReducer,
//   subscription: subscriptionReducer,
//   Organization: OrganizationReducer,
//   Device: DeviceReducer,
//   Manager: ManagerReducer,
//   Venue: VenueReducer,
//   User: UserReducer,
// });

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
//         ignoredPaths: ['register', 'rehydrate'],
//       },
//     }),
// });

// export const persistor = persistStore(store);


import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { combineReducers } from 'redux';

import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import authReducer from '../slices/authSlice';
import subscriptionReducer from '../slices/subscriptionSlice';
import OrganizationReducer from '../slices/OrganizationSlice';
import VenueReducer from "../slices/VenueSlice";
import DeviceReducer from '../slices/DeviceSlice';
import ManagerReducer from '../slices/ManagerSlice';
import UserReducer from '../slices/UserSlice';

const storage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
};

const authPersistConfig = {
  key: 'auth',
  storage,
  blacklist: ['loading', 'error'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['subscription'],
};

const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  subscription: subscriptionReducer,
  Organization: OrganizationReducer,
  Device: DeviceReducer,
  Manager: ManagerReducer,
  Venue: VenueReducer,
  User: UserReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
      },
    }),
});

export const persistor = persistStore(store);