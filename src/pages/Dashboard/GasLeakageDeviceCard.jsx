// src/pages/Dashboard/GasLeakageDeviceCard.jsx

import "../../styles/global/fonts.css";
import "../../styles/pages/Dashboard/freezer-cards-responsive.css";
import { Wind, Zap } from "lucide-react";
import PropTypes from "prop-types";

export default function GasLeakageDeviceCard({
  deviceId,
  isSelected = false,
  onCardSelect,
  espGL = null,
  glAlert = false,
  espHumidity = null,
  espTemprature = null,
  temperatureAlert = false,
  humidityAlert = false,
  isOnline = false,
  lastUpdateISO = null,
}) {
  const toInt = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  };
  
  
  const displayGas = toInt(espGL);
  const displayHumidity = toInt(espHumidity);
  const displayTemp = toInt(espTemprature);

  const handleCardClick = () => {
    if (onCardSelect) onCardSelect();
  };

  const hasTempOrHum = temperatureAlert || humidityAlert;

  let alertStatus = "none";
  if (glAlert) alertStatus = "gas";
  else if (hasTempOrHum) alertStatus = "other";

  // const textClass = alertStatus !== "none" ? "text-white" : "text-black";

  // const bgClass =
  //   alertStatus === "gas"
  //     ? "bg-[#F59E0B]" // amber
  //     : alertStatus === "other"
  //     ? "bg-green-400"
  //     : "bg-white";

  const selectedClass = isSelected
    ? "shadow-lg transition-transform duration-300 ease-out"
    : "transition-transform duration-300";

    
        // format last update for title/tooltip
  const lastUpdateStr = lastUpdateISO ? new Date(lastUpdateISO).toLocaleString() : "";

  
  return (
    <div
      onClick={handleCardClick}
      className={`freezer-card-container bg-white  ${selectedClass}`}
      style={isSelected ? { transform: "scale(1.01)" } : {}}
    >
      <div className="freezer-card-content">

        {/* Top Section */}
        <div className="device-id-section">
          {/* <div className="flex flex-col items-start">
            <span className={`device-id-label `}>Device ID</span> */}
            {/* <h3 className={`responsive-value-deviceId `}>
              {deviceId}
            </h3> */}

            {/* <div className="text-lg font-bold">{deviceId}</div>
          </div> */}


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
          


          {/* Gas Pill */}
            
          <div className={`ambient-pill ${glAlert? "bg-rose-700/20": "bg-white/20"} border border-white/30 flex items-center `}>
            <div className="px-2">
              <Wind size={24} className={"text-orange-500 my-1"} />
            </div>
            <p className="responsive-value-status">
              {displayGas !== null ? `${displayGas}%` : "--"}
            </p>
          </div>
        </div>

        {/* Middle Section */}
        <div className="freezer-temp-section mb-3">
          <div className="flex items-center justify-between">

            {/* Humidity */}
            <div className="flex items-center">
              <img src="/card-humidity-icon.svg" alt="Humidity" className="freezer-icon mr-1" />
              <div className="freezer-temp-info">
                <span className={`freezer-label `}>Humidity</span>
                <span className={`responsive-value  font-bold`}>
                  {displayHumidity !== null ? `${displayHumidity}%` : "--"}
                </span>
                   <p className={`h-2 w-[2.7rem] rounded-full ${humidityAlert ? "bg-rose-300" :  "bg-[#BAEACC]"}`}/>
              
              </div>
            </div>

            {/* Temperature */}
            <div className="flex items-center">
              <img src="/temperature-icon.svg" alt="Temperature" className="freezer-icon mr-1" />
              <div className="freezer-temp-info">
                <span className={`freezer-label `}>Temperature</span>
                <span className={`responsive-value  font-bold`}>
                  {displayTemp !== null ? `${displayTemp}°C` : "--"}
                </span>
                  <p className={`h-2 w-[2.7rem] rounded-full ${temperatureAlert ? "bg-rose-300" :  "bg-[#BAEACC]"}`}/>
               
              </div>
              
            </div>

          </div>
        </div>

        {/* Bottom Alert */}
        {/* {glAlert && (
          <div className="bg-gray-100 -m-4 w-[calc(100%+2rem)] py-1 px-5 flex items-center justify-between">
            <h4 className="">Alert</h4>
            <div className="flex items-center">
              <h4 className="mr-2">Gas Leak</h4>
              <Zap size={20} className="text-amber-600" />
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}

GasLeakageDeviceCard.propTypes = {
  deviceId: PropTypes.string,
  isSelected: PropTypes.bool,
  onCardSelect: PropTypes.func,
  espGL: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  glAlert: PropTypes.bool,
  espHumidity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  espTemprature: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  temperatureAlert: PropTypes.bool,
  humidityAlert: PropTypes.bool,
  isOnline: PropTypes.bool,
  lastUpdateISO: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

};
