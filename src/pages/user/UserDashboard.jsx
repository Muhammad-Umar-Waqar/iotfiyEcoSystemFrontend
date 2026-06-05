import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { deviceService } from '../../services/deviceService';
import useWebSocket from '../../hooks/useWebSocket';

const UserDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [devices, setDevices] = useState([]);
  const [deviceData, setDeviceData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDevices();
  }, []);

  const fetchUserDevices = async () => {
    try {
      const data = await deviceService.getAll();
      const userVenues = user?.venues || [];
      const filteredDevices = data.devices.filter((device) =>
        userVenues.includes(device.venue?._id)
      );
      setDevices(filteredDevices);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket integration for real-time device data
  const handleDeviceUpdate = (data) => {
    setDeviceData((prev) => ({
      ...prev,
      [data.deviceId]: data.data,
    }));
  };

  const handleDeviceStatus = (data) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.deviceId === data.deviceId
          ? { ...device, status: data.status }
          : device
      )
    );
  };

  const deviceIds = devices.map((d) => d.deviceId);
  const { isConnected } = useWebSocket(deviceIds, handleDeviceUpdate, handleDeviceStatus);

  const getDeviceStatus = (device) => {
    return device.status || 'offline';
  };

  const getDeviceData = (deviceId) => {
    return deviceData[deviceId] || null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
              <p className="text-gray-600 mt-1">View your assigned devices</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Permission</p>
              <p className="text-lg font-semibold text-blue-600 capitalize">
                {user?.permission || 'View'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">My Devices</h2>
          <p className="text-gray-600 mt-1">
            {devices.length} device{devices.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : devices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => {
              const status = getDeviceStatus(device);
              const liveData = getDeviceData(device.deviceId);

              return (
                <div
                  key={device._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {device.deviceName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">ID: {device.deviceId}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                        📟
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          status === 'online'
                            ? 'bg-green-100 text-green-800'
                            : status === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium text-gray-900">{device.deviceType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {device.category}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Venue:</span>
                      <span className="font-medium text-gray-900">
                        {device.venue?.name || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {liveData && (
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Live Data {isConnected && '🔴'}
                      </h4>
                      <div className="space-y-1">
                        {liveData.temperature !== undefined && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Temperature:</span>
                            <span className="font-medium text-blue-600">
                              {liveData.temperature}°C
                            </span>
                          </div>
                        )}
                        {liveData.humidity !== undefined && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Humidity:</span>
                            <span className="font-medium text-blue-600">
                              {liveData.humidity}%
                            </span>
                          </div>
                        )}
                        {liveData.AQI !== undefined && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">AQI:</span>
                            <span className="font-medium text-blue-600">{liveData.AQI}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📟</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Devices Assigned</h3>
            <p className="text-gray-600">
              You don't have any devices assigned to you yet. Please contact your manager.
            </p>
          </div>
        )}

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Venues</h3>
          {user?.venues && user.venues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.venues.map((venueId, index) => (
                <div key={venueId} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl mr-3">🏟️</span>
                  <span className="text-gray-700">Venue {index + 1}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No venues assigned</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
