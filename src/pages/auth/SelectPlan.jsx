// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';
// import api from '../../services/api';

// const SelectPlan = () => {
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [purchasing, setPurchasing] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchPlans();
//   }, []);

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

//   const handleSelectPlan = async (planId) => {
//     setPurchasing(true);
//     try {
//       await api.post('/subscription/purchase', { planId });

//       Swal.fire({
//         icon: 'success',
//         title: 'Subscription Activated',
//         text: 'Your subscription has been activated successfully!',
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       // Redirect to management dashboard
//       navigate('/management');
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Purchase Failed',
//         text: error.response?.data?.message || 'Failed to activate subscription.',
//       });
//     } finally {
//       setPurchasing(false);
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

//         <div className="grid md:grid-cols-3 gap-8">
//           {plans.map((plan) => (
//             <div
//               key={plan._id}
//               className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
//             >
//               <div className="text-center">
//                 <h3 className="text-2xl font-bold text-gray-900 capitalize">{plan.name}</h3>
//                 <p className="text-gray-600 mt-2">{plan.description}</p>
//                 <div className="mt-6">
//                   <span className="text-4xl font-bold text-blue-600">${plan.price}</span>
//                   <span className="text-gray-600">/{plan.durationDays} days</span>
//                 </div>
//               </div>

//               <ul className="mt-8 space-y-4">
//                 <li className="flex items-center text-gray-700">
//                   <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                   </svg>
//                   {plan.maxOrganizations} Organizations
//                 </li>
//                 <li className="flex items-center text-gray-700">
//                   <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                   </svg>
//                   {plan.maxVenues} Venues
//                 </li>
//                 <li className="flex items-center text-gray-700">
//                   <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                   </svg>
//                   {plan.maxDevices} Devices
//                 </li>
//                 <li className="flex items-center text-gray-700">
//                   <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                   </svg>
//                   {plan.maxUsers} Users
//                 </li>
//               </ul>

//               <button
//                 onClick={() => handleSelectPlan(plan._id)}
//                 disabled={purchasing}
//                 className={`w-full mt-8 py-3 px-4 rounded-lg font-medium text-white ${
//                   purchasing
//                     ? 'bg-blue-400 cursor-not-allowed'
//                     : 'bg-blue-600 hover:bg-blue-700'
//                 }`}
//               >
//                 {purchasing ? 'Processing...' : 'Select Plan'}
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SelectPlan;



import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import api from '../../services/api';
import { setPendingPlan, setPendingCustomPlan, clearPendingPlan, clearPendingCustomPlan, purchaseSubscription } from '../../slices/subscriptionSlice';

