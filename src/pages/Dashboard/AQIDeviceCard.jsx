
// src/pages/Dashboard/AQIDeviceCard.jsx
import React from "react";
import GaugeContainer from "../../components/gauge/GaugeContainer"; // adjust path to where you place it
import PropTypes from "prop-types";
import "../../styles/pages/Dashboard/dashboard-styles.css"; // keep existing styling
import { Wind } from "lucide-react";

function getAQIStatus(aqi) {
  if (aqi === null || aqi === undefined || Number.isNaN(Number(aqi))) return { label: "Unknown", color: "bg-gray-200", textColor: "text-gray-800" };
  const v = Number(aqi);
  if (v <= 50) return { label: "Good", color: "bg-emerald-200", textColor: "text-emerald-800" };
  if (v <= 100) return { label: "Moderate", color: "bg-yellow-200", textColor: "text-yellow-800" };
  if (v <= 150) return { label: "Sensitive", color: "bg-yellow-500", textColor: "text-yellow-900" };
  if (v <= 200) return { label: "Unhealthy", color: "bg-rose-200", textColor: "text-rose-800" };
  if (v <= 300) return { label: "Severe", color: "bg-pink-300", textColor: "text-pink-900" };
  return { label: "Hazardous", color: "bg-violet-300", textColor: "text-violet-900" };
}



export default function AQIDeviceCard({
  deviceId,
  espAQI = null,
  espTemprature = null,
  espHumidity = null,
  isSelected = false,
  onCardSelect,
  humidityAlert = false,
  temperatureAlert = false,
   isOnline = false,        // NEW
  lastUpdateISO = null,
  // you can pass other props if needed
}) {
  const aqi = espAQI ?? null;
  const aqiStatus = getAQIStatus(aqi);

  // format last update for title/tooltip
  const lastUpdateStr = lastUpdateISO ? new Date(lastUpdateISO).toLocaleString() : "";

  return (
    <div onClick={onCardSelect} className={`freezer-card-container   rounded-4xl  bg-white ${isSelected ? "shadow-lg" : ""} min-h-[160px]`} >
      <div className="flex  h-full justify-between px-4">
        <div className="h-full flex flex-col  justify-around items-between">
          <div title={lastUpdateStr}>
            <div className="flex items-center">
                <span
                  aria-hidden
                  className={`inline-block h-1.5 w-1.5 rounded-full mr-2 shadow-sm ${isOnline ? "bg-green-300" : "bg-gray-300"}`}
                  style={{ boxShadow: isOnline ? "0 0 6px rgba(34,197,94,0.45)" : "none" }}
                />
            <div className="text-xs text-gray-500">Device ID</div>
            </div>
            <div className="text-lg font-bold">{deviceId}</div>
          </div>
          

          {/* <div>
  <div className="text-xs text-gray-500">Device ID</div>
  <div className="text-lg font-bold flex items-center" title={lastUpdateStr}>

  
    <span>{deviceId}</span>
  </div>
</div> */}


          <div className="flex items-center justify-between ">
            <div className=" border-b-2  border-gray-300 w-full  ">
              <div className="text-sm text-gray-500 ">AQI</div>
             {aqi !== null && !Number.isNaN(Number(aqi)) ? (
              (() => {
                const [intPart, decPart = '0'] = Number(aqi).toFixed(1).split('.');
                return (
                  <div className="flex items-end mb-2">
                    <span className="text-3xl font-bold leading-none">
                      {intPart}
                    </span>
                    <span className="text-md font-bold  leading-none">
                      .{decPart}
                    </span>
                  </div>
                );
              })()
            ) : (
              <div className="text-3xl font-bold">--</div>
            )}

            </div>
          </div>

          <div className="flex items-center justify-start gap-4">
            <div className="flex  items-center justify-center gap-1 ">
              <div className="flex flex-col items-center ">
                <div className="text-xs">Temperature</div>
                <div className="text-sm text-right font-semibold">{espTemprature ?? "--"}°C</div>
               {
                temperatureAlert ? 
                  <img src="/humidity-red-alert.svg" alt="" className="w-[3rem] rounded-3px" />: 
                  <img src="/temperature-green-alert.svg" alt="" className="w-[3rem] rounded-3px" />
               } 
              </div>

            </div>

            <div className="flex  items-center justify-center gap-1  ">
              <div className="flex flex-col items-center ">
                <div className="text-xs">Humidity</div>
                <div className="text-sm text-right font-semibold">{espHumidity ?? "--"}%</div>
                 {
                humidityAlert ? 
                <img src="/humidity-red-alert.svg" alt="" className="w-[3rem] rounded-3px" /> :
                <img src="/temperature-green-alert.svg" alt="" className="w-[3rem] rounded-3px" /> 
               }
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start justify-center ">
          <div className="flex items-center justify-between gap-4">
          </div>
          <img src="/windy-icon-greed.svg" alt="Windy Icon" />
          <div className="flex flex-col items-center justify-center ">
            <GaugeContainer value={aqi ?? 0} min={0} max={500} />
            {/* <<< DYNAMIC STATUS PILL >>> */}
            <p className={`${aqiStatus.color} ${aqiStatus.textColor} rounded-2xl px-2 text-sm font-semibold py-1 mt-5`}>
              {aqiStatus.label}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

AQIDeviceCard.propTypes = {
  deviceId: PropTypes.string,
  espAQI: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  espTemprature: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  espHumidity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isSelected: PropTypes.bool,
  onCardSelect: PropTypes.func,
  isOnline: PropTypes.bool,
  lastUpdateISO: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
