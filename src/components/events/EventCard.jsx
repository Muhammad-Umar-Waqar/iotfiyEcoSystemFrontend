// EventCard.jsx
import Tooltip from "@mui/material/Tooltip";
import { Clock, Power, Trash2 } from "lucide-react";

const cardClip = {
  clipPath:
    'path("M 20,0 L 200,0 A 20,20 0,0,1 220,20 L 220,90 A 20,20 0,0,1 200,110 L 150,110 A 20,20 0,0,0 140,120 L 140,130 L 140,140 A 20,20 0,0,1 130,150 L 20,150 A 20,20 0,0,1 0,130 L 0,20 A 20,20 0,0,1 20,0 Z")',
  WebkitClipPath:
    'path("M 20,0 L 200,0 A 20,20 0,0,1 220,20 L 220,90 A 20,20 0,0,1 200,110 L 150,110 A 20,20 0,0,0 140,120 L 140,130 L 140,140 A 20,20 0,0,1 130,150 L 20,150 A 20,20 0,0,1 0,130 L 0,20 A 20,20 0,0,1 20,0 Z")',
};

// ─── UTC "HH:mm" → local 12-hour display ──────────────────────────────────
const formatTime = (utcTime) => {
  if (!utcTime) return "--:--";
  const [hours, minutes] = utcTime.split(":").map(Number);

  const date = new Date();
  date.setUTCHours(hours, minutes, 0, 0);   // pin to UTC

  let h = date.getHours();                  // browser converts to local
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m} ${period}`;
};

const DAY_ORDER = [
  "sunday", "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday",
];

const getLocalDayShift = (utcTimeString) => {
  if (!utcTimeString) return 0;
  const [h, m] = utcTimeString.split(":").map(Number);
  const date = new Date();
  date.setUTCHours(h, m, 0, 0);

  // Compare UTC weekday vs local weekday
  let shift = date.getDay() - date.getUTCDay(); // local − UTC
  // Normalise Sun(0)↔Sat(6) edge cases
  if (shift > 1)  shift = -1;
  if (shift < -1) shift = 1;
  return shift;
};

const convertUTCDaysToLocal = (utcDays = [], utcStartTime) => {
  const shift = getLocalDayShift(utcStartTime);
  if (shift === 0) return utcDays;

  return utcDays.map((day) => {
    const idx = DAY_ORDER.indexOf(day.toLowerCase());
    if (idx === -1) return day;                          // unknown string → pass through
    return DAY_ORDER[(idx + shift + 7) % 7];
  });
};

// ─── Abbreviate + capitalise: "wednesday" → "Wed" ─────────────────────────
const shortDay = (day = "") =>
  day.charAt(0).toUpperCase() + day.slice(1, 3);

// ─── Show first, "…", last when more than 2 days ─────────────────────────
const formatDays = (days = []) => {
  if (days.length <= 2) return { display: days, tooltip: null };
  return {
    display: [days[0], "…", days[days.length - 1]],
    tooltip: days.join(", "),
  };
};

// ──────────────────────────────────────────────────────────────────────────

const EventCard = ({ event, onToggle, onDelete, isTriggerEvent = false }) => {
  // Convert UTC days to local before displaying
  const localDays = convertUTCDaysToLocal(event.days, event.startTime);
  const { display, tooltip } = formatDays(localDays);

  const dayChips = (
    <div className="flex flex-wrap gap-1.5">
      {display.map((d, i) => (
        <span
          key={i}
          className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold"
        >
          {d === "…" ? "…" : shortDay(d)}
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative flex-shrink-0 w-[min(92vw,220px)] h-[150px] overflow-visible">
      {/* Main clipped card */}
      <div style={cardClip} className="absolute inset-0 bg-white">
        <div className="relative h-full p-3 flex flex-col justify-between">

          {/* Top row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock size={14} strokeWidth={2} />
              <span className="text-xs font-medium tracking-wide">
                {isTriggerEvent ? "Trigger" : "Schedule"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {event.command && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    event.command === "ON"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {event.command}
                  {event.command === "ON" && event.setTemperature != null
                    ? ` ${event.setTemperature}°`
                    : ""}
                </span>
              )}
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Time */}
          {isTriggerEvent ? (
            // Trigger event: only start time
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums leading-none">
                {formatTime(event.startTime)}
              </span>
              <span className="text-xs font-semibold text-gray-500">Trigger Time</span>
            </div>
          ) : (
            // Scheduling event: start and end time
            <div className="flex flex-wrap items-center justify-center gap-x-3">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-md font-extrabold tracking-tight text-slate-900 tabular-nums leading-none">
                  {formatTime(event.startTime)}
                </span>
                <span className="text-xs font-semibold text-gray-500">Start</span>
              </div>
              <span className="text-2xl font-semibold text-slate-400 leading-none">-</span>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-md font-extrabold tracking-tight text-slate-900 tabular-nums leading-none">
                  {formatTime(event.endTime)}
                </span>
                <span className="text-xs font-semibold text-gray-500">End</span>
              </div>
            </div>
          )}

          {/* Days */}
          <div>
            {localDays.length ? (
              tooltip ? (
                <Tooltip title={tooltip} arrow enterTouchDelay={0} leaveTouchDelay={3000}>
                  <div className="cursor-default">{dayChips}</div>
                </Tooltip>
              ) : dayChips
            ) : (
              <span className="text-xs italic text-slate-300">No repeat days</span>
            )}
          </div>
        </div>
      </div>

      {/* Enable / Disable toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={event.status === "ACTIVE"}
        className={`absolute -right-0 bottom-0 z-20 inline-flex items-center gap-1 px-2 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all duration-200 active:scale-[0.98] ${
          event.status === "ACTIVE"
            ? "bg-indigo-500 text-white hover:bg-indigo-600"
            : "bg-emerald-500 text-white hover:bg-emerald-600"
        }`}
      >
        <Power size={14} strokeWidth={2} />
        {event.status === "ACTIVE" ? "Disable" : "Enable"}
      </button>
    </div>
  );
};

export default EventCard;