const SelectPlan = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasingPlanId, setPurchasingPlanId] = useState(null);
  const [customPlanModalOpen, setCustomPlanModalOpen] = useState(false);
  const [customPlanData, setCustomPlanData] = useState({
    name: '',
    description: '',
    price: '',
    durationDays: '',
    maxOrganizations: '',
    maxVenues: '',
    maxDevices: '',
    maxUsers: '',
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { pendingPlan, pendingCustomPlan } = useSelector((state) => state.subscription);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    // Handle pending plan after login - only process once
    if (isAuthenticated && pendingPlan && plans.length > 0) {
      const plan = plans.find(p => p._id === pendingPlan.planId);
      if (plan) {
        // Clear the pending plan first to prevent re-triggering
        dispatch(clearPendingPlan());
        handleSelectPlan(plan);
      }
    }
  }, [isAuthenticated, pendingPlan, plans.length]);

  useEffect(() => {
    // Handle pending custom plan after login - only process once
    if (isAuthenticated && pendingCustomPlan) {
      setCustomPlanData(pendingCustomPlan);
      setCustomPlanModalOpen(true);
      // Don't clear here - clear after successful creation
    }
  }, [isAuthenticated, pendingCustomPlan]);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscription/get-all-plans');
      setPlans(response.data.plans || []);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load subscription plans.',
      });
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
        Swal.fire({
          icon: 'success',
          title: 'Subscription Activated',
          text: 'Your subscription has been activated successfully!',
          timer: 2000,
          showConfirmButton: false,
        });
        navigate('/management');
      } else {
        throw new Error(result.payload?.message || 'Failed to activate subscription.');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Purchase Failed',
        text: error.message || 'Failed to activate subscription.',
      });
    } finally {
      setPurchasingPlanId(null);
    }
  };

  const handleOpenCustomPlanModal = () => {
    setCustomPlanModalOpen(true);
  };

  const handleCloseCustomPlanModal = () => {
    setCustomPlanModalOpen(false);
    if (!isAuthenticated) {
      setCustomPlanData({
        name: '',
        description: '',
        price: '',
        durationDays: '',
        maxOrganizations: '',
        maxVenues: '',
        maxDevices: '',
        maxUsers: '',
      });
    }
  };

  const handleCustomPlanInputChange = (e) => {
    const { name, value } = e.target;
    
      // fields that must be numeric
    const numericFields = [
      'price',
      'durationDays',
      'maxOrganizations',
      'maxVenues',
      'maxDevices',
      'maxUsers',
    ];

   if (numericFields.includes(name)) {
    // allow empty input
    if (value === '') {
      setCustomPlanData(prev => ({
        ...prev,
        [name]: '',
      }));
      return;
    }
  
        // block non-numeric input
    if (!/^\d+$/.test(value)) return;

    const num = Number(value);

    setCustomPlanData(prev => ({
      ...prev,
      [name]: num,
    }));
    return;
  }


    setCustomPlanData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCustomPlan = async () => {
      const numericFields = [
    'price',
    'durationDays',
    'maxOrganizations',
    'maxVenues',
    'maxDevices',
    'maxUsers',
  ];


    // Validate inputs
    if (!customPlanData.name || !customPlanData.price || !customPlanData.durationDays) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields (Name, Price, Duration).',
      });
      return;
    }

    // negative number validation
  for (let field of numericFields) {
    const value = customPlanData[field];

    if (value !== '' && value < 0) {
      return Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: `${field} cannot be less than 0`,
      });
    }
  }

    if (!isAuthenticated) {
      // Save custom plan to Redux and redirect to login
      dispatch(setPendingCustomPlan(customPlanData));
      navigate('/login', { state: { from: '/select-plan' } });
      return;
    }

    // If authenticated, create the custom plan
    try {
      const planPayload = {
        ...customPlanData,
        type: 'custom', // Required by backend
      };
      const response = await api.post('/subscription/create-plan', planPayload);

      Swal.fire({
        icon: 'success',
        title: 'Custom Plan Created',
        text: 'Your custom plan has been created successfully!',
        timer: 2000,
        showConfirmButton: false,
      });

      dispatch(clearPendingCustomPlan());
      handleCloseCustomPlanModal();
      fetchPlans(); // Refresh plans list
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Creation Failed',
        text: error.response?.data?.message || 'Failed to create custom plan.',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <img src="/logo.png" alt="IoTify Logo" className="h-10 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
          <p className="text-gray-600 mt-2">Select a subscription plan to get started</p>
        </div>

        <div className="mb-8 text-center">
          <button
            onClick={handleOpenCustomPlanModal}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
          >
            Create Custom Plan
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isSelectedPending = pendingPlan?.planId === plan._id;
            return (
              <div
                key={plan._id}
                className={`bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow ${
                  isSelectedPending ? 'ring-4 ring-blue-500' : ''
                }`}
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 capitalize">{plan.name}</h3>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-blue-600">${plan.price}</span>
                    <span className="text-gray-600">/{plan.durationDays} days</span>
                  </div>
                </div>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-center text-gray-700">{plan.maxOrganizations} Organizations</li>
                  <li className="flex items-center text-gray-700">{plan.maxVenues} Venues</li>
                  <li className="flex items-center text-gray-700">{plan.maxDevices} Devices</li>
                  <li className="flex items-center text-gray-700">{plan.maxUsers} Users</li>
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={purchasingPlanId === plan._id}
                  className={`w-full mt-8 py-3 px-4 rounded-lg font-medium text-white ${
                    purchasingPlanId === plan._id
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {purchasingPlanId === plan._id ? 'Processing...' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Custom Plan Modal */}
        <Dialog open={customPlanModalOpen} onClose={handleCloseCustomPlanModal} maxWidth="sm" fullWidth>
          <DialogTitle>Create Custom Plan</DialogTitle>
          <DialogContent>
            <Stack  spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Plan Name"
                name="name"
                value={customPlanData.name}
                onChange={handleCustomPlanInputChange}
                required
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={customPlanData.description}
                onChange={handleCustomPlanInputChange}
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label="Price ($)"
                name="price"
                type="number"
                value={customPlanData.price}
                onChange={handleCustomPlanInputChange}
                inputProps={{
                  min: 0,
                }}
                required
              />
              <TextField
                fullWidth
                label="Duration (Days)"
                name="durationDays"
                type="number"
                value={customPlanData.durationDays}
                onChange={handleCustomPlanInputChange}
                inputProps={{
                  min: 0,
                }}
                required
              />
              <TextField
                fullWidth
                label="Max Organizations"
                name="maxOrganizations"
                type="number"
                value={customPlanData.maxOrganizations}
                onChange={handleCustomPlanInputChange}
                inputProps={{
                  min: 0,
                }}
              />
              <TextField
                fullWidth
                label="Max Venues"
                name="maxVenues"
                type="number"
                value={customPlanData.maxVenues}
                onChange={handleCustomPlanInputChange}
                inputProps={{
                  min: 0,
                }}
              />
              <TextField
                fullWidth
                label="Max Devices"
                name="maxDevices"
                type="number"
                value={customPlanData.maxDevices}
                onChange={handleCustomPlanInputChange}
                inputProps={{
                  min: 0,
                }}
              />
              <TextField
                fullWidth
                label="Max Users"
                name="maxUsers"
                type="number"
                value={customPlanData.maxUsers}
                onChange={handleCustomPlanInputChange}
                inputProps={{
                  min: 0,
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCustomPlanModal}>Cancel</Button>
            <Button onClick={handleCreateCustomPlan} variant="contained" color="primary">
              {isAuthenticated ? 'Create Plan' : 'Save & Login'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default SelectPlan;