// src/hooks/useDeviceWebSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { mergeTriggeredAlerts } from '../utils/triggerAlertUtils';
import { fetchCurrentOrNextSchedule } from '../utils/fetchCurrentOrNextSchedule';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5054';

export const useDeviceWebSocket = (devices = []) => {
  const socketRef = useRef(null);
  const [deviceDataMap, setDeviceDataMap] = useState({});
  const [deviceOnlineMap, setDeviceOnlineMap] = useState({});
  const [deviceScheduleMap, setDeviceScheduleMap] = useState({}); // NEW: Store schedule data
  const [isConnected, setIsConnected] = useState(false);
  const scheduleFallbackTriedRef = useRef(new Set());

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
        setDeviceDataMap(prev => {
          const previous = prev[deviceId] || {};
          const isTrigger =
            data.category === 'trigger' || previous.category === 'trigger';

          return {
            ...prev,
            [deviceId]: {
              ...previous,
              ...data.data, // Sensor values: temperature, humidity, odour, AQI, voltage, current
              state: data.state ?? previous.state, // ON/OFF for scheduling devices
              // AC fields (top-level from schedulingProcessor / ac-settings emit)
              setTemperature: data.setTemperature ?? previous.setTemperature,
              acMode: data.acMode ?? previous.acMode,
              fanSpeed: data.fanSpeed ?? previous.fanSpeed,
              acLocked: data.acLocked ?? previous.acLocked,
              acHealthAlert: data.acHealthAlert ?? previous.acHealthAlert,
              energyMonitoringIncluded:
                data.energyMonitoringIncluded ?? previous.energyMonitoringIncluded,
              espCurrent: data.espCurrent ?? data.current ?? previous.espCurrent,
              espVoltage: data.espVoltage ?? previous.espVoltage,
              espPower: data.espPower ?? previous.espPower,
              espEnergy: data.espEnergy ?? previous.espEnergy,
              // An empty array is meaningful: it clears alerts resolved by
              // the latest MQTT packet (e.g. AC becomes healthy again).
              alerts: Array.isArray(data.alerts)
                ? data.alerts
                : previous.alerts || [],
              triggeredAlerts: isTrigger
                ? mergeTriggeredAlerts(previous.triggeredAlerts, data.triggeredAlerts)
                : data.triggeredAlerts || [],
              interval: data.interval ?? previous.interval,
              category: data.category ?? previous.category,
              deviceType: data.deviceType ?? previous.deviceType,
              lastUpdateISO: (() => {
                if (data.timestamp != null) {
                  const d = new Date(data.timestamp);
                  if (!Number.isNaN(d.getTime())) return d.toISOString();
                }
                return previous.lastUpdateISO || new Date().toISOString();
              })(),
              receivedAt: Date.now()
            }
          };
        });

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

    // Soft REST fallback: fill schedule when socket has not emitted yet (404 silent)
    devices.forEach((device) => {
      const deviceId = device.deviceId || device.deviceName;
      if (!deviceId || scheduleFallbackTriedRef.current.has(deviceId)) return;

      scheduleFallbackTriedRef.current.add(deviceId);

      fetchCurrentOrNextSchedule(deviceId).then((scheduleData) => {
        if (!scheduleData) return;
        setDeviceScheduleMap((prev) => {
          // Socket already filled this device — keep websocket as source of truth
          if (prev[deviceId]) return prev;
          return { ...prev, [deviceId]: scheduleData };
        });
      });
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

  /** Re-fetch CURRENT/NEXT after event create/delete so device cards update without full page refresh */
  const refreshDeviceSchedule = useCallback(async (deviceId) => {
    if (!deviceId) return;
    const scheduleData = await fetchCurrentOrNextSchedule(deviceId);
    setDeviceScheduleMap((prev) => ({
      ...prev,
      [deviceId]: scheduleData || { type: "NO_EVENT", event: null },
    }));
  }, []);

  return {
    deviceDataMap,
    deviceOnlineMap,
    deviceScheduleMap, // NEW: Export schedule data
    isConnected,
    getDeviceData,
    isDeviceOnline,
    refreshDeviceSchedule,
    socket: socketRef.current
  };
};
