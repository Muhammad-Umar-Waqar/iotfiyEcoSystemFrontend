// src/hooks/useDeviceWebSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5054';

export const useDeviceWebSocket = (devices = []) => {
  const socketRef = useRef(null);
  const [deviceDataMap, setDeviceDataMap] = useState({});
  const [deviceOnlineMap, setDeviceOnlineMap] = useState({});
  const [deviceScheduleMap, setDeviceScheduleMap] = useState({}); // NEW: Store schedule data
  const [isConnected, setIsConnected] = useState(false);

  // Initialize Socket.io connection
  useEffect(() => {
    console.log('🔌 Initializing WebSocket connection to:', SOCKET_URL);

    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ WebSocket Connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('⚠️ WebSocket Connection Error:', error.message);
      setIsConnected(false);
    });

    // Listen for device status updates (online/offline)
    socket.on('deviceStatusUpdate', (data) => {
      console.log(`📶 Device status update:`, data);
      setDeviceOnlineMap(prev => ({
        ...prev,
        [data.deviceId]: data.status === 'online'
      }));
    });

    return () => {
      console.log('🔌 Disconnecting WebSocket');
      socket.disconnect();
    };
  }, []);

  // Subscribe to device-specific channels
  useEffect(() => {
    if (!socketRef.current || !isConnected || !devices || devices.length === 0) {
      return;
    }

    const socket = socketRef.current;

    // Initialize all devices as offline by default
    // This ensures devices that never connect show as offline (not undefined)
    setDeviceOnlineMap(prev => {
      const initialized = { ...prev };
      devices.forEach(device => {
        const deviceId = device.deviceId || device.deviceName;
        // Only initialize if not already in the map
        if (!(deviceId in initialized)) {
          initialized[deviceId] = false;
          console.log(`🔵 Device ${deviceId} initialized as offline (awaiting status)`);
        }
      });
      return initialized;
    });

    devices.forEach(device => {
      const deviceId = device.deviceId || device.deviceName;
      const channel = `device/${deviceId}`;
      const scheduleChannel = `device/${deviceId}/schedule`; // NEW: Schedule event channel

      console.log(`🔍 [DEBUG] Setting up listeners for device: ${deviceId}`);
      console.log(`🔍 [DEBUG] Data channel: ${channel}`);
      console.log(`🔍 [DEBUG] Schedule channel: ${scheduleChannel}`);

      // Remove existing listeners
      socket.off(channel);
      socket.off(scheduleChannel);

      // Add new listener for device data
      socket.on(channel, (data) => {
        console.log(`📡 [${deviceId}] Received data:`, data);

        // Update device data map
        setDeviceDataMap(prev => ({
          ...prev,
          [deviceId]: {
            ...prev[deviceId],
            ...data.data, // Sensor values: temperature, humidity, odour, AQI, voltage, current
            state: data.state, // ON/OFF for scheduling devices
            alerts: data.alerts || [],
            category: data.category,
            deviceType: data.deviceType,
            lastUpdateISO: data.timestamp,
            receivedAt: Date.now()
          }
        }));

        // Mark device as online when we receive data
        setDeviceOnlineMap(prev => ({
          ...prev,
          [deviceId]: true
        }));
      });

      // NEW: Add listener for schedule events
      socket.on(scheduleChannel, (scheduleData) => {
        // console.log(`📅📅📅 [WEBSOCKET SCHEDULE] Device: ${deviceId}`);
        console.log(`📅📅📅 [WEBSOCKET SCHEDULE] Raw data:`, scheduleData);
        // console.log(`📅📅📅 [WEBSOCKET SCHEDULE] Type:`, scheduleData?.type);
        // console.log(`📅📅📅 [WEBSOCKET SCHEDULE] Event:`, scheduleData?.event);

        setDeviceScheduleMap(prev => ({
          ...prev,
          [deviceId]: scheduleData // { type: "CURRENT" | "NEXT" | "NO_EVENT", event: {...} }
        }));
      });

      console.log(`🔔 Subscribed to: ${channel}, ${scheduleChannel}`);
    });

    // Cleanup listeners when devices change
    return () => {
      devices.forEach(device => {
        const deviceId = device.deviceId || device.deviceName;
        socket.off(`device/${deviceId}`);
        socket.off(`device/${deviceId}/schedule`); // NEW: Clean up schedule listener
      });
    };
  }, [devices, isConnected]);

  // Auto-detect offline devices (no data for 90 seconds as backup)
  // Primary status comes from backend's explicit MQTT status events
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setDeviceOnlineMap(prev => {
        const updated = { ...prev };
        Object.keys(deviceDataMap).forEach(deviceId => {
          const lastReceived = deviceDataMap[deviceId]?.receivedAt || 0;
          // 90 seconds = 60s device interval + 30s grace period
          const isStale = (now - lastReceived) > 90000;
          if (isStale && updated[deviceId]) {
            updated[deviceId] = false;
            console.log(`⚠️ Device ${deviceId} marked offline (no data for 90s) - backup check`);
          }
        });
        return updated;
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [deviceDataMap]);

  const getDeviceData = useCallback((deviceId) => {
    return deviceDataMap[deviceId] || null;
  }, [deviceDataMap]);

  const isDeviceOnline = useCallback((deviceId) => {
    return deviceOnlineMap[deviceId] || false;
  }, [deviceOnlineMap]);

  return {
    deviceDataMap,
    deviceOnlineMap,
    deviceScheduleMap, // NEW: Export schedule data
    isConnected,
    getDeviceData,
    isDeviceOnline,
    socket: socketRef.current
  };
};
