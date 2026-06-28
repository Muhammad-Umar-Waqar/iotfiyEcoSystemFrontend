// import React from "react";

// /**
//  * PowerToggle - Reusable toggle switch component for device control
//  * @param {string} displayState - "on" | "off"
//  * @param {boolean} isLocked - Grays out toggle when event is running or device offline
//  * @param {boolean} loading - Shows spinner during API calls
//  * @param {function} onClick - Click handler
//  */
// const PowerToggle = ({ displayState = "off", isLocked = false, loading = false, onClick }) => {
//   const isOn = displayState === "on";

//   // FORCE gray styling when locked (even if ON/OFF)
//   const bgClass = isLocked
//     ? "bg-gray-400"
//     : isOn
//       ? "bg-emerald-500"
//       : "bg-rose-500";

//   const label = isOn ? "ON" : "OFF";

//   const knobClass = isOn ? "translate-x-7" : "translate-x-0";

//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       disabled={loading}
//       className={`
//         relative w-12 h-5 rounded-full
//         transition-all duration-300
//         flex-shrink-0 focus:outline-none

//         ${bgClass}

//         ${loading
//           ? "opacity-70 "
//           : isLocked
//             ? "opacity-50 cursor-pointer ring-1 ring-gray-300"
//             : "cursor-pointer hover:scale-[1.02]"
//         }
//       `}
//     >
//       {/* LOADING SPINNER */}
//       {loading && (
//         <div className="absolute inset-0 flex items-center justify-center">
//           <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//           </svg>
//         </div>
//       )}

//       {/* LABEL - hide when loading */}
//       {!loading && (
//         <span
//           className={`
//             absolute top-1/2 -translate-y-1/2
//             text-[9px] font-bold tracking-wide
//             text-white pointer-events-none
//             ${isOn ? "left-2" : "right-1.5"}
//           `}
//         >
//           {label}
//         </span>
//       )}

//       {/* KNOB - hide when loading */}
//       {!loading && (
//         <div
//           className={`
//             absolute top-1 left-1
//             w-3 h-3 bg-white rounded-full shadow-sm
//             transition-transform duration-300
//             ${knobClass}
//           `}
//         />
//       )}
//     </button>
//   );
// };

// export default PowerToggle;





import React, { useState } from "react";
 
/**
 * PowerToggle - Reusable toggle switch component for device control
 * @param {string} displayState - "on" | "off"
 * @param {boolean} isLocked - Grays out toggle when event is running or device offline
 * @param {boolean} loading - Shows spinner during API calls
 * @param {function} onClick - Click handler
 */
function PowerToggle({ displayState = "off", isLocked = false, loading = false, onClick }) {
  const isOn = displayState === "on";
  const label = isOn ? "ON" : "OFF";
 
  // Solid colors (not gradients) — background-color is what CSS can actually
  // animate smoothly. Gradients (background-image) snap instantly, no matter
  // what transition classes you add.
  const trackClass = isLocked
    ? "bg-gray-400"
    : isOn
      ? "bg-emerald-500"
      : "bg-rose-500";
 
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-pressed={isOn}
      className={`
        relative w-14 h-7 rounded-full flex-shrink-0
        transition-all duration-300 ease-in-out focus:outline-none
        focus-visible:ring-2 focus-visible:ring-offset-2
        ${isOn ? "focus-visible:ring-emerald-400" : "focus-visible:ring-rose-400"}
        shadow-[0_1px_3px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.25)]
        ${trackClass}
        ${loading
          ? "opacity-70"
          : isLocked
            ? "opacity-60 cursor-not-allowed ring-1 ring-gray-300"
            : "cursor-pointer hover:brightness-105 active:scale-[0.96]"
        }
      `}
    >
      {/* LOADING SPINNER */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
 
      {/* LABEL */}
      {!loading && (
        <span
          className={`
            absolute top-1/2 -translate-y-1/2
            text-[10px] font-extrabold tracking-wide
            text-white pointer-events-none select-none
            ${isOn ? "left-2" : "right-2"}
          `}
        >
          {label}
        </span>
      )}
 
      {/* KNOB */}
      {!loading && (
        <div
          className={`
            absolute top-0.5 left-0.5
            w-6 h-6 rounded-full
            bg-gradient-to-br from-white to-gray-100
            shadow-[0_2px_3px_rgba(0,0,0,0.3)]
            transition-transform duration-300 ease-in-out
            ${isOn ? "translate-x-7" : "translate-x-0"}
          `}
        />
      )}
    </button>
  );
};

export default PowerToggle;