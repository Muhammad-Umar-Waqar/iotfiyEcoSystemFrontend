// import { useEffect, useState } from 'react';
// import { subscriptionService } from '../../services/subscriptionService';
// import Swal from 'sweetalert2';

// const Plans = () => {
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editingPlan, setEditingPlan] = useState(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     type: 'basic',
//     description: '',
//     price: 0,
//     durationDays: 30,
//     maxOrganizations: 1,
//     maxVenues: 5,
//     maxDevices: 10,
//     maxUsers: 5,
//   });

//   useEffect(() => {
//     fetchPlans();
//   }, []);

//   const fetchPlans = async () => {
//     try {
//       const data = await subscriptionService.getAllPlans();
//       setPlans(data.plans || []);
//     } catch (error) {
//       console.error('Failed to fetch plans:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreate = async (e) => {
//     e.preventDefault();

//     if (!formData.name.trim()) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Missing Name',
//         text: 'Please enter plan name.',
//       });
//       return;
//     }

//     try {
//       await subscriptionService.createPlan(formData);
//       Swal.fire({
//         icon: 'success',
//         title: 'Success',
//         text: 'Plan created successfully!',
//         timer: 2000,
//         showConfirmButton: false,
//       });
//       setShowModal(false);
//       resetForm();
//       fetchPlans();
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: error.response?.data?.message || 'Failed to create plan.',
//       });
//     }
//   };

//   const handleDelete = async (id, name) => {
//     const result = await Swal.fire({
//       title: 'Delete Plan',
//       text: `Are you sure you want to delete "${name}"?`,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#ef4444',
//       cancelButtonColor: '#6b7280',
//       confirmButtonText: 'Yes, delete it',
//     });

//     if (result.isConfirmed) {
//       try {
//         await subscriptionService.deletePlan(id);
//         Swal.fire({
//           icon: 'success',
//           title: 'Deleted',
//           text: 'Plan deleted successfully!',
//           timer: 2000,
//           showConfirmButton: false,
//         });
//         fetchPlans();
//       } catch (error) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: error.response?.data?.message || 'Failed to delete plan.',
//         });
//       }
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       type: 'basic',
//       description: '',
//       price: 0,
//       durationDays: 30,
//       maxOrganizations: 1,
//       maxVenues: 5,
//       maxDevices: 10,
//       maxUsers: 5,
//     });
//     setEditingPlan(null);
//   };

//   return (
//     <div className="p-8">
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
//           <p className="text-gray-600 mt-2">{plans.length} plans available</p>
//         </div>
//         <button
//           onClick={() => setShowModal(true)}
//           className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           + Create Plan
//         </button>
//       </div>

//       {loading ? (
//         <div className="text-center py-12">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//         </div>
//       ) : plans.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {plans.map((plan) => (
//             <div
//               key={plan._id}
//               className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
//             >
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex-1">
//                   <h3 className="text-xl font-semibold text-gray-900 capitalize">{plan.name}</h3>
//                   <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
//                     {plan.type}
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => handleDelete(plan._id, plan.name)}
//                   className="text-red-600 hover:text-red-800 text-xl"
//                 >
//                   🗑️
//                 </button>
//               </div>

//               <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

//               <div className="mb-4">
//                 <div className="text-3xl font-bold text-blue-600">${plan.price}</div>
//                 <div className="text-sm text-gray-600">per {plan.durationDays} days</div>
//               </div>

//               <div className="space-y-2 border-t border-gray-200 pt-4">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Organizations:</span>
//                   <span className="font-semibold text-gray-900">{plan.maxOrganizations}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Venues:</span>
//                   <span className="font-semibold text-gray-900">{plan.maxVenues}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Devices:</span>
//                   <span className="font-semibold text-gray-900">{plan.maxDevices}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Users:</span>
//                   <span className="font-semibold text-gray-900">{plan.maxUsers}</span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow p-12 text-center">
//           <p className="text-gray-500 text-lg">No plans yet. Create your first one!</p>
//         </div>
//       )}

//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
//           <div className="bg-white rounded-lg p-8 max-w-2xl w-full my-8">
//             <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Subscription Plan</h2>
//             <form onSubmit={handleCreate}>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Plan Name
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="e.g., Premium Plan"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
//                   <select
//                     value={formData.type}
//                     onChange={(e) => setFormData({ ...formData, type: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="free">Free</option>
//                     <option value="basic">Basic</option>
//                     <option value="premium">Premium</option>
//                     <option value="custom">Custom</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Price ($)
//                   </label>
//                   <input
//                     type="number"
//                     value={formData.price}
//                     onChange={(e) =>
//                       setFormData({ ...formData, price: parseFloat(e.target.value) })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>

//                 <div className="col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Description
//                   </label>
//                   <textarea
//                     value={formData.description}
//                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     rows="2"
//                     placeholder="Plan description"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Duration (Days)
//                   </label>
//                   <input
//                     type="number"
//                     value={formData.durationDays}
//                     onChange={(e) =>
//                       setFormData({ ...formData, durationDays: parseInt(e.target.value) })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Max Organizations
//                   </label>
//                   <input
//                     type="number"
//                     value={formData.maxOrganizations}
//                     onChange={(e) =>
//                       setFormData({ ...formData, maxOrganizations: parseInt(e.target.value) })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Max Venues
//                   </label>
//                   <input
//                     type="number"
//                     value={formData.maxVenues}
//                     onChange={(e) =>
//                       setFormData({ ...formData, maxVenues: parseInt(e.target.value) })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Max Devices
//                   </label>
//                   <input
//                     type="number"
//                     value={formData.maxDevices}
//                     onChange={(e) =>
//                       setFormData({ ...formData, maxDevices: parseInt(e.target.value) })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Max Users
//                   </label>
//                   <input
//                     type="number"
//                     value={formData.maxUsers}
//                     onChange={(e) =>
//                       setFormData({ ...formData, maxUsers: parseInt(e.target.value) })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>

//               <div className="flex gap-4 mt-6">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowModal(false);
//                     resetForm();
//                   }}
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                 >
//                   Create Plan
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Plans;




import React from 'react';

const Plans = () => {
  return (
    <div className="plans-page">
      <h1>Subscription Plans</h1>
      <p>Placeholder template for subscription plans management page.</p>
    </div>
  );
};

export default Plans;