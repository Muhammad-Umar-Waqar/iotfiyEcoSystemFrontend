import React from "react";

/**
 * PowerToggle - Reusable toggle switch component for device control
 * @param {string} displayState - "on" | "off"
 * @param {boolean} isLocked - Grays out toggle when event is running or device offline
 * @param {boolean} loading - Shows spinner during API calls
 * @param {function} onClick - Click handler
 */
const PowerToggle = ({ displayState = "off", isLocked = false, loading = false, onClick }) => {
  const isOn = displayState === "on";

  // FORCE gray styling when locked (even if ON/OFF)
  const bgClass = isLocked
    ? "bg-gray-400"
    : isOn
      ? "bg-emerald-500"
      : "bg-rose-500";

  const label = isOn ? "ON" : "OFF";

  const knobClass = isOn ? "translate-x-7" : "translate-x-0";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`
        relative w-12 h-5 rounded-full
        transition-all duration-300
        flex-shrink-0 focus:outline-none

        ${bgClass}

        ${loading
          ? "opacity-70 "
          : isLocked
            ? "opacity-50 cursor-pointer ring-1 ring-gray-300"
            : "cursor-pointer hover:scale-[1.02]"
        }
      `}
    >
      {/* LOADING SPINNER */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {/* LABEL - hide when loading */}
      {!loading && (
        <span
          className={`
            absolute top-1/2 -translate-y-1/2
            text-[9px] font-bold tracking-wide
            text-white pointer-events-none
            ${isOn ? "left-2" : "right-1.5"}
          `}
        >
          {label}
        </span>
      )}

      {/* KNOB - hide when loading */}
      {!loading && (
        <div
          className={`
            absolute top-1 left-1
            w-3 h-3 bg-white rounded-full shadow-sm
            transition-transform duration-300
            ${knobClass}
          `}
        />
      )}
    </button>
  );
};

export default PowerToggle;
