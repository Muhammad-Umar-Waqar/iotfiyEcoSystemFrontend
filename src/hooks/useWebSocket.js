import { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import websocketService from '../services/websocket';

/**
 * Custom hook for WebSocket device monitoring
 * @param {Array} deviceIds - Array of device IDs to monitor
 * @param {Function} onUpdate - Callback when device data updates
 * @param {Function} onStatusChange - Callback when device status changes
 */
const useWebSocket = (deviceIds = [], onUpdate, onStatusChange) => {
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const isConnectedRef = useRef(false);

  // Connect to WebSocket
  useEffect(() => {
    if (isAuthenticated && token && !isConnectedRef.current) {
      websocketService.connect(token);
      isConnectedRef.current = true;
    }

    return () => {
      if (isConnectedRef.current) {
        websocketService.disconnect();
        isConnectedRef.current = false;
      }
    };
  }, [isAuthenticated, token]);

  // Subscribe to devices
  useEffect(() => {
    if (deviceIds.length > 0 && websocketService.getConnectionStatus()) {
      websocketService.subscribeToDevices(deviceIds);

      return () => {
        websocketService.unsubscribeFromDevices(deviceIds);
      };
    }
  }, [deviceIds]);

  // Handle device updates
  useEffect(() => {
    if (onUpdate) {
      websocketService.onDeviceUpdate(onUpdate);

      return () => {
        websocketService.offDeviceUpdate(onUpdate);
      };
    }
  }, [onUpdate]);

  // Handle device status changes
  useEffect(() => {
    if (onStatusChange) {
      websocketService.onDeviceStatus(onStatusChange);

      return () => {
        websocketService.offDeviceStatus(onStatusChange);
      };
    }
  }, [onStatusChange]);

  const getConnectionStatus = useCallback(() => {
    return websocketService.getConnectionStatus();
  }, []);

  return {
    isConnected: websocketService.getConnectionStatus(),
    getConnectionStatus,
  };
};

export default useWebSocket;
