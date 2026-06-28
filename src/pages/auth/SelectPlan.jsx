// // import { useEffect, useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import Swal from 'sweetalert2';
// // import api from '../../services/api';

// // const SelectPlan = () => {
// //   const [plans, setPlans] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [purchasing, setPurchasing] = useState(false);
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     fetchPlans();
// //   }, []);

// //   const fetchPlans = async () => {
// //     try {
// //       const response = await api.get('/subscription/get-all-plans');
// //       setPlans(response.data.plans || []);
// //     } catch (error) {
// //       Swal.fire({
// //         icon: 'error',
// //         title: 'Error',
// //         text: 'Failed to load subscription plans.',
// //       });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleSelectPlan = async (planId) => {
// //     setPurchasing(true);
// //     try {
// //       await api.post('/subscription/purchase', { planId });

// //       Swal.fire({
// //         icon: 'success',
// //         title: 'Subscription Activated',
// //         text: 'Your subscription has been activated successfully!',
// //         timer: 2000,
// //         showConfirmButton: false,
// //       });

// //       // Redirect to management dashboard
// //       navigate('/management');
// //     } catch (error) {
// //       Swal.fire({
// //         icon: 'error',
// //         title: 'Purchase Failed',
// //         text: error.response?.data?.message || 'Failed to activate subscription.',
// //       });
// //     } finally {
// //       setPurchasing(false);
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-gray-100">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
// //           <p className="mt-4 text-gray-600">Loading plans...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-100 py-12 px-4">
// //       <div className="max-w-6xl mx-auto">
// //         <div className="text-center mb-12">
// //           <img src="/logo.png" alt="IoTify Logo" className="h-10 mx-auto mb-4" />
// //           <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
// //           <p className="text-gray-600 mt-2">Select a subscription plan to get started</p>
// //         </div>

// //         <div className="grid md:grid-cols-3 gap-8">
// //           {plans.map((plan) => (
// //             <div
// //               key={plan._id}
// //               className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
// //             >
// //               <div className="text-center">
// //                 <h3 className="text-2xl font-bold text-gray-900 capitalize">{plan.name}</h3>
// //                 <p className="text-gray-600 mt-2">{plan.description}</p>
// //                 <div className="mt-6">
// //                   <span className="text-4xl font-bold text-blue-600">${plan.price}</span>
// //                   <span className="text-gray-600">/{plan.durationDays} days</span>
// //                 </div>
// //               </div>

// //               <ul className="mt-8 space-y-4">
// //                 <li className="flex items-center text-gray-700">
// //                   <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
// //                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
// //                   </svg>
// //                   {plan.maxOrganizations} Organizations
// //                 </li>
// //                 <li className="flex items-center text-gray-700">
// //                   <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
// //                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
// //                   </svg>
// //                   {plan.maxVenues} Venues
// //                 </li>
// //                 <li className="flex items-center text-gray-700">
// //                   <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
// //                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
// //                   </svg>
// //                   {plan.maxDevices} Devices
// //                 </li>
// //                 <li className="flex items-center text-gray-700">
// //                   <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
// //                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
// //                   </svg>
// //                   {plan.maxUsers} Users
// //                 </li>
// //               </ul>

// //               <button
// //                 onClick={() => handleSelectPlan(plan._id)}
// //                 disabled={purchasing}
// //                 className={`w-full mt-8 py-3 px-4 rounded-lg font-medium text-white ${
// //                   purchasing
// //                     ? 'bg-blue-400 cursor-not-allowed'
// //                     : 'bg-blue-600 hover:bg-blue-700'
// //                 }`}
// //               >
// //                 {purchasing ? 'Processing...' : 'Select Plan'}
// //               </button>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default SelectPlan;



// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import Swal from 'sweetalert2';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Button,
//   Stack,
// } from '@mui/material';
// import api from '../../services/api';
// import { setPendingPlan, setPendingCustomPlan, clearPendingPlan, clearPendingCustomPlan, purchaseSubscription } from '../../slices/subscriptionSlice';

// const SelectPlan = () => {
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [purchasingPlanId, setPurchasingPlanId] = useState(null);
//   const [customPlanModalOpen, setCustomPlanModalOpen] = useState(false);
//   const [customPlanData, setCustomPlanData] = useState({
//     name: '',
//     description: '',
//     price: '',
//     durationDays: '',
//     maxOrganizations: '',
//     maxVenues: '',
//     maxDevices: '',
//     maxUsers: '',
//   });

//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { isAuthenticated, user } = useSelector((state) => state.auth);
//   const { pendingPlan, pendingCustomPlan } = useSelector((state) => state.subscription);

//   useEffect(() => {
//     fetchPlans();
//   }, []);

