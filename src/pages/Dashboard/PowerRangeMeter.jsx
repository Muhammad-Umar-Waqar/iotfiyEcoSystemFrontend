
import React from "react";
import PropTypes from "prop-types";

export default function PowerRangeMeter({
  value = 0,
  min = 15,
  max = 65,
}) {
  const numericValue = Number(value);

  const safeValue = Number.isFinite(numericValue)
    ? Math.min(Math.max(numericValue, min), max)
    : min;

  const percentage = ((safeValue - min) / (max - min)) * 100;

  return (
    <div className=" w-[75%] ">
      {/* <div className="relative h-5 flex items-center"> */}
      <div className="relative my-2 flex items-center">
        
        {/* Segmented Bar */}
        <div className="w-full h-3 rounded-sm flex overflow-hidden shadow-inner">
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
            bottom: "0%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="w-3 h-3 bg-black rounded-full border-3 border-white shadow-md z-10" />
          
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "6px solid black",
              marginTop: "-1px",
            }}
          />
        </div>
      </div>
    </div>
  );
}

PowerRangeMeter.propTypes = {
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
};
