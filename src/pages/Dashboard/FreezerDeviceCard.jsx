
// // src/pages/Dashboard/FreezerDeviceCard.jsx
import "../../styles/global/fonts.css";
import "../../styles/pages/Dashboard/freezer-cards-responsive.css";
import { Wind, Zap } from "lucide-react"; // lucide icons for AQI and Gas
import PropTypes from "prop-types";

export default function FreezerDeviceCard({
  deviceId,
  isSelected = false,
  onCardSelect,
  // common telemetry / alerts
  espTemprature = null,
  espHumidity = null,
  temperatureAlert = false,
  humidityAlert = false,
  // device-specific telemetry / alerts
  deviceType = "TMD", // "OMD" | "TMD" | "AQIMD" | "GLMD"
  espOdour = null,
  odourAlert = false,
  espAQI = null,
  aqiAlert = false,
  espGL = null,
  glAlert = false,
  // legacy names (if you still pass)
  ambientTemperature,
  freezerTemperature,
}) {
  const toInt = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  };

  // display numeric values (integer part)
  const displayTemp = toInt(espTemprature ?? ambientTemperature ?? freezerTemperature);
  const displayHumidity = toInt(espHumidity);
  const displayOdourPer = toInt(espOdour);
  const displayAQI = espAQI === null || espAQI === undefined ? null : Number(espAQI);
  const displayGass = toInt(espGL);

  const handleCardClick = () => {
    if (onCardSelect) onCardSelect();
  };

  // Alert priority:
  // odour (OMD) highest -> 'odour'
  // aqi (AQIMD) next -> 'aqi'
  // gass (GLMD) next -> 'gass'
  // temperature/humidity -> 'other'
  // none -> 'none'
  const hasTempOrHum = Boolean(temperatureAlert || humidityAlert);

  
  let alertStatus = "none";
  if (odourAlert) alertStatus = "odour";
  else if (aqiAlert) alertStatus = "aqi";
  else if (glAlert) alertStatus = "gass";
  else if (hasTempOrHum) alertStatus = "other";

  const textClass = alertStatus !== "none" ? "text-white" : "text-black";

  // card background mapping (you can change hex to match your design)
  const bgClass =
    alertStatus === "odour"
      ? "bg-[#CF4F4F]" // red
      : alertStatus === "aqi"
      ? "bg-[#7C3AED]" // purple
      : alertStatus === "gass"
      ? "bg-[#F59E0B]" // amber / orange
      : alertStatus === "other"
      ? "bg-green-400"
      : "bg-white";

  const selectedClass = isSelected ? "shadow-lg transition-transform duration-300 ease-out" : "transition-transform duration-300";

  // Compose icons for bottom alert row (keep your existing images for temp/hum/odour)
  const AlertBottom = ({ odourAlert, temperatureAlert, humidityAlert, aqiAlert, glAlert }) => {
    const activeIcons = [];

    if (odourAlert) activeIcons.push(<img key="odour" src="/anti-odour.png" alt="Odour" className="h-[25px] w-[25px]" />);
    if (temperatureAlert) activeIcons.push(<img key="temp" src="/white-temperature-dashboard.svg" alt="Temperature" className="h-[30px] w-[20px]" />);
    if (humidityAlert) activeIcons.push(<img key="humidity" src="/humidity-alert.svg" alt="Humidity" className="h-[25px] w-[20px]" />);
    if (aqiAlert) activeIcons.push(<Wind key="aqi" size={22} className="text-white" />); // lucide icon
    if (glAlert) activeIcons.push(<Zap key="gass" size={20} className="text-white" />); // lucide icon

    if (activeIcons.length === 0) return null;

    return (
      <div className={`bg-white/20 -m-4 w-[calc(100%+2rem)] py-1 px-5 flex items-center justify-between`}>
        <h3 className={textClass}>Alert</h3>
        <div className="flex items-center ">
          <h4 className="mr-2">Detected</h4>
          <div className="flex items-center justify-center space-x-2">
            {activeIcons.map((ic, i) => <span key={i} className="flex items-center">{ic}</span>)}
          </div>
        </div>
      </div>
    );
  };

  // compute the small device-type pill content
  const devicePill = (() => {
    switch (deviceType) {
      case "OMD":
        return {
          label: `${displayOdourPer !== null ? displayOdourPer : 0}%`,
          img: odourAlert ? "/anti-odour.png" : "/odour-alert.svg",
          alt: "Odour",
        };
      case "AQIMD":
        return {
          label: displayAQI !== null ? `${displayAQI} AQI` : "--",
          icon: <Wind size={20} className="text-yellow-900" />,
          alt: "AQI",
        };
      case "GLMD":
        return {
          label: `${displayGass !== null ? displayGass : 0}%`,
          icon: <Zap size={20} className="text-pink-900" />,
          alt: "Gas",
        };
      default:
        return {
          label: "", // for TMD we don't need the pill; return empty to hide
        };
    }
  })();

  return (
    <div
      onClick={handleCardClick}
      className={`freezer-card-container ${bgClass} ${selectedClass} h-auto min-h-[180px] sm:h-auto`}
      style={isSelected ? { transform: "scale(1.01)" } : {}}
    >
      <div className={`relative w-full h-full`}>
        <div className="freezer-card-content">
          <div className="device-id-section">
            <div className="flex flex-col items-start">
              <span className={`device-id-label ${textClass}`}>Device ID</span>
              <h3 className={`responsive-value-deviceId ${textClass}`}>{deviceId}</h3>
            </div>

            {/* Device-specific pill: appears for OMD/AQIMD/GLMD */}
            {devicePill && devicePill.label ? (
              <div className={`ambient-pill bg-white/20 border border-white/30 flex items-center`}>
                {/* prefer provided icon; fallback to img if present */}
                {devicePill.icon ? (
                  <div className="px-2">{devicePill.icon}</div>
                ) : (
                  <img src={devicePill.img} alt={devicePill.alt} className="h-[2rem] w-[2rem] py-1" />
                )}

                <div>
                  <p className="responsive-value-status">
                    <span className="responsive-value-status">{devicePill.label}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ width: 0 }} />
            )}
          </div>

          {/* Middle Section: always show Humidity and Temperature */}
          <div className="freezer-temp-section mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img src="/card-humidity-icon.svg" alt="Humidity" className="freezer-icon mr-0.5 xs:mr-none sm:mr-1" />
                <div className="freezer-temp-info">
                  <span className={`freezer-label ${textClass}`}>Humidity</span>
                  <span className={`responsive-value ${textClass} font-bold`}>
                    {displayHumidity !== null ? `${displayHumidity}%` : "--"}
                  </span>
                </div>
              </div>

              <div className="flex items-center">
                <img src="/temperature-icon.svg" alt="Temperature" className="freezer-icon mr-0.5 xs:mr-none sm:mr-1" />
                <div className="freezer-temp-info">
                  <span className={`freezer-label ${textClass}`}>Temperature</span>
                  <span className={`responsive-value ${textClass} font-bold`}>
                    {displayTemp !== null ? `${displayTemp}°C` : "0°C"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Alerts */}
          <AlertBottom
            odourAlert={odourAlert}
            temperatureAlert={temperatureAlert}
            humidityAlert={humidityAlert}
            aqiAlert={aqiAlert}
            glAlert={glAlert}
          />
        </div>
      </div>
    </div>
  );
}

FreezerDeviceCard.propTypes = {
  deviceId: PropTypes.string,
  isSelected: PropTypes.bool,
  onCardSelect: PropTypes.func,
  espTemprature: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  espHumidity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  temperatureAlert: PropTypes.bool,
  humidityAlert: PropTypes.bool,
  deviceType: PropTypes.string,
  espOdour: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  odourAlert: PropTypes.bool,
  espAQI: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  aqiAlert: PropTypes.bool,
  espGL: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  glAlert: PropTypes.bool,
};











