// src/pages/management/SubscriptionAnalytics/page.jsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchOrganizationsByOwner } from "../../../slices/OrganizationSlice";
import { fetchSubUsers } from "../../../slices/UserSlice";
import api from "../../../services/api";
import {
  Building,
  MapPin,
  Cpu,
  Users,
  Calendar,
  TrendingUp,
  Award,
  AlertCircle
} from "lucide-react";
import "../../../styles/pages/management-pages.css";

const SubscriptionAnalytics = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { Organizations = [] } = useSelector((state) => state.Organization || {});
  const { subUsers = [] } = useSelector((state) => state.User || {});
  const { venuesByOrg = {} } = useSelector((state) => state.Venue || {});
  const { devicesByVenue = {} } = useSelector((state) => state.Device || {});

  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isManager = user?.role === "manager";

  useEffect(() => {
    if (!isManager || !user?.id) return;

    const fetchData = async () => {
      try {
        // Fetch all required data
        await dispatch(fetchOrganizationsByOwner(user.id));
        await dispatch(fetchSubUsers(user.id));

        // Fetch subscription details
        const response = await api.get(`/subscription/usage/${user.id}`);
        setSubscriptionData(response.data);
      } catch (error) {
        console.error("Failed to fetch subscription data:", error);
        // Set default limits if API fails
        setSubscriptionData({
          plan: "Free",
          limits: {
            organizations: 5,
            venues: 10,
            devices: 50,
            users: 10,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, user, isManager]);

  // Calculate current usage
  const organizationCount = Organizations.length;
  const venueCount = Object.values(venuesByOrg).reduce((total, venues) => total + venues.length, 0);
  const deviceCount = Object.values(devicesByVenue).reduce((total, devices) => total + devices.length, 0);
  const userCount = subUsers.length;

  // Get limits from subscription or defaults
  const limits = subscriptionData?.limits || {
    organizations: 5,
    venues: 10,
    devices: 50,
    users: 10,
  };

  const planName = subscriptionData?.plan || user?.currentSubscription?.plan || "Free Plan";
  const planStatus = subscriptionData?.status || "active";
  const planExpiry = subscriptionData?.endDate || user?.currentSubscription?.endDate;

  // Calculate percentage and determine color
  const getUsagePercentage = (current, limit) => {
    if (!limit) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getColorClass = (percentage) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getTextColorClass = (percentage) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const usageData = [
    {
      icon: Building,
      label: "Organizations",
      current: organizationCount,
      limit: limits.organizations,
      color: "blue",
    },
    {
      icon: MapPin,
      label: "Venues",
      current: venueCount,
      limit: limits.venues,
      color: "purple",
    },
    {
      icon: Cpu,
      label: "Devices",
      current: deviceCount,
      limit: limits.devices,
      color: "indigo",
    },
    {
      icon: Users,
      label: "Users",
      current: userCount,
      limit: limits.users,
      color: "teal",
    },
  ];

  // Access denied for non-managers
  if (!isManager) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only managers can view subscription analytics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Analytics</h1>
        <p className="text-gray-600">Monitor your subscription usage and limits</p>
      </div>

      {/* Plan Info Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 mb-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award size={24} />
              <h2 className="text-2xl font-bold">{planName}</h2>
            </div>
            <p className="text-blue-100">
              Status: <span className="font-semibold">{planStatus === "active" ? "Active" : "Inactive"}</span>
            </p>
            {planExpiry && (
              <div className="flex items-center gap-2 mt-2 text-blue-100">
                <Calendar size={16} />
                <span>Expires: {new Date(planExpiry).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <TrendingUp size={48} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Usage Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {usageData.map((item) => {
          const percentage = getUsagePercentage(item.current, item.limit);
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${item.color}-100`}>
                  <Icon className={`text-${item.color}-600`} size={24} />
                </div>
                <span className={`text-2xl font-bold ${getTextColorClass(percentage)}`}>
                  {item.current}/{item.limit}
                </span>
              </div>

              <h3 className="text-gray-700 font-semibold mb-2">{item.label}</h3>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full transition-all ${getColorClass(percentage)}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{percentage.toFixed(1)}% used</span>
                <span className={`font-semibold ${getTextColorClass(percentage)}`}>
                  {item.limit - item.current} left
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Summary */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Usage Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-gray-700 font-semibold mb-3">Resource Utilization</h3>
            <ul className="space-y-2">
              {usageData.map((item) => {
                const percentage = getUsagePercentage(item.current, item.limit);
                return (
                  <li key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.label}</span>
                    <span className={`font-semibold ${getTextColorClass(percentage)}`}>
                      {percentage >= 90 ? "⚠️ Near Limit" : percentage >= 70 ? "⚡ High Usage" : "✅ Good"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="text-gray-700 font-semibold mb-3">Recommendations</h3>
            <div className="space-y-2 text-sm">
              {usageData.some(item => getUsagePercentage(item.current, item.limit) >= 90) ? (
                <div className="flex items-start gap-2 text-red-600">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <p>You're approaching your subscription limits. Consider upgrading your plan.</p>
                </div>
              ) : usageData.some(item => getUsagePercentage(item.current, item.limit) >= 70) ? (
                <div className="flex items-start gap-2 text-yellow-600">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <p>Your usage is high. Monitor your resources to avoid reaching limits.</p>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-green-600">
                  <TrendingUp size={16} className="mt-0.5 flex-shrink-0" />
                  <p>Your subscription usage is healthy. You have plenty of resources available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionAnalytics;