//   useEffect(() => {
//     // Handle pending plan after login - only process once
//     if (isAuthenticated && pendingPlan && plans.length > 0) {
//       const plan = plans.find(p => p._id === pendingPlan.planId);
//       if (plan) {
//         // Clear the pending plan first to prevent re-triggering
//         dispatch(clearPendingPlan());
//         handleSelectPlan(plan);
//       }
//     }
//   }, [isAuthenticated, pendingPlan, plans.length]);

//   useEffect(() => {
//     // Handle pending custom plan after login - only process once
//     if (isAuthenticated && pendingCustomPlan) {
//       setCustomPlanData(pendingCustomPlan);
//       setCustomPlanModalOpen(true);
//       // Don't clear here - clear after successful creation
//     }
//   }, [isAuthenticated, pendingCustomPlan]);

//   const fetchPlans = async () => {
//     try {
//       const response = await api.get('/subscription/get-all-plans');
//       setPlans(response.data.plans || []);
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: 'Failed to load subscription plans.',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelectPlan = async (plan) => {
//     if (!isAuthenticated) {
//       dispatch(setPendingPlan({ planId: plan._id, name: plan.name }));
//       navigate('/login', { state: { from: '/select-plan' } });
//       return;
//     }

//     setPurchasingPlanId(plan._id);

//     try {
//       const result = await dispatch(purchaseSubscription({ planId: plan._id }));

//       if (purchaseSubscription.fulfilled.match(result)) {
//         Swal.fire({
//           icon: 'success',
//           title: 'Subscription Activated',
//           text: 'Your subscription has been activated successfully!',
//           timer: 2000,
//           showConfirmButton: false,
//         });
//         navigate('/management');
//       } else {
//         throw new Error(result.payload?.message || 'Failed to activate subscription.');
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Purchase Failed',
//         text: error.message || 'Failed to activate subscription.',
//       });
//     } finally {
//       setPurchasingPlanId(null);
//     }
//   };

//   const handleOpenCustomPlanModal = () => {
//     setCustomPlanModalOpen(true);
//   };

//   const handleCloseCustomPlanModal = () => {
//     setCustomPlanModalOpen(false);
//     if (!isAuthenticated) {
//       setCustomPlanData({
//         name: '',
//         description: '',
//         price: '',
//         durationDays: '',
//         maxOrganizations: '',
//         maxVenues: '',
//         maxDevices: '',
//         maxUsers: '',
//       });
//     }
//   };

//   const handleCustomPlanInputChange = (e) => {
//     const { name, value } = e.target;
    
//       // fields that must be numeric
//     const numericFields = [
//       'price',
//       'durationDays',
//       'maxOrganizations',
//       'maxVenues',
//       'maxDevices',
//       'maxUsers',
//     ];

//    if (numericFields.includes(name)) {
//     // allow empty input
//     if (value === '') {
//       setCustomPlanData(prev => ({
//         ...prev,
//         [name]: '',
//       }));
//       return;
//     }
  
//         // block non-numeric input
//     if (!/^\d+$/.test(value)) return;

//     const num = Number(value);

//     setCustomPlanData(prev => ({
//       ...prev,
//       [name]: num,
//     }));
//     return;
//   }


//     setCustomPlanData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleCreateCustomPlan = async () => {
//       const numericFields = [
//     'price',
//     'durationDays',
//     'maxOrganizations',
//     'maxVenues',
//     'maxDevices',
//     'maxUsers',
//   ];


//     // Validate inputs
//     if (!customPlanData.name || !customPlanData.price || !customPlanData.durationDays) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Validation Error',
//         text: 'Please fill in all required fields (Name, Price, Duration).',
//       });
//       return;
//     }

//     // negative number validation
//   for (let field of numericFields) {
//     const value = customPlanData[field];

//     if (value !== '' && value < 0) {
//       return Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: `${field} cannot be less than 0`,
//       });
//     }
//   }

//     if (!isAuthenticated) {
//       // Save custom plan to Redux and redirect to login
//       dispatch(setPendingCustomPlan(customPlanData));
//       navigate('/login', { state: { from: '/select-plan' } });
//       return;
//     }

//     // If authenticated, create the custom plan
//     try {
//       const planPayload = {
//         ...customPlanData,
//         type: 'custom', // Required by backend
//       };
//       const response = await api.post('/subscription/create-plan', planPayload);

//       Swal.fire({
//         icon: 'success',
//         title: 'Custom Plan Created',
//         text: 'Your custom plan has been created successfully!',
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       dispatch(clearPendingCustomPlan());
//       handleCloseCustomPlanModal();
//       fetchPlans(); // Refresh plans list
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Creation Failed',
//         text: error.response?.data?.message || 'Failed to create custom plan.',
//       });
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading plans...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 py-12 px-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-12">
//           <img src="/logo.png" alt="IoTify Logo" className="h-10 mx-auto mb-4" />
//           <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
//           <p className="text-gray-600 mt-2">Select a subscription plan to get started</p>
//         </div>

//         <div className="mb-8 text-center">
//           <button
//             onClick={handleOpenCustomPlanModal}
//             className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
//           >
//             Create Custom Plan
//           </button>
//         </div>

//         <div className="grid md:grid-cols-3 gap-8">
//           {plans.map((plan) => {
//             const isSelectedPending = pendingPlan?.planId === plan._id;
//             return (
//               <div
//                 key={plan._id}
//                 className={`bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow ${
//                   isSelectedPending ? 'ring-4 ring-blue-500' : ''
//                 }`}
//               >
//                 <div className="text-center">
//                   <h3 className="text-2xl font-bold text-gray-900 capitalize">{plan.name}</h3>
//                   <p className="text-gray-600 mt-2">{plan.description}</p>
//                   <div className="mt-6">
//                     <span className="text-4xl font-bold text-blue-600">${plan.price}</span>
//                     <span className="text-gray-600">/{plan.durationDays} days</span>
//                   </div>
//                 </div>

//                 <ul className="mt-8 space-y-4">
//                   <li className="flex items-center text-gray-700">{plan.maxOrganizations} Organizations</li>
//                   <li className="flex items-center text-gray-700">{plan.maxVenues} Venues</li>
//                   <li className="flex items-center text-gray-700">{plan.maxDevices} Devices</li>
//                   <li className="flex items-center text-gray-700">{plan.maxUsers} Users</li>
//                 </ul>

//                 <button
//                   onClick={() => handleSelectPlan(plan)}
//                   disabled={purchasingPlanId === plan._id}
//                   className={`w-full mt-8 py-3 px-4 rounded-lg font-medium text-white ${
//                     purchasingPlanId === plan._id
//                       ? 'bg-blue-400 cursor-not-allowed'
//                       : 'bg-blue-600 hover:bg-blue-700'
//                   }`}
//                 >
//                   {purchasingPlanId === plan._id ? 'Processing...' : 'Select Plan'}
//                 </button>
//               </div>
//             );
//           })}
//         </div>

//         {/* Custom Plan Modal */}
//         <Dialog open={customPlanModalOpen} onClose={handleCloseCustomPlanModal} maxWidth="sm" fullWidth>
//           <DialogTitle>Create Custom Plan</DialogTitle>
//           <DialogContent>
//             <Stack  spacing={2} sx={{ mt: 1 }}>
//               <TextField
//                 fullWidth
//                 label="Plan Name"
//                 name="name"
//                 value={customPlanData.name}
//                 onChange={handleCustomPlanInputChange}
//                 required
//               />
//               <TextField
//                 fullWidth
//                 label="Description"
//                 name="description"
//                 value={customPlanData.description}
//                 onChange={handleCustomPlanInputChange}
//                 multiline
//                 rows={3}
//               />
//               <TextField
//                 fullWidth
//                 label="Price ($)"
//                 name="price"
//                 type="number"
//                 value={customPlanData.price}
//                 onChange={handleCustomPlanInputChange}
//                 inputProps={{
//                   min: 0,
//                 }}
//                 required
//               />
//               <TextField
//                 fullWidth
//                 label="Duration (Days)"
//                 name="durationDays"
//                 type="number"
//                 value={customPlanData.durationDays}
//                 onChange={handleCustomPlanInputChange}
//                 inputProps={{
//                   min: 0,
//                 }}
//                 required
//               />
//               <TextField
//                 fullWidth
//                 label="Max Organizations"
//                 name="maxOrganizations"
//                 type="number"
//                 value={customPlanData.maxOrganizations}
//                 onChange={handleCustomPlanInputChange}
//                 inputProps={{
//                   min: 0,
//                 }}
//               />
//               <TextField
//                 fullWidth
//                 label="Max Venues"
//                 name="maxVenues"
//                 type="number"
//                 value={customPlanData.maxVenues}
//                 onChange={handleCustomPlanInputChange}
//                 inputProps={{
//                   min: 0,
//                 }}
//               />
//               <TextField
//                 fullWidth
//                 label="Max Devices"
//                 name="maxDevices"
//                 type="number"
//                 value={customPlanData.maxDevices}
//                 onChange={handleCustomPlanInputChange}
//                 inputProps={{
//                   min: 0,
//                 }}
//               />
//               <TextField
//                 fullWidth
//                 label="Max Users"
//                 name="maxUsers"
//                 type="number"
//                 value={customPlanData.maxUsers}
//                 onChange={handleCustomPlanInputChange}
//                 inputProps={{
//                   min: 0,
//                 }}
//               />
//             </Stack>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleCloseCustomPlanModal}>Cancel</Button>
//             <Button onClick={handleCreateCustomPlan} variant="contained" color="primary">
//               {isAuthenticated ? 'Create Plan' : 'Save & Login'}
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </div>
//     </div>
//   );
// };

// export default SelectPlan;









import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import api from '../../services/api';
import {
  setPendingPlan, setPendingCustomPlan,
  clearPendingPlan, clearPendingCustomPlan,
  purchaseSubscription,
} from '../../slices/subscriptionSlice';

// ─── design tokens (aligned with dashboard / home) ─────────────────────────────
const T = {
  primary:       '#0D5CA4',
  primaryDark:   '#07518D',
  primaryHover:  '#0b4e8a',
  primaryTint:   '#07518D12',
  primaryBorder: 'rgba(7, 81, 141, 0.22)',
  pageBg:        '#F5F6FA',
  panelBg:       '#07518D12',
  white:         '#ffffff',
  slate900:      '#0f172a',
  slate700:      '#334155',
  slate500:      '#64748b',
  slate300:      '#cbd5e1',
  slate200:      '#e2e8f0',
  slate100:      '#f1f5f9',
};

// ─── tiny icon ─────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = 'currentColor' }) => {
  const paths = {
    check:       'M20 6L9 17l-5-5',
    arrowLeft:   'M19 12H5M12 19l-7-7 7-7',
    arrowRight:  'M5 12h14M12 5l7 7-7 7',
    zap:         'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    users:       'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    building:    'M3 21h18M3 7v14M21 7v14M9 21V7M15 21V7M3 7l9-4 9 4',
    cpu:         'M9 3H5a2 2 0 0 0-2 2v4m6-6h6m-6 0v18m6-18h4a2 2 0 0 1 2 2v4m-6-6v18M3 9v6m18-6v6M3 15h6m12 0h-6M9 21H5a2 2 0 0 1-2-2v-4m6 6h6m-6 0V3m6 18h4a2 2 0 0 0 2-2v-4m-6 6V3',
    plus:        'M12 5v14M5 12h14',
    star:        'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    sparkle:     'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z',
    shield:      'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    calendar:    'M8 2v4M16 2v4M3 10h18M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z',
    wifi:        'M1 6.5C7.1 0.8 16.9 0.8 23 6.5M5 10.5C9.1 6.8 14.9 6.8 19 10.5M9 14.5c1.9-1.7 5.1-1.7 7 0M12 18h.01',
    x:           'M18 6L6 18M6 6l12 12',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      {paths[name] && <path d={paths[name]} />}
    </svg>
  );
};

