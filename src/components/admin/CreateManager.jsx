import { useState } from 'react';
import { authService } from '../../services/authService';
import { subscriptionService } from '../../services/subscriptionService';
import Swal from 'sweetalert2';

const CreateManager = () => {
  const [showModal, setShowModal] = useState(false);
  const [showCustomPlanModal, setShowCustomPlanModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [customPlanData, setCustomPlanData] = useState({
    email: '',
    name: '',
    price: 0,
    durationDays: 30,
    maxOrganizations: 1,
    maxVenues: 5,
    maxDevices: 10,
    maxUsers: 5,
  });

  const handleCreateManager = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all fields.',
      });
      return;
    }

    try {
      await authService.adminCreateUser(formData);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Manager created successfully! Setup link sent to email.',
        timer: 2000,
        showConfirmButton: false,
      });
      setShowModal(false);
      setFormData({ name: '', email: '' });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create manager.',
      });
    }
  };

  const handleCreateCustomPlan = async (e) => {
    e.preventDefault();

    if (!customPlanData.email.trim() || !customPlanData.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all required fields.',
      });
      return;
    }

    try {
      await subscriptionService.assignCustomPlan(customPlanData.email, {
        name: customPlanData.name,
        type: 'custom',
        price: customPlanData.price,
        durationDays: customPlanData.durationDays,
        maxOrganizations: customPlanData.maxOrganizations,
        maxVenues: customPlanData.maxVenues,
        maxDevices: customPlanData.maxDevices,
        maxUsers: customPlanData.maxUsers,
      });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Custom plan assigned successfully!',
        timer: 2000,
        showConfirmButton: false,
      });
      setShowCustomPlanModal(false);
      setCustomPlanData({
        email: '',
        name: '',
        price: 0,
        durationDays: 30,
        maxOrganizations: 1,
        maxVenues: 5,
        maxDevices: 10,
        maxUsers: 5,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to assign custom plan.',
      });
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        + Create Manager
      </button>
      <button
        onClick={() => setShowCustomPlanModal(true)}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        + Assign Custom Plan
      </button>

      {/* Create Manager Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Manager</h2>
            <form onSubmit={handleCreateManager}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter manager name"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', email: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Plan Modal */}
      {showCustomPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Assign Custom Plan</h2>
            <form onSubmit={handleCreateCustomPlan}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manager Email
                  </label>
                  <input
                    type="email"
                    value={customPlanData.email}
                    onChange={(e) =>
                      setCustomPlanData({ ...customPlanData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="manager@example.com"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={customPlanData.name}
                    onChange={(e) =>
                      setCustomPlanData({ ...customPlanData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Custom Enterprise Plan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={customPlanData.price}
                    onChange={(e) =>
                      setCustomPlanData({ ...customPlanData, price: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={customPlanData.durationDays}
                    onChange={(e) =>
                      setCustomPlanData({
                        ...customPlanData,
                        durationDays: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Organizations
                  </label>
                  <input
                    type="number"
                    value={customPlanData.maxOrganizations}
                    onChange={(e) =>
                      setCustomPlanData({
                        ...customPlanData,
                        maxOrganizations: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Venues
                  </label>
                  <input
                    type="number"
                    value={customPlanData.maxVenues}
                    onChange={(e) =>
                      setCustomPlanData({
                        ...customPlanData,
                        maxVenues: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Devices
                  </label>
                  <input
                    type="number"
                    value={customPlanData.maxDevices}
                    onChange={(e) =>
                      setCustomPlanData({
                        ...customPlanData,
                        maxDevices: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Users
                  </label>
                  <input
                    type="number"
                    value={customPlanData.maxUsers}
                    onChange={(e) =>
                      setCustomPlanData({
                        ...customPlanData,
                        maxUsers: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomPlanModal(false);
                    setCustomPlanData({
                      email: '',
                      name: '',
                      price: 0,
                      durationDays: 30,
                      maxOrganizations: 1,
                      maxVenues: 5,
                      maxDevices: 10,
                      maxUsers: 5,
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Assign Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateManager;
