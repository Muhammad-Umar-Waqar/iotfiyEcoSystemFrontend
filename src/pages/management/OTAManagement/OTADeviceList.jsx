// src/components/ota/OTADeviceList.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import "../../../styles/pages/management-pages.css";
import VersionsDropdown from "./VersionDropDown";
import { Drawer, IconButton, useMediaQuery } from "@mui/material";
import { Menu } from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import { useDeviceWebSocket } from "../../../hooks/useDeviceWebSocket";
import { io } from 'socket.io-client';

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";
const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5054';

const toast = (title, icon = "success", timer = 2500) =>
  Swal.fire({ toast: true, position: "top-end", showConfirmButton: false, timer, title, icon });

// Device Type mapping: Backend code -> Frontend display name
const DEVICE_TYPES = {
  'OD': 'Odour Device',
  'THD': 'Temperature Humidity Device',
  'AQID': 'AQI Device',
  'GLD': 'Gas Leakage Device',
  'ED': 'Energy Device'
};

const OTADeviceList = ({ selectedVersion, onVersionSelect }) => {

  const [allDevices, setAllDevices] = useState([]); // All devices from API
  const [loading, setLoading] = useState(true);
  const [selectedDevices, setSelectedDevices] = useState(new Set());
  const [deviceType, setDeviceType] = useState('THD'); // ✅ Default to Temperature Humidity Device
  const [otaObjects, setOtaObjects] = useState([]); // ✅ Store full OTA objects
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(selectedVersion || "");
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [otaInProgress, setOtaInProgress] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [deviceProgressMap, setDeviceProgressMap] = useState(new Map()); // deviceId -> progress %
  const [deviceStatusMap, setDeviceStatusMap] = useState(new Map()); // deviceId -> status

  const navigate = useNavigate();
  const otaSocketRef = useRef(null); // Separate socket for OTA progress

  // ✅ Refs to store latest values for socket event handlers (avoid stale closures)
  const otaInProgressRef = useRef(false);
  const selectedDevicesRef = useRef(new Set());
  const deviceStatusMapRef = useRef(new Map());

  // ✅ Keep refs in sync with state
  useEffect(() => {
    otaInProgressRef.current = otaInProgress;
  }, [otaInProgress]);

  useEffect(() => {
    selectedDevicesRef.current = selectedDevices;
  }, [selectedDevices]);

  useEffect(() => {
    deviceStatusMapRef.current = deviceStatusMap;
  }, [deviceStatusMap]);

  // ✅ Use WebSocket hook for real-time device data
  const { deviceDataMap, deviceOnlineMap, isConnected } = useDeviceWebSocket(allDevices);

  console.log('🔌 WebSocket Status:', isConnected ? 'Connected' : 'Disconnected');
  console.log('📊 Device Data Map:', deviceDataMap);
  console.log('📶 Device Online Map:', deviceOnlineMap);

  // ✅ Fetch all devices from API
  useEffect(() => {
    const fetchAllDevices = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE}/device/all`, {
          credentials: 'include',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.ok) {
          const data = await res.json();
          setAllDevices(data.devices || []);
        } else {
          console.error('Failed to fetch devices:', res.status);
          setAllDevices([]);
        }
      } catch (err) {
        console.error('Error fetching devices:', err);
        setAllDevices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDevices();
  }, []);

  // ✅ Fetch OTA versions based on selected device type
  useEffect(() => {
    const fetchVersionsByDeviceType = async () => {
      if (!deviceType) return;

      setLoadingVersions(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE}/ota/versions/${deviceType}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.ok) {
          const data = await res.json();
          setOtaObjects(data.otas || []); // ✅ Store full OTA objects
          const versionList = (data.otas || []).map(ota => ota.version);
          setVersions(versionList);
          setCurrentVersion('');
        } else if (res.status === 404) {
          setOtaObjects([]);
          setVersions([]);
          setCurrentVersion('');
        } else {
          console.error('Failed to fetch versions:', res.status);
          setOtaObjects([]);
          setVersions([]);
          setCurrentVersion('');
        }
      } catch (err) {
        console.error('Error fetching OTA versions:', err);
        setOtaObjects([]);
        setVersions([]);
        setCurrentVersion('');
      } finally {
        setLoadingVersions(false);
      }
    };

    fetchVersionsByDeviceType();
  }, [deviceType]);

  // ✅ Initialize OTA progress socket
  useEffect(() => {
    console.log('🔌 Initializing OTA progress socket');

    otaSocketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    const socket = otaSocketRef.current;

    socket.on('connect', () => {
      console.log('✅ OTA Socket Connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ OTA Socket Disconnected');
    });

    // Listen for general OTA progress
    socket.on('ota-progress', (data) => {
      console.log('📊 OTA Progress Update:', data);
      handleOTAProgressUpdate(data);
    });

    // ✅ Listen for device status updates (online/offline) from backend
    socket.on('deviceStatusUpdate', (data) => {
      console.log('📶 Device Status Update during OTA:', data);
      handleDeviceStatusUpdate(data);
    });

    return () => {
      console.log('🔌 Disconnecting OTA socket');
      socket.disconnect();
    };
  }, []);

  // ✅ Handle device status updates (mark as failed if offline during OTA)
  const handleDeviceStatusUpdate = (data) => {
    const { deviceId, status } = data;

    console.log(`🔍 Checking device ${deviceId} status:`, {
      status,
      otaInProgress: otaInProgressRef.current,
      isSelected: selectedDevicesRef.current.has(deviceId),
      currentStatus: deviceStatusMapRef.current.get(deviceId)
    });

    // ✅ Use refs for current values (avoid stale closure)
    if (!otaInProgressRef.current || !selectedDevicesRef.current.has(deviceId)) {
      console.log(`⏭️ Skipping - OTA not in progress or device not selected`);
      return;
    }

    // If device goes offline during OTA, mark it as failed
    if (status === 'offline') {
      const currentStatus = deviceStatusMapRef.current.get(deviceId);

      // Only mark as failed if not already completed
      if (currentStatus !== 'completed') {
        console.log(`⚠️ Device ${deviceId} went offline during OTA - marking as failed`);

        setDeviceStatusMap(prev => {
          const newMap = new Map(prev);
          newMap.set(deviceId, 'failed');
          return newMap;
        });

        // Keep the last known progress
        // Don't reset progress - keep it at last known value (e.g., 40%)
      } else {
        console.log(`✅ Device ${deviceId} already completed - not marking as failed`);
      }
    }
  };

  // ✅ Listen for session-specific progress
  useEffect(() => {
    if (!currentSessionId || !otaSocketRef.current) return;

    const socket = otaSocketRef.current;
    const eventName = `ota-progress/${currentSessionId}`;

    console.log(`🔔 Listening to: ${eventName}`);

    socket.on(eventName, (data) => {
      console.log(`📊 Session Progress Update:`, data);
      handleOTAProgressUpdate(data);
    });

    return () => {
      socket.off(eventName);
    };
  }, [currentSessionId]);

  // ✅ Handle OTA progress updates
  const handleOTAProgressUpdate = (data) => {
    const { deviceId, progress, status } = data;

    setDeviceProgressMap(prev => {
      const newMap = new Map(prev);
      newMap.set(deviceId, progress);
      return newMap;
    });

    setDeviceStatusMap(prev => {
      const newMap = new Map(prev);
      newMap.set(deviceId, status);
      return newMap;
    });

    // Check if OTA completed for all devices
    if (status === 'completed' || status === 'failed') {
      console.log(`✅ Device ${deviceId} OTA ${status}`);
    }
  };

  // ✅ Check if all devices completed OTA and show results modal
  useEffect(() => {
    if (!otaInProgress || selectedDevices.size === 0) return;

    // Check if all selected devices have completed (either 'completed' or 'failed')
    const allCompleted = Array.from(selectedDevices).every(deviceId => {
      const status = deviceStatusMap.get(deviceId);
      return status === 'completed' || status === 'failed';
    });

    if (allCompleted) {
      console.log('🎉 All devices completed OTA!');
      showOTAResultsModal();
    }
  }, [deviceStatusMap, otaInProgress, selectedDevices]);

  // ✅ Show OTA completion results modal
  const showOTAResultsModal = () => {
    // Collect results
    const results = Array.from(selectedDevices).map(deviceId => {
      const device = allDevices.find(d => (d.deviceId || d.deviceName) === deviceId);
      const status = deviceStatusMap.get(deviceId);
      const progress = deviceProgressMap.get(deviceId);

      return {
        deviceId,
        deviceName: device?.deviceName || deviceId,
        status,
        progress,
        passed: status === 'completed'
      };
    });

    const passedCount = results.filter(r => r.passed).length;
    const failedCount = results.filter(r => !r.passed).length;

    // Generate HTML for results
    const resultsHTML = `
      <div style="text-align: left; max-height: 400px; overflow-y: auto;">
        <div style="margin-bottom: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
          <div style="display: flex; justify-content: space-around; text-align: center;">
            <div>
              <div style="font-size: 24px; font-weight: bold; color: #10b981;">${passedCount}</div>
              <div style="font-size: 12px; color: #6b7280;">Passed</div>
            </div>
            <div>
              <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${failedCount}</div>
              <div style="font-size: 12px; color: #6b7280;">Failed</div>
            </div>
            <div>
              <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${results.length}</div>
              <div style="font-size: 12px; color: #6b7280;">Total</div>
            </div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
              <th style="padding: 10px; text-align: left; font-size: 12px; color: #6b7280;">Device</th>
              <th style="padding: 10px; text-align: center; font-size: 12px; color: #6b7280;">Progress</th>
              <th style="padding: 10px; text-align: center; font-size: 12px; color: #6b7280;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${results.map(r => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px; font-size: 14px; font-weight: 500;">${r.deviceName}</td>
                <td style="padding: 10px; text-align: center; font-size: 14px;">${Math.round(r.progress)}%</td>
                <td style="padding: 10px; text-align: center;">
                  <span style="
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    ${r.passed
                      ? 'background: #d1fae5; color: #065f46;'
                      : 'background: #fee2e2; color: #991b1b;'}
                  ">
                    ${r.passed ? '✓ Passed' : '✗ Failed'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    Swal.fire({
      title: 'OTA Update Complete',
      html: resultsHTML,
      icon: failedCount === 0 ? 'success' : 'warning',
      confirmButtonText: 'Close',
      confirmButtonColor: '#3b82f6',
      width: '600px',
      customClass: {
        htmlContainer: 'swal-results-container'
      }
    }).then(() => {
      // Reset OTA state after modal closes
      resetOTAState();
    });
  };

  // ✅ Reset OTA state
  const resetOTAState = () => {
    setOtaInProgress(false);
    setCurrentSessionId(null);
    setSelectedDevices(new Set());
    setDeviceProgressMap(new Map());
    setDeviceStatusMap(new Map());
  };

  // ✅ Filter devices by selected deviceType and online status
  // Keep devices visible if they're either online OR currently in an OTA session
  const filteredDevices = useMemo(() => {
    return allDevices.filter(device => {
      const deviceId = device.deviceId || device.deviceName;
      const isOnline = deviceOnlineMap[deviceId] === true;
      const deviceData = deviceDataMap[deviceId];
      const matchesType = deviceData?.deviceType === deviceType || device.deviceType === deviceType;

      // ✅ Check if device is in active OTA session
      const isInOTA = deviceStatusMap.has(deviceId) &&
                      deviceStatusMap.get(deviceId) !== 'idle' &&
                      deviceStatusMap.get(deviceId) !== 'completed' &&
                      deviceStatusMap.get(deviceId) !== 'failed';

      // Show device if it matches type AND (is online OR in active OTA)
      return matchesType && (isOnline || isInOTA);
    });
  }, [allDevices, deviceOnlineMap, deviceDataMap, deviceType, deviceStatusMap]);

  console.log(`🔍 Filtered Devices (${deviceType}):`, filteredDevices);

  // ✅ Handle device selection
  const handleDeviceToggle = (deviceId) => {
    setSelectedDevices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId);
      } else {
        newSet.add(deviceId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedDevices.size === filteredDevices.length && filteredDevices.length > 0) {
      setSelectedDevices(new Set());
    } else {
      setSelectedDevices(new Set(filteredDevices.map(d => d.deviceId || d.deviceName)));
    }
  };

  // ✅ START OTA functionality
  const handleStartOTA = async () => {
    if (selectedDevices.size === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Devices Selected',
        text: 'Please select at least one device to start OTA',
      });
      return;
    }

    if (!currentVersion) {
      Swal.fire({
        icon: 'warning',
        title: 'No Version Selected',
        text: 'Please select an OTA version',
      });
      return;
    }

    // Find the selected OTA object
    const selectedOTA = otaObjects.find(ota => ota.version === currentVersion);
    if (!selectedOTA) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Selected OTA version not found',
      });
      return;
    }

    // Get device _id values from selectedDevices
    const deviceIds = Array.from(selectedDevices).map(deviceId => {
      const device = allDevices.find(d => (d.deviceId || d.deviceName) === deviceId);
      return device?._id;
    }).filter(Boolean);

    if (deviceIds.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not find device IDs',
      });
      return;
    }

    setOtaInProgress(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE}/ota/start`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          otaId: selectedOTA._id,
          deviceIds: deviceIds,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCurrentSessionId(data.sessionId);

        // Initialize progress for all devices
        const progressMap = new Map();
        const statusMap = new Map();
        Array.from(selectedDevices).forEach(deviceId => {
          progressMap.set(deviceId, 0);
          statusMap.set(deviceId, 'pending');
        });
        setDeviceProgressMap(progressMap);
        setDeviceStatusMap(statusMap);

        Swal.fire({
          icon: 'success',
          title: 'OTA Started',
          text: `OTA started for ${data.totalDevices} devices`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(data.message || 'Failed to start OTA');
      }
    } catch (err) {
      console.error('Start OTA error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Start OTA',
        text: err.message || 'Could not start OTA update',
      });
      setOtaInProgress(false);
      setCurrentSessionId(null);
    }
  };

  // ✅ Progress Bar Component
  const ProgressBar = ({ value = 0 }) => {
    const pct = Math.max(0, Math.min(100, Number(value || 0)));
    return (
      <div className="w-28 h-2 bg-gray-200 rounded overflow-hidden" style={{ minWidth: 112 }}>
        <div
          style={{ width: `${pct}%`, transition: "width 300ms linear" }}
          className={`h-full ${pct >= 100 ? "bg-green-500" : "bg-[#0D5CA4]"}`}
        />
      </div>
    );
  };

  const isDesktop = useMediaQuery("(min-width:768px)");
  const isMobile = !isDesktop;
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ✅ Fetch OTA versions based on selected device type
  useEffect(() => {
    const fetchVersionsByDeviceType = async () => {
      if (!deviceType) return;

      setLoadingVersions(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE}/ota/versions/${deviceType}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.ok) {
          const data = await res.json();
          // Extract version strings from otas array
          const versionList = (data.otas || []).map(ota => ota.version);
          setVersions(versionList);

          // Reset current version when device type changes
          setCurrentVersion('');
        } else if (res.status === 404) {
          // No versions found for this device type
          setVersions([]);
          setCurrentVersion('');
        } else {
          console.error('Failed to fetch versions:', res.status);
          setVersions([]);
          setCurrentVersion('');
        }
      } catch (err) {
        console.error('Error fetching OTA versions:', err);
        setVersions([]);
        setCurrentVersion('');
      } finally {
        setLoadingVersions(false);
      }
    };

    fetchVersionsByDeviceType();
  }, [deviceType]); // Re-fetch when device type changes

  const renderOTAMarkup = () => (
   <div className={`ListPage brand-list-container ota-device-list  rounded-xl lg:rounded-r-none lg:rounded-l-xl shadow-sm w-full h-full border border-[#E5E7EB] flex flex-col overflow-hidden`}
       style={{ backgroundColor: "#EEF3F9" }}>

    {/* Mobile close button */}
   

    {/* EXISTING OTA UI BELOW (UNCHANGED) */}
    {/* ⬇⬇⬇ paste everything from your current return body here ⬇⬇⬇ */}

    
    <div className="ListPage brand-list-container ota-device-list  rounded-xl lg:rounded-r-none lg:rounded-l-xl shadow-sm w-full h-full border border-[#E5E7EB] flex flex-col overflow-hidden" style={{ backgroundColor: "#EEF3F9" }}>
      
       {!isDesktop && (
      <div className="flex justify-end p-2">
        <IconButton size="small" onClick={() => setDrawerOpen(false)}>
          <CloseIcon />
        </IconButton>
      </div>
    )}

      <div className="flex-shrink-0 px-4 md:pt-4">
      {
       <h1 className="brand-list-title font-semibold text-gray-800 mb-4 text-center md:text-start ">OTA Management</h1>
      }

        {/* ✅ Device Type Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Device Type</label>
          <select
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            disabled={loadingVersions}
          >
            {Object.entries(DEVICE_TYPES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <VersionsDropdown
            versions={versions}
            currentVersion={currentVersion}
            loadingVersions={loadingVersions}
            onVersionSelect={(v) => {
              setCurrentVersion(v); // keep the component controlled
              onVersionSelect && onVersionSelect(v); // forward prop from OTADeviceList props
            }}
          />
        </div>

        <div className="mb-4">
          <h2 className="brand-list-header text-center font-semibold text-gray-800">Device List</h2>
          <div className="mx-auto mt-2 h-px w-4/5 bg-[#2563EB]/40"></div>
        </div>
      </div>

      <div className="flex-1 min-h-0 px-4 ">
        <div className="brand-table-scroll overflow-y-auto pr-1 h-full  ">
          {loading ? (
            <div className="text-center py-2">Loading devices...</div>
          ) : filteredDevices.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm md:text-md py-2">
              No online {DEVICE_TYPES[deviceType]} devices found.
            </div>
          ) : (
            <div className="space-y-2 pb-2">
              {/* optional header row with selectAll */}
              <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedDevices.size === filteredDevices.length && filteredDevices.length > 0}
                    onChange={handleSelectAll}
                  />
                  <span>Select All</span>
                </div>
                <div className="text-xs">Status • Progress</div>
              </div>

              {filteredDevices.map((device) => {
                const deviceId = device.deviceId || device.deviceName;
                const progress = deviceProgressMap.get(deviceId) || 0;
                const otaStatus = deviceStatusMap.get(deviceId) || 'idle';
                const isOnline = deviceOnlineMap[deviceId];

                return (
                  <div
                    key={deviceId}
                    className="flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedDevices.has(deviceId)}
                          onChange={() => handleDeviceToggle(deviceId)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          disabled={otaInProgress}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-800 font-medium truncate">
                            {device.deviceName || deviceId}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1">
                          <div className="text-xs text-gray-500">
                            {device.deviceId && <span>ID: {device.deviceId}</span>}
                            {otaStatus && otaStatus !== 'idle' && (
                              <span className="ml-2">• OTA: {otaStatus}</span>
                            )}
                          </div>

                          {/* progress bar & percent */}
                          {otaInProgress && (
                            <div className="flex items-center gap-2">
                              <ProgressBar value={progress} />
                              <div className="text-xs text-gray-600 w-10 text-right">
                                {Math.round(progress)}%
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 grid grid-cols-2 gap-3 px-1.5 pb-1.5 md:px-4 md:pb-4">
        <div className="bg-gray-200 rounded-lg p-2.5 md:p-4  ">
          <p className="text-gray-700 text-sm mb-1 ">No. of Device:</p>
          <p className="text-gray-800 font-bold text-xl  ">
            {filteredDevices.length < 10 ? `0${filteredDevices.length}` : filteredDevices.length}
          </p>
        </div>

        <button
          onClick={handleStartOTA}
          disabled={otaInProgress || filteredDevices.length === 0 || selectedDevices.size === 0}
          className={`cursor-pointer text-white font-semibold py-3 px-4 rounded-lg transition duration-300 shadow-md
            ${otaInProgress || filteredDevices.length === 0 || selectedDevices.size === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#0D5CA4] hover:bg-[#0A4A8A]"
            }`}
        >
          {otaInProgress ? "OTA in Progress..." : "START OTA"}
        </button>
      </div>
    </div>
    </div>
    
  );


  return (
  <>
    {isDesktop ? (
      renderOTAMarkup()
    ) : (
      <>
        {/* Mobile header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <img src="/logo-half.png" className="h-[30px]" />
          <h1 className="brand-list-title font-semibold text-gray-800">
            OTA Management
          </h1>
          <IconButton size="small" onClick={() => setDrawerOpen(true)}>
            <Menu size={20} />
          </IconButton>
        </div>

        {/* Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ style: { width: "100%" } }}
        >
          <div className="p-4 h-full md:h-auto">
            {renderOTAMarkup()}
          </div>
        </Drawer>
      </>
    )}
  </>
);


};

export default OTADeviceList;
