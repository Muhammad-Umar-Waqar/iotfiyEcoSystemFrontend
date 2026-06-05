
import React from "react";
import PropTypes from "prop-types";

export default function TemperatureRangeMeter({
  value = 0,
  min = 16,
  max = 40,
}) {
  const numericValue = Number(value);

  const safeValue = Number.isFinite(numericValue)
    ? Math.min(Math.max(numericValue, min), max)
    : min;

  const percentage = ((safeValue - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <div className="relative my-5 flex items-center">
        {/* Segmented Bar */}
        <div className="w-full h-3 rounded-full flex overflow-hidden shadow-inner">
          <div className="flex-1 bg-green-600" />
          <div className="flex-1 bg-lime-400" />
          <div className="flex-1 bg-yellow-400" />
          <div className="flex-1 bg-orange-400" />
          <div className="flex-1 bg-red-500" />
        </div>

        {/* Pointer */}
        <div
          className="absolute flex flex-col items-center"
          style={{
            left: `${percentage}%`,
            top: "60%",
            transform: "translate(-50%, 2px)",
          }}
        >
          {/* Upward triangle */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderBottom: "8px solid black",
            }}
          />

          {/* Dot below */}
          <div className="w-3 h-3 bg-black rounded-full border-2 border-white shadow-md -mt-1 z-10" />
        </div>
      </div>
    </div>
  );
}

TemperatureRangeMeter.propTypes = {
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
};