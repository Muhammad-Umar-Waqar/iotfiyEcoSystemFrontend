
export default function DashboardRightPanel({
  freezerDevices = [],
  selectedFreezerDeviceId = null,
  selectedOrgId = null,
  pollInterval = null,
  className = "",
  onClose = undefined,
  closeIcon = false,
  schedulerDeviceOnlineMap = {},
  deviceOnlineMap = {},
}) {
  const selected = useMemo(() => {
    if (!selectedFreezerDeviceId) return null;
    return (
      freezerDevices.find(
        (d) => String(d._id ?? d.id ?? d.deviceId) === String(selectedFreezerDeviceId)
      ) ?? null
    );
  }, [freezerDevices, selectedFreezerDeviceId, pollInterval]);



  // Derive the key and events for the selected device
  const selectedIdKey = selected
    ? String(selected.deviceId)  // ✅ Use deviceId consistently for online status lookup
    : null;

  // const selectedDeviceEvents = selectedIdKey
  //   ? schedulerEventsMap[selectedIdKey] ?? []
  //   : [];


  //   const selectedToggleState = selectedIdKey
  //   ? schedulerToggleMap[selectedIdKey] ?? null
  //   : null;

  // ✅ REPLACE with
  const { eventsMap, toggleMap, setEvents, setToggle } = useScheduler();
  const selectedDeviceEvents = selectedIdKey ? eventsMap[selectedIdKey] ?? [] : [];
  const selectedToggleState = selectedIdKey ? toggleMap[selectedIdKey] ?? null : null;

  // ✅ Calculate real online status based on device type
  const isOnline = useMemo(() => {
    if (!selected || !selectedIdKey) return true;

    const deviceType = selected.deviceType;
    if (deviceType === "TSD" || deviceType === "ESD") {
      return Boolean(schedulerDeviceOnlineMap[selectedIdKey]);
    } else {
      return Boolean(deviceOnlineMap[selectedIdKey]);
    }
  }, [selected, selectedIdKey, schedulerDeviceOnlineMap, deviceOnlineMap]);



    
  return (
    // <div
    //   className={`dashboard-right-panel shadow-sm flex flex-col h-full overflow-y-auto custom-scrollbar p-4 lg:p-6 border-l border-[#E5E7EB]/40 bg-white flex-shrink-0 ${className}`}
    // >
    <div
  className={`dashboard-right-panel shadow-sm flex flex-col h-full overflow-y-auto custom-scrollbar p-4 lg:p-6 border-l border-[#E5E7EB]/40 bg-white max-w-[95vw] min-w-0 ${className}`}
>
      {selected ? (
        <VenueDetailsPanel
          venueName={selected?.venueName ?? selected?.venue?.name ?? "Venue"}
          deviceType={selected?.deviceType}
          espTemprature={selected?.espTemprature}
          espHumidity={selected?.espHumidity}
          espOdour={selected?.espOdour}
          espAQI={selected?.espAQI}
          espGL={selected?.espGL}
          odourAlert={selected?.odourAlert}
          temperatureAlert={selected?.temperatureAlert}
          humidityAlert={selected?.humidityAlert}
          aqiAlert={selected?.aqiAlert}
          glAlert={selected?.glAlert}
          batteryLow={selected?.batteryLow ?? selected?.batteryAlert ?? false}
          needMaintenance={selected?.needMaintenance ?? false}
          apiKey={selected?.apiKey}
          chartData={selected?.chartData ?? []}
          organizationId={selectedOrgId}
          closeIcon={closeIcon}
          onClose={onClose}
          deviceId={selected?.deviceId}
          lastUpdateTime={selected?.lastUpdateTime}
          espVoltage={selected?.espVoltage}
          espCurrent={selected?.espCurrent}
          espPower={selected?.espPower}
          isOnline={isOnline}
          // schedulerEvents={selectedDeviceEvents}
          // onSchedulerEventsChange={(updated) =>
          //   onSchedulerEventsChange?.(selectedIdKey, updated)
          // }
          //    schedulerToggleState={selectedToggleState}
          // onSchedulerToggleChange={(val) =>
          //   onSchedulerToggleChange?.(selectedIdKey, val)

          // }

          // onSchedulerEventsChange={(updated) => setEvents(selectedIdKey, updated)}
          // onSchedulerToggleChange={(val) => setToggle(selectedIdKey, val)}
        />
      ) : (
        <VenueDetailsPanel
          venueName={"Venue"}
          deviceType={null}
          espTemprature={0}
          espHumidity={0}
          espOdour={0}
          espAQI={null}
          espGL={null}
          batteryLow={true}
          needMaintenance={true}
          apiKey={""}
          chartData={[]}
          organizationId={selectedOrgId}
          closeIcon={closeIcon}
          onClose={onClose}
          humidityAlert={false}
          odourAlert={false}
          temperatureAlert={false}
          aqiAlert={false}
          glAlert={false}
          deviceId={""}
          lastUpdateTime={null}
          // schedulerEvents={[]}
          // onSchedulerEventsChange={undefined}
          // schedulerToggleState={null} 
          // onSchedulerToggleChange={undefined}
          // onSchedulerEventsChange={undefined}
          // onSchedulerToggleChange={undefined}
          
        />
      )}
    </div>
  );
}