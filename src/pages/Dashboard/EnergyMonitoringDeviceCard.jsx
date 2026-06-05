// src/pages/EnergyMonitoringDeviceCard.jsx
import React, { useMemo } from "react";
import "../../styles/pages/Dashboard/dashboard-styles.css";
import PowerRangeMeter from "./PowerRangeMeter";

function formatSmartNumber(v, maxDecimals = 3) {
  if (v === undefined || v === null || v === "") return "--";
  const n = Number(v);
  if (!Number.isFinite(n)) return "--";

  return parseFloat(n.toFixed(maxDecimals)).toString();
}

// Returns { intPart, decPart, unit } for styled power display
// < 1,000          → Wh,  2 decimals  (e.g. 45.67 Wh,   342.50 Wh)
// 1,000 – 99,999   → kWh, 3 decimals  (e.g. 2.000 kWh,  99.999 kWh)
// 100,000 – 999,999→ kWh, 2 decimals  (e.g. 123.45 kWh, 999.99 kWh)
// ≥ 1,000,000      → MWh, 3 decimals  (e.g. 1.234 MWh,  10.500 MWh)


function formatPower(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;

  if (n >= 1_000_000) {
    const [intPart, decPart] = (n / 1_000_000).toFixed(3).split(".");
    return { intPart, decPart, unit: "MW" };
  }

  if (n >= 100_000) {
    const [intPart, decPart] = (n / 1000).toFixed(2).split(".");
    return { intPart, decPart, unit: "kW" };
  }

  if (n >= 1000) {
    const [intPart, decPart] = (n / 1000).toFixed(3).split(".");
    return { intPart, decPart, unit: "kW" };
  }

  const [intPart, decPart] = n.toFixed(2).split(".");
  return { intPart, decPart, unit: "W" };
}

const EnergyMonitoringDeviceCard = React.memo(function EnergyMonitoringDeviceCard({
    deviceId,
    espVoltage,
    espCurrent,
    espPower,
    espTemprature,
    espHumidity,
    isOnline,
    lastUpdateISO,
    onCardSelect,
    isSelected,
    temperatureAlert,
    humidityAlert
}) {

    const calculatedPower = useMemo(() => {
    const v = Number(espVoltage);
    const c = Number(espCurrent);

    if (!Number.isFinite(v) || !Number.isFinite(c)) return null;

    return v * c;
}, [espVoltage, espCurrent]);


    return (
        <div onClick={onCardSelect} className={`freezer-card-container rounded-4xl  bg-white ${isSelected ? "shadow-lg" : ""} min-h-[160px]`} >
            <div className="px-4 py-3 h-full flex flex-col  justify-between">

                <div className="flex justify-between ">
                    <div>
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

                    <div>
                        <div className={`ambient-pill bg-white/20 border border-white/30 flex items-center`}>
                            <img src="/ampere-Icon.png" alt="Ampere Icon" className="h-[2rem] w-[2rem] " />
                            <div>
                                <p className="responsive-value-status">{formatSmartNumber(espCurrent, 2)} <span className="font-normal  ">A</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between">
                    <div className="flex items-center justify-between ">
                        <div className=" border-b-2  border-gray-300 w-full  ">

                            {(() => {
                                // const power = formatPower(espPower);
                                const power = formatPower(calculatedPower);
                                if (!power) return <div className="text-3xl font-bold">--</div>;

                                const { intPart, decPart, unit } = power;
                                return (
                                    <div className="flex items-end gap-x-2 mb-2">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="text-start text-sm text-gray-900 ">Power</div>
                                            <img src="/power-icon.png" alt="Power" className="w-8" />
                                        </div>

                                        <div>
                                            <span className="text-3xl font-bold leading-none">
                                                {intPart}
                                            </span>

                                            {decPart && (
                                                <>
                                                    <span className="text-lg font-bold leading-none">.</span>
                                                    <span className="text-lg font-bold leading-none">
                                                        {decPart}
                                                    </span>
                                                </>
                                            )}

                                            <span className="text-md font-medium ml-1">{unit}</span>
                                        </div>
                                    </div>
                                );
                            })()}

                        </div>
                    </div>


                    <div>
                        <div className="flex items-center">
                            <div className="flex flex-col items-end mb-0.5">
                                <div className={`text-sm text-gray-500 `}>Voltage</div>
                                <span className={`text-2xl font-bold`}>
                                    {espVoltage}<span className="font-normal">V</span>
                                </span>
                                <p className={`h-2 w-[3rem] rounded-full bg-[#BAEACC]`} />
                            </div>
                        </div>
                    </div>
                </div>



                <div className="flex justify-between items-center  ">

                    <div className="w-[260px]">
                        <PowerRangeMeter value={espTemprature !== null ? Math.round(espTemprature) : 0} />
                    </div>

                    <div className="flex items-center justify-start gap-4">
                        <div className="flex  items-center justify-center gap-1 ">
                            <div className="flex flex-col items-center ">
                                <div className="text-xs">Temperature</div>
                                <div className="text-sm text-right font-semibold">{espTemprature ?? "--"}°C</div>
                                {
                                    temperatureAlert ?
                                        <img src="/humidity-red-alert.svg" alt="" className="w-[3rem] rounded-3px" /> :
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

            </div>


        </div>

    );
});

export default EnergyMonitoringDeviceCard;