// ─── plan accent colours (cycle if more plans) ─────────────────────────────────
const PLAN_ACCENTS = [
  { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', label: 'Starter' },
  { color: T.primary, bg: T.primaryTint, border: T.primaryBorder, label: 'Professional' },
  { color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', label: 'Enterprise' },
];

const FEATURED_PLAN_NAME = 'holiday plan';

const isFeaturedPlan = (plan) =>
  String(plan?.name || '').trim().toLowerCase() === FEATURED_PLAN_NAME;

const getPlanAccent = (plan, index) => {
  if (isFeaturedPlan(plan)) {
    return { ...PLAN_ACCENTS[1], featured: true };
  }
  return { ...PLAN_ACCENTS[index % PLAN_ACCENTS.length], featured: false };
};

// ─── feature list per plan (derived from limits, no hardcoded text) ─────────────
const planFeatures = (plan) => [
  `${plan.maxOrganizations ?? '—'} organisation${plan.maxOrganizations !== 1 ? 's' : ''}`,
  `${plan.maxVenues ?? '—'} venue${plan.maxVenues !== 1 ? 's' : ''}`,
  `${plan.maxDevices ?? '—'} device${plan.maxDevices !== 1 ? 's' : ''}`,
  `${plan.maxUsers ?? '—'} user${plan.maxUsers !== 1 ? 's' : ''}`,
  'Live sensor dashboard',
  'Threshold alerts',
  'Schedule & trigger modes',
];

// ─── PLAN CARD ─────────────────────────────────────────────────────────────────
const PlanCard = ({ plan, accent, isPending, isPurchasing, onSelect }) => {
  const { featured } = accent;
  return (
    <div style={{
      background: T.white,
      borderRadius: 20,
      border: featured ? `2px solid ${accent.color}` : `1px solid ${T.slate200}`,
      boxShadow: featured
        ? `0 8px 32px ${accent.color}22`
        : '0 1px 8px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      height: '100%',
      transition: 'box-shadow .2s, transform .2s',
    }}
      onMouseEnter={e => { if (!featured) { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}}
      onMouseLeave={e => { if (!featured) { e.currentTarget.style.boxShadow = '0 1px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}}
    >
      {/* Pending ring */}
      {isPending && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 20,
          border: '3px solid #facc15', pointerEvents: 'none', zIndex: 10,
        }} />
      )}

      {/* Header */}
      <div style={{
        background: accent.bg, borderBottom: `1px solid ${accent.border}`,
        padding: '28px 28px 24px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 10, marginBottom: 14, flexWrap: 'wrap',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: `${accent.color}18`, color: accent.color,
            fontSize: 12, fontWeight: 700, padding: '4px 12px',
            borderRadius: 20, letterSpacing: 0.4,
          }}>
            <Icon name="shield" size={12} color={accent.color} />
            {plan.name?.toUpperCase() || accent.label.toUpperCase()}
          </div>
          {featured && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: accent.color, color: '#fff',
              fontSize: 11, fontWeight: 700, padding: '4px 10px',
              borderRadius: 20, letterSpacing: 0.3, whiteSpace: 'nowrap',
            }}>
              <Icon name="star" size={11} color="#fff" />
              Popular
            </div>
          )}
        </div>

        {plan.description && (
          <p style={{ fontSize: 13, color: T.slate500, margin: '0 0 16px', lineHeight: 1.5 }}>
            {plan.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 44, fontWeight: 800, color: T.slate900, letterSpacing: '-2px' }}>
            ${plan.price ?? 0}
          </span>
          <span style={{ fontSize: 14, color: T.slate500 }}>
            / {plan.durationDays} day{plan.durationDays !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '24px 28px', flex: 1 }}>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {planFeatures(plan).map((f, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: `${accent.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon name="check" size={11} color={accent.color} />
              </div>
              <span style={{ fontSize: 14, color: T.slate700 }}>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 28px 28px' }}>
        <button
          onClick={() => onSelect(plan)}
          disabled={isPurchasing}
          style={{
            width: '100%', padding: '13px 0',
            background: isPurchasing ? `${accent.color}80` : accent.color,
            color: '#fff', border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 700, cursor: isPurchasing ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background .15s, transform .1s',
          }}
          onMouseEnter={e => { if (!isPurchasing) e.currentTarget.style.filter = 'brightness(0.9)'; }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
        >
          {isPurchasing
            ? 'Processing…'
            : (<><Icon name="zap" size={15} color="#fff" /> Activate plan</>)
          }
        </button>
      </div>
    </div>
  );
};

// ─── CUSTOM PLAN CARD ──────────────────────────────────────────────────────────
const CustomPlanCard = ({ onClick }) => (
  <div style={{
    background: T.white, borderRadius: 20,
    border: `2px dashed ${T.slate300}`,
    padding: '40px 28px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    textAlign: 'center', cursor: 'pointer',
    height: '100%',
    transition: 'border-color .18s, background .18s',
  }}
    onClick={onClick}
    onMouseEnter={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.background = T.primaryTint; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = T.slate300; e.currentTarget.style.background = T.white; }}
  >
    <div style={{
      width: 56, height: 56, borderRadius: 16,
      background: T.primaryTint, display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 16,
    }}>
      <Icon name="sparkle" size={24} color={T.primary} />
    </div>
    <h3 style={{ fontSize: 17, fontWeight: 700, color: T.slate900, margin: '0 0 8px' }}>Custom plan</h3>
    <p style={{ fontSize: 14, color: T.slate500, lineHeight: 1.6, margin: '0 0 20px', maxWidth: 200 }}>
      Need specific limits or a longer billing cycle? Build your own.
    </p>
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      color: T.primary, fontSize: 14, fontWeight: 600,
    }}>
      <Icon name="plus" size={15} color={T.primary} /> Configure plan
    </div>
  </div>
);

// ─── custom plan form modal ────────────────────────────────────────────────────
const EMPTY_CUSTOM_PLAN = {
  name: '', description: '', price: '', durationDays: '',
  maxOrganizations: '', maxVenues: '', maxDevices: '', maxUsers: '',
};

const fieldFocus = (e) => {
  e.currentTarget.style.borderColor = T.primary;
  e.currentTarget.style.boxShadow = `0 0 0 3px ${T.primaryTint}`;
};
const fieldBlur = (e) => {
  e.currentTarget.style.borderColor = T.slate200;
  e.currentTarget.style.boxShadow = 'none';
};

const FormField = ({ label, required, hint, children }) => (
  <div className="custom-plan-field">
    <label style={{
      display: 'block', fontSize: 13, fontWeight: 600,
      color: T.slate700, marginBottom: 6,
    }}>
      {label}{required && <span style={{ color: T.primary, marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {hint && (
      <p style={{ fontSize: 12, color: T.slate500, margin: '6px 0 0', lineHeight: 1.45 }}>{hint}</p>
    )}
  </div>
);

const LimitField = ({ icon, label, name, value, onChange }) => (
  <div style={{
    background: T.white, border: `1px solid ${T.slate200}`,
    borderRadius: 12, padding: '14px 14px 12px',
    transition: 'border-color .15s, box-shadow .15s',
  }}
    className="custom-plan-limit"
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: T.primaryTint, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={14} color={T.primary} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: T.slate700 }}>{label}</span>
    </div>
    <input
      type="number" name={name} value={value} min={0}
      onChange={onChange} placeholder="No limit"
      style={{
        width: '100%', boxSizing: 'border-box',
        padding: '10px 12px', fontSize: 15, fontWeight: 600,
        border: `1.5px solid ${T.slate200}`, borderRadius: 8,
        outline: 'none', color: T.slate900, background: T.slate100,
      }}
      onFocus={fieldFocus} onBlur={fieldBlur}
    />
  </div>
);

const CustomPlanModal = ({
  open, onClose, data, onChange, onSubmit,
  isAuthenticated, submitting,
}) => {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '11px 14px', fontSize: 14,
    border: `1.5px solid ${T.slate200}`, borderRadius: 10,
    outline: 'none', color: T.slate900, background: T.white,
    fontFamily: 'inherit', transition: 'border-color .15s, box-shadow .15s',
  };

  return (
    <div
      className="custom-plan-overlay"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="custom-plan-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560, maxHeight: 'min(92vh, 820px)',
          background: T.white, borderRadius: 20,
          border: `1px solid ${T.slate200}`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 22px', borderBottom: `1px solid ${T.slate200}`,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
          background: `linear-gradient(180deg, ${T.primaryTint} 0%, ${T.white} 100%)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 14px ${T.primary}44`,
            }}>
              <Icon name="sparkle" size={20} color="#fff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: T.slate900 }}>
                Build a custom plan
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: T.slate500, lineHeight: 1.45 }}>
                Tailor pricing and resource limits to your deployment.
              </p>
            </div>
          </div>
          <button
            type="button" onClick={onClose} aria-label="Close"
            style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: 10,
              border: `1px solid ${T.slate200}`, background: T.white,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="x" size={18} color={T.slate500} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
          style={{ flex: 1, overflowY: 'auto', padding: '22px' }}
        >
          <div style={{ marginBottom: 22 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 0.8,
              textTransform: 'uppercase', color: T.primaryDark, marginBottom: 14,
            }}>
              Plan details
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FormField label="Plan name" required>
                <input name="name" value={data.name} onChange={onChange} required
                  placeholder="e.g. Warehouse fleet"
                  style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur}
                />
              </FormField>
              <FormField label="Description" hint="Optional — shown on the plan card.">
                <textarea name="description" value={data.description} onChange={onChange}
                  rows={3} placeholder="Brief summary of what this plan covers…"
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 80, lineHeight: 1.5 }}
                  onFocus={fieldFocus} onBlur={fieldBlur}
                />
              </FormField>
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 0.8,
              textTransform: 'uppercase', color: T.primaryDark, marginBottom: 14,
            }}>
              Billing
            </div>
            <div className="custom-plan-billing-grid" style={{ display: 'grid', gap: 14 }}>
              <FormField label="Price (USD)" required>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 14, fontWeight: 600, color: T.slate500,
                  }}>$</span>
                  <input name="price" type="number" value={data.price} onChange={onChange}
                    required min={0} placeholder="0"
                    style={{ ...inputStyle, paddingLeft: 28, fontWeight: 700, fontSize: 16 }}
                    onFocus={fieldFocus} onBlur={fieldBlur}
                  />
                </div>
              </FormField>
              <FormField label="Duration (days)" required>
                <div style={{ position: 'relative' }}>
                  <input name="durationDays" type="number" value={data.durationDays}
                    onChange={onChange} required min={1} placeholder="30"
                    style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur}
                  />
                  <span style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    pointerEvents: 'none', display: 'flex',
                  }}>
                    <Icon name="calendar" size={16} color={T.slate500} />
                  </span>
                </div>
              </FormField>
            </div>
          </div>

          <div>
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              gap: 12, marginBottom: 14, flexWrap: 'wrap',
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 0.8,
                textTransform: 'uppercase', color: T.primaryDark,
              }}>
                Resource limits
              </div>
              {/* <span style={{ fontSize: 12, color: T.slate500 }}>Leave blank for platform defaults</span> */}
            </div>
            <div className="custom-plan-limits-grid" style={{ display: 'grid', gap: 12 }}>
              <LimitField icon="building" label="Organisations" name="maxOrganizations"
                value={data.maxOrganizations} onChange={onChange} />
              <LimitField icon="wifi" label="Venues" name="maxVenues"
                value={data.maxVenues} onChange={onChange} />
              <LimitField icon="cpu" label="Devices" name="maxDevices"
                value={data.maxDevices} onChange={onChange} />
              <LimitField icon="users" label="Users" name="maxUsers"
                value={data.maxUsers} onChange={onChange} />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="custom-plan-footer" style={{
          padding: '16px 22px', borderTop: `1px solid ${T.slate200}`,
          background: T.slate100, display: 'flex', gap: 10,
        }}>
          <button type="button" onClick={onClose}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 10,
              border: `1.5px solid ${T.slate200}`, background: T.white,
              color: T.slate700, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
            Cancel
          </button>
          <button type="button" onClick={onSubmit} disabled={submitting}
            style={{
              flex: 2, padding: '12px 16px', borderRadius: 10, border: 'none',
              background: submitting ? `${T.primary}99` : T.primary,
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background .15s',
            }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = T.primaryHover; }}
            onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = submitting ? `${T.primary}99` : T.primary; }}
          >
            {submitting ? 'Creating…' : (
              <>
                <Icon name={isAuthenticated ? 'sparkle' : 'arrowRight'} size={15} color="#fff" />
                {isAuthenticated ? 'Create plan' : 'Save & sign in'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── responsive styles ─────────────────────────────────────────────────────────
const SelectPlanStyles = () => (
  <style>{`
    .select-plan-nav { padding: 0 32px; }
    .select-plan-title { font-size: clamp(1.75rem, 4.5vw, 2.75rem); }
    .custom-plan-billing-grid { grid-template-columns: 1fr 1fr; }
    .custom-plan-limits-grid { grid-template-columns: 1fr 1fr; }
    @media (max-width: 640px) {
      .select-plan-nav { padding: 0 16px; }
      .select-plan-back-label { display: none; }
      .custom-plan-overlay { align-items: flex-end; padding: 0; }
      .custom-plan-modal {
        max-width: 100% !important;
        max-height: 94vh !important;
        border-radius: 20px 20px 0 0 !important;
      }
      .custom-plan-billing-grid,
      .custom-plan-limits-grid { grid-template-columns: 1fr; }
      .custom-plan-footer { flex-direction: column-reverse; }
      .custom-plan-footer button { flex: none !important; width: 100%; }
    }
    @media (max-width: 480px) {
      .select-plan-logo-text { display: none; }
    }
  `}</style>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
const SelectPlan = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasingPlanId, setPurchasingPlanId] = useState(null);
  const [customPlanModalOpen, setCustomPlanModalOpen] = useState(false);
  const [creatingCustom, setCreatingCustom] = useState(false);
  const [customPlanData, setCustomPlanData] = useState({ ...EMPTY_CUSTOM_PLAN });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { pendingPlan, pendingCustomPlan } = useSelector((s) => s.subscription);

  useEffect(() => { fetchPlans(); }, []);

  useEffect(() => {
    if (isAuthenticated && pendingPlan && plans.length > 0) {
      const plan = plans.find(p => p._id === pendingPlan.planId);
      if (plan) { dispatch(clearPendingPlan()); handleSelectPlan(plan); }
    }
  }, [isAuthenticated, pendingPlan, plans.length]);

  useEffect(() => {
    if (isAuthenticated && pendingCustomPlan) {
      setCustomPlanData(pendingCustomPlan);
      setCustomPlanModalOpen(true);
    }
  }, [isAuthenticated, pendingCustomPlan]);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/subscription/get-all-plans');
      setPlans(res.data.plans || []);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load subscription plans.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    if (!isAuthenticated) {
      dispatch(setPendingPlan({ planId: plan._id, name: plan.name }));
      navigate('/login', { state: { from: '/select-plan' } });
      return;
    }
    setPurchasingPlanId(plan._id);
    try {
      const result = await dispatch(purchaseSubscription({ planId: plan._id }));
      if (purchaseSubscription.fulfilled.match(result)) {
        Swal.fire({ icon: 'success', title: 'Subscription Activated', text: 'Your plan is now active!', timer: 2000, showConfirmButton: false });
        navigate('/management');
      } else throw new Error(result.payload?.message || 'Activation failed.');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Purchase Failed', text: err.message });
    } finally {
      setPurchasingPlanId(null);
    }
  };

  const handleCustomPlanInputChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['price', 'durationDays', 'maxOrganizations', 'maxVenues', 'maxDevices', 'maxUsers'];
    if (numericFields.includes(name)) {
      if (value === '') { setCustomPlanData(p => ({ ...p, [name]: '' })); return; }
      if (!/^\d+$/.test(value)) return;
      setCustomPlanData(p => ({ ...p, [name]: Number(value) })); return;
    }
    setCustomPlanData(p => ({ ...p, [name]: value }));
  };

  const handleCreateCustomPlan = async () => {
    const numericFields = ['price', 'durationDays', 'maxOrganizations', 'maxVenues', 'maxDevices', 'maxUsers'];
    if (!customPlanData.name || !customPlanData.price || !customPlanData.durationDays) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Name, price, and duration are required.' });
      return;
    }
    for (const field of numericFields) {
      if (customPlanData[field] !== '' && customPlanData[field] < 0) {
        Swal.fire({ icon: 'error', title: 'Invalid Input', text: `${field} cannot be negative.` }); return;
      }
    }
    if (!isAuthenticated) {
      dispatch(setPendingCustomPlan(customPlanData));
      navigate('/login', { state: { from: '/select-plan' } }); return;
    }
    setCreatingCustom(true);
    try {
      await api.post('/subscription/create-plan', { ...customPlanData, type: 'custom' });
      Swal.fire({ icon: 'success', title: 'Custom Plan Created', timer: 2000, showConfirmButton: false });
      dispatch(clearPendingCustomPlan());
      setCustomPlanModalOpen(false);
      fetchPlans();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Creation Failed', text: err.response?.data?.message || 'Failed to create custom plan.' });
    } finally {
      setCreatingCustom(false);
    }
  };

  const handleCloseCustomModal = () => {
    setCustomPlanModalOpen(false);
    if (!isAuthenticated) {
      setCustomPlanData({ ...EMPTY_CUSTOM_PLAN });
    }
  };

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: T.pageBg, fontFamily: 'inherit' }}>
      <SelectPlanStyles />

      {/* ── Top nav bar ──────────────────────────────────────────────────────── */}
      <nav className="select-plan-nav" style={{
        background: T.white, borderBottom: `1px solid ${T.slate200}`,
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
      }}>
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/logo.png" alt="IoTify" style={{ height: 30 }} onError={e => e.target.style.display = 'none'} />
          <span className="select-plan-logo-text" style={{ fontWeight: 700, fontSize: 17, color: T.primary }}>IoTify</span>
        </NavLink>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <NavLink to="/" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 14, fontWeight: 500, color: T.slate500, textDecoration: 'none',
          }}
            onMouseEnter={e => e.currentTarget.style.color = T.primary}
            onMouseLeave={e => e.currentTarget.style.color = T.slate500}
          >
            <Icon name="arrowLeft" size={14} color="currentColor" />
            <span className="select-plan-back-label">Back to home</span>
          </NavLink>
          {isAuthenticated ? (
            <button onClick={() => navigate(user?.role === 'admin' ? '/admin/management' : '/management')}
              style={{
                background: T.primary, color: '#fff', border: 'none',
                borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'background .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = T.primaryHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.primary; }}
            >
              Dashboard
            </button>
          ) : (
            <NavLink to="/login" style={{
              background: T.primary, color: '#fff', borderRadius: 8,
              padding: '7px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}>
              Sign in
            </NavLink>
          )}
        </div>
      </nav>

      {/* ── Page content ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 96px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: T.primaryTint, color: T.primaryDark,
            fontSize: 13, fontWeight: 600, padding: '5px 14px', borderRadius: 20,
            border: `1px solid ${T.primaryBorder}`, marginBottom: 18,
          }}>
            <Icon name="wifi" size={13} color={T.primary} /> Simple, transparent pricing
          </div>
          <h1 className="select-plan-title" style={{
            fontWeight: 800, color: T.slate900,
            letterSpacing: '-1.5px', margin: '0 0 14px', lineHeight: 1.1,
          }}>
            Choose the right plan
          </h1>
          <p style={{ fontSize: 17, color: T.slate500, maxWidth: 500, margin: '0 auto', lineHeight: 1.65 }}>
            All plans include live sensor dashboards, alerts, scheduling, and trigger modes.
            Scale up as your fleet grows.
          </p>

          {/* Guest notice */}
          {!isAuthenticated && (
            <div style={{
              marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 10,
              background: '#fefce8', border: '1px solid #fde68a',
              borderRadius: 10, padding: '10px 18px', fontSize: 13, color: '#92400e',
            }}>
              <Icon name="zap" size={14} color="#d97706" />
              You're browsing as a guest — selecting a plan will prompt you to sign in.
            </div>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: 44, height: 44, border: `3px solid ${T.slate200}`,
              borderTopColor: T.primary, borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
            }} />
            <p style={{ color: T.slate500, fontSize: 15 }}>Loading plans…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {/* Plans grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`,
              gap: 24, alignItems: 'stretch',
            }}>
              {plans.map((plan, i) => {
                const accent = getPlanAccent(plan, i);
                return (
                  <PlanCard
                    key={plan._id}
                    plan={plan}
                    accent={accent}
                    isPending={pendingPlan?.planId === plan._id}
                    isPurchasing={purchasingPlanId === plan._id}
                    onSelect={handleSelectPlan}
                  />
                );
              })}
              <CustomPlanCard onClick={() => setCustomPlanModalOpen(true)} />
            </div>

            {/* Bottom reassurance row */}
            <div style={{
              marginTop: 56, display: 'flex', justifyContent: 'center',
              flexWrap: 'wrap', gap: 32,
            }}>
              {[
                { icon: 'shield', color: '#16a34a', text: 'No lock-in — cancel any time' },
                { icon: 'zap',    color: '#d97706', text: 'Instant activation after payment' },
                { icon: 'cpu',    color: T.primary,    text: 'OTA updates on all plans' },
                { icon: 'users',  color: '#8b5cf6', text: 'Role-based access included' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, color: T.slate500, fontSize: 14 }}>
                  <Icon name={r.icon} size={16} color={r.color} />
                  {r.text}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <CustomPlanModal
        open={customPlanModalOpen}
        onClose={handleCloseCustomModal}
        data={customPlanData}
        onChange={handleCustomPlanInputChange}
        onSubmit={handleCreateCustomPlan}
        isAuthenticated={isAuthenticated}
        submitting={creatingCustom}
      />
    </div>
  );
};

export default SelectPlan;