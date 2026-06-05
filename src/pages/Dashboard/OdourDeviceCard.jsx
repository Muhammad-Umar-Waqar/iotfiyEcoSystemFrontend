// // src/pages/Dashboard/OdourDeviceCard.jsx
import "../../styles/global/fonts.css";
import "../../styles/pages/Dashboard/freezer-cards-responsive.css";
import PropTypes from "prop-types";

export default function OdourDeviceCard({
  deviceId,
  isSelected = false,
  onCardSelect,
  espTemprature = null,
  espHumidity = null,
  temperatureAlert = false,
  humidityAlert = false,
  espOdour = null,
  odourAlert = false,
  isOnline = false,
  lastUpdateISO = null,
}) {
  const toInt = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  };


  console.log("OdourCard props:", { deviceId, isOnline, lastUpdateISO });



  const displayTemp = toInt(espTemprature);
  const displayHumidity = toInt(espHumidity);
  const displayOdour = toInt(espOdour);

  const handleCardClick = () => {
    if (onCardSelect) onCardSelect();
  };

  console.log("humidityAlert>>", humidityAlert)
  // Alert priority: Odour > Temp/Humidity > none
  const hasTempOrHum = Boolean(temperatureAlert || humidityAlert);
  let alertStatus = "none";
  if (odourAlert) alertStatus = "odour";
  else if (hasTempOrHum) alertStatus = "other";

  // const textClass = alertStatus !== "none" ? "text-white" : "text-black";


  const selectedClass = isSelected
    ? "shadow-lg transition-transform duration-300 ease-out"
    : "transition-transform duration-300";

  // Bottom alert row (only odour/temp/humidity)
 

  // Device pill: only for Odour
  const devicePill = {
    label: `${displayOdour !== null ? displayOdour : 0}%`,
    img: odourAlert ? "/anti-odour.png" : "/odour-alert.svg",
    alt: "Odour",
  };

  
  const lastUpdateTitle = lastUpdateISO ? new Date(lastUpdateISO).toLocaleString() : "";


  return (
    <div
      onClick={handleCardClick}
      className={`freezer-card-container bg-white ${selectedClass} h-auto min-h-[180px] sm:h-auto`}
      style={isSelected ? { transform: "scale(1.01)" } : {}}
    >
      <div className="relative w-full h-full">
        <div className="freezer-card-content">
          {/* Device ID & Pill */}
          <div className="device-id-section flex justify-between items-start">
            {/* <div className="flex flex-col items-start">
              <span className={`device-id-label`}>Device ID</span>
               <h3 className={`responsive-value-deviceId `}>{deviceId}</h3> 
              <div className="text-lg font-bold">{deviceId}</div>
            </div> */}
{/* 
                    <div className="text-lg font-bold " title={lastUpdateTitle}>
                <span
                  aria-hidden
                  className={`inline-block h-3 w-3 rounded-full mr-2 shadow-sm ${isOnline ? "bg-green-500" : "bg-gray-300"}`}
                  style={{ boxShadow: isOnline ? "0 0 6px rgba(34,197,94,0.45)" : "none" }}
                />
                      <span className={`device-id-label`}>Device ID</span>
                <span className="truncate">{deviceId}</span>
              </div> */}

               <div title={lastUpdateTitle}>
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
        

            
            <div className={`ambient-pill ${odourAlert? "bg-rose-700/20": "bg-white/20"} border border-white/30 flex items-center`}>
              <img src={devicePill.img} alt={devicePill.alt} className="h-[2rem] w-[2rem] py-1" />
              <div>
                <p className="responsive-value-status">{devicePill.label}</p>
              </div>
            </div>
          </div>

          {/* Temp & Humidity */}
          <div className="freezer-temp-section mb-3 flex justify-between">
            <div className="flex items-center">
              <img src="/card-humidity-icon.svg" alt="Humidity" className="freezer-icon mr-1" />
              <div className="freezer-temp-info">
                <span className={`freezer-label `}>Humidity</span>
                <span className={`responsive-value font-bold`}>
                  {displayHumidity !== null ? `${displayHumidity}%` : "--"}
                </span>
                 <p className={`h-2 w-[2.7rem] rounded-full ${humidityAlert ? "bg-rose-300" :  "bg-[#BAEACC]"}`}/>
              </div>
            </div>

            <div className="flex items-center">
              <img src="/temperature-icon.svg" alt="Temperature" className="freezer-icon mr-1" />
              <div className="freezer-temp-info">
                <span className={`freezer-label `}>Temperature</span>
                <span className={`responsive-value font-bold`}>
                  {displayTemp !== null ? `${displayTemp}°C` : "0°C"}
                </span>
                <p className={`h-2 w-[2.7rem] rounded-full ${temperatureAlert ? "bg-rose-300" :  "bg-[#BAEACC]"}`}/>
               
              </div>
            </div>
          </div>

          {/* Bottom Alerts */}
          {/* <AlertBottom /> */}
        </div>
      </div>
    </div>
  );
}

OdourDeviceCard.propTypes = {
  deviceId: PropTypes.string,
  isSelected: PropTypes.bool,
  onCardSelect: PropTypes.func,
  espTemprature: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  espHumidity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  temperatureAlert: PropTypes.bool,
  humidityAlert: PropTypes.bool,
  espOdour: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  odourAlert: PropTypes.bool,
  isOnline: PropTypes.bool,
  lastUpdateISO: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
