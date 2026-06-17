import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Sun, Sunrise, Sunset, Moon } from "lucide-react";
import TemperatureRangeMeter from "./TemperatureRangeMeter";

export default function TemperatureHumidityDeviceCard({
  deviceId,
  deviceName,
  espTemprature = null,
  espHumidity = null,
  temperatureAlert = false,
  humidityAlert = false,
  isSelected = false,
  onCardSelect,
  lastUpdateTime = null,
  isOnline = false,         // NEW
  lastUpdateISO = null,

}) {
  const toNumberOrNull = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // format last update for title/tooltip
  const lastUpdateStr = lastUpdateISO ? new Date(lastUpdateISO).toLocaleString() : "";
  const [now, setNow] = useState(Date.now());


  const temp = toNumberOrNull(espTemprature);
  const hum = toNumberOrNull(espHumidity);

  const hasAnyAlert = temperatureAlert || humidityAlert;


useEffect(() => {
  const interval = setInterval(() => {
    setNow(Date.now());
  }, 10 * 60 * 1000);

  return () => clearInterval(interval);
}, []);

const hour = new Date(now).getHours();

  // const timeOfDay = "sunset"
  const timeOfDay =
    hour >= 5 && hour <= 8
      ? "sunrise"
      : hour >= 9 && hour <= 16
        ? "day"
        : hour >= 17 && hour <= 19
          ? "sunset"
          : "night";

  const statusColorClass = (hasAlert) =>
    hasAlert ? "bg-rose-300" : "bg-emerald-200";

  const cardSelectedClass = isSelected ? "shadow-lg transform scale-[1.01]" : "";

  return (
    <div
      onClick={() => onCardSelect && onCardSelect()}
      className={`freezer-card-container  relative rounded-4xl bg-white min-h-[160px] p-4 ${cardSelectedClass} cursor-pointer`}
    >


      {/* top-right status pill */}
      <div className="absolute top-0 right-0 flex items-center z-10 ">
        <div className={`flex  rounded-bl-2xl ${temperatureAlert ? "bg-rose-100" : "bg-[#DCE8F4]/50"}`} >
          <p className="px-2 pr-4 py-1 text-sm text-[#020F24]">Alert</p>
          {hasAnyAlert && (
            <div className="flex items-center  rounded-xl px-2 py-1">
              {temperatureAlert && (
                <img
                  src="/temp-alert.svg"
                  alt="Temperature Alert"
                  className="w-4 h-4"
                />
              )}

              {humidityAlert && (
                <img
                  src="/hum-alert.svg"
                  alt="Humidity Alert"
                  className="w-4 h-4"
                />
              )}
            </div>
          )}
        </div>


      </div>



      {/* MAIN ROW */}
      {/* Use responsive: row on sm+, stack on xs. Prevent unwanted shrinking with flex-shrink-0 and min-w. */}
      <div className="flex flex-row h-full justify-between items-start ">
        {/* LEFT: icons + meter */}
        <div className="h-full flex flex-col justify-between flex-shrink-0 min-w-[140px] w-1/3">


          <div title={lastUpdateStr}>
            <div className="flex items-center">
              <span
                aria-hidden
                className={`inline-block h-1.5 w-1.5 rounded-full mr-2 shadow-sm ${isOnline ? "bg-green-300" : "bg-gray-300"}`}
                style={{ boxShadow: isOnline ? "0 0 6px rgba(34,197,94,0.45)" : "none" }}
              />
              <div className="text-xs text-gray-500">Device ID</div>
            </div>
            <div className="text-lg font-bold">{deviceName}</div>
          </div>








          {/* icons row - force no wrap and don't allow it to push other content */}
          <div className="flex items-center justify-start gap-3 mt-2 flex-nowrap overflow-hidden   border-b-2 border-[#C3C1C1] pb-2 ">
            <div className={`p-2 rounded-full border ${timeOfDay === "sunrise" ? "border-1 border-gray-600" : "border-transparent"}`}>
              <Sunrise size={18} className={`${timeOfDay === "sunrise" ? "text-yellow-600" : "text-gray-500"}`} />
            </div>
            <div className={`p-2 rounded-full border ${timeOfDay === "day" ? "border-1 border-gray-600" : "border-transparent"}`}>
              <Sun size={18} className={`${timeOfDay === "day" ? "text-yellow-500" : "text-gray-500"}`} />
            </div>
            <div className={`p-2 rounded-full border ${(timeOfDay === "sunset" || timeOfDay === "night") ? "border-1 border-gray-600" : "border-transparent"}`}>
              <Sunset size={18} className={`${timeOfDay === "sunset" ? "text-orange-500" : "text-gray-500"}`} />
            </div>
            {/* <div className={`p-2 rounded-full border ${timeOfDay === "night" ? "border-2" : "border-transparent"}`}>
              <Moon size={18} className={`${timeOfDay === "night" ? "text-sky-600" : "text-gray-300"}`} />
            </div> */}
            {/* <div className="my-2 border-b border-gray-200" /> */}
          </div>


          <TemperatureRangeMeter value={temp !== null ? Math.round(temp) : 0} />


        </div>

        {/* CENTER: flex-1 so it takes remaining space and doesn't collapse */}
        <div className="h-full flex flex-col justify-around">
          {/* top spacing */}
          <div />
          <div className="h-full flex flex-col items-center justify-around mt-5 ">
            <div className="">
              <div className="text-sm text-gray-500">Temperature</div>
              <div className="text-3xl font-bold">
                {temp !== null ? `${Math.round(temp)}` : "--"}<span className="font-normal">°C</span>
              </div>
              {/* status bar below temperature */}
              <div className=" mt-2">
                <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                  {/* <div className={`h-2 ${statusColorClass(temperatureAlert)}`} style={{ width: `${temp !== null ? Math.max(6, Math.min(100, tempKnob)) : 10}%` }} /> */}
                  <div className={`h-2 ${statusColorClass(temperatureAlert)}`} />
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500">Humidity</div>
              <div className="text-2xl font-bold">
                {hum !== null ? `${Math.round(hum)}%` : "--"}
              </div>
              {/* status bar below humidity */}
              <div className=" mt-2">
                <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                  <div className={`h-2 ${statusColorClass(humidityAlert)}`} />
                </div>
              </div>
            </div>
          </div>

          <div />
        </div>


      </div>
    </div>
  );
}

TemperatureHumidityDeviceCard.propTypes = {
  deviceId: PropTypes.string,
  espTemprature: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  espHumidity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  temperatureAlert: PropTypes.bool,
  humidityAlert: PropTypes.bool,
  lastUpdateTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onCardSelect: PropTypes.func,
  isSelected: PropTypes.bool,
  isOnline: PropTypes.bool,
  lastUpdateISO: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

