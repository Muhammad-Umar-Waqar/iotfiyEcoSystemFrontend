/**
 * Keep the last non-empty triggeredAlerts until a new alert payload arrives.
 * Routine telemetry often omits triggeredAlerts, which would otherwise clear the UI.
 */
export function mergeTriggeredAlerts(previous = [], incoming) {
  if (Array.isArray(incoming) && incoming.length > 0) {
    return incoming;
  }
  return Array.isArray(previous) ? previous : [];
}

/**
 * Check if a sensor type appears in WebSocket triggeredAlerts (e.g. "temperatureAlert").
 */
export function isTriggeredAlert(triggeredAlerts, type) {
  if (!Array.isArray(triggeredAlerts) || triggeredAlerts.length === 0) return false;
  const key = String(type).toLowerCase();
  return triggeredAlerts.some((alert) => {
    const normalized = String(alert).toLowerCase().replace(/alert$/, "");
    return normalized === key;
  });
}

/**
 * For trigger devices use triggeredAlerts; otherwise use the monitoring alert flag.
 */
export function resolveAlertState(category, triggeredAlerts, type, monitoringAlert = false) {
  if (category === "trigger") {
    return isTriggeredAlert(triggeredAlerts, type);
  }
  return Boolean(monitoringAlert);
}
