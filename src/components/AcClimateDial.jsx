import { useMemo } from "react";
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import {
  Minus,
  Plus,
  Lock,
  Unlock,
  Snowflake,
  Sun,
  Droplet,
  Wind,
  Sparkles,
  Fan,
  Gauge,
  Zap,
} from "lucide-react";
import { useAcControl } from "../contexts/AcControlContext";

// Same lucide icons as prototype dial UI
const MODE_OPTIONS = [
  { value: "Cool", label: "Cool", Icon: Snowflake },
  { value: "Heat", label: "Heat", Icon: Sun },
  { value: "Dry", label: "Dry", Icon: Droplet },
  { value: "FanOnly", label: "Fan Only", Icon: Wind },
  { value: "Auto", label: "Auto", Icon: Sparkles },
];

const FAN_OPTIONS = [
  { value: "Low", label: "Low", Icon: Wind },
  { value: "Medium", label: "Medium", Icon: Fan },
  { value: "Ultra", label: "Ultra", Icon: Gauge },
  { value: "Turbo", label: "Turbo", Icon: Zap },
];

const selectSx = {
  borderRadius: "12px",
  "& .MuiOutlinedInput-notchedOutline": { borderRadius: "12px" },
};

const OptionRow = ({ Icon, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Icon size={16} className="text-sky-600 shrink-0" />
    <span>{label}</span>
  </Box>
);

/**
 * Dial-style AC controls for VenueDetailsPanel.
 * Same actions as before: setTemperature ±, lock, mode, fan — via AcControlContext.
 */
export default function AcClimateDial({
  deviceId,
  isOnline = true,
  healthAlert = false,
}) {
  const {
    getAc,
    busyMap,
    stepTemperature,
    updateAcSettings,
    TEMP_MIN,
    TEMP_MAX,
  } = useAcControl();

  const ac = deviceId ? getAc(deviceId) : null;
  const settingsLoading = busyMap[deviceId] === "settings";
  const disabled = !isOnline || settingsLoading || !ac;

  const temp = Number(ac?.setTemperature ?? 24);
  const locked = !!ac?.acLocked;
  const mode = ac?.acMode || "Cool";
  const fan = ac?.fanSpeed || "Low";
  const showHealth = !!(ac?.acHealthAlert || healthAlert);

  const pct = useMemo(() => {
    const span = TEMP_MAX - TEMP_MIN || 1;
    return Math.max(0, Math.min(1, (temp - TEMP_MIN) / span));
  }, [temp, TEMP_MIN, TEMP_MAX]);

  // Arc geometry (same idea as dial meters)
  const r = 78;
  const cx = 100;
  const cy = 100;
  const start = -210;
  const sweep = 240;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const polar = (deg) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  });
  const a0 = start;
  const a1 = start + sweep * pct;
  const p0 = polar(a0);
  const p1 = polar(a1);
  const large = sweep * pct > 180 ? 1 : 0;
  const arcPath = `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
  const trackEnd = polar(start + sweep);
  const trackPath = `M ${p0.x} ${p0.y} A ${r} ${r} 0 1 1 ${trackEnd.x} ${trackEnd.y}`;

  if (!ac) return null;

  const modeOpt = MODE_OPTIONS.find((o) => o.value === mode) || MODE_OPTIONS[0];
  const fanOpt = FAN_OPTIONS.find((o) => o.value === fan) || FAN_OPTIONS[0];

  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3 space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          AC Climate
        </div>
        <button
          type="button"
          disabled={disabled}
          title={locked ? "Unlock" : "Lock"}
          onClick={() =>
            updateAcSettings(deviceId, { acLocked: !locked }, { isOnline })
          }
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold disabled:opacity-40 ${
            locked
              ? "border-amber-400 text-amber-700 bg-amber-50"
              : "border-gray-200 text-gray-600"
          }`}
        >
          {locked ? <Lock size={14} /> : <Unlock size={14} />}
          {locked ? "Locked" : "Unlocked"}
        </button>
      </div>

      <div className="relative mx-auto w-[220px] h-[180px]">
        <svg viewBox="0 0 200 170" className="w-full h-full">
          <defs>
            <linearGradient
              id={`ac-temp-fill-${deviceId}`}
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="45%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient
              id={`ac-temp-lock-${deviceId}`}
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <path
            d={trackPath}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d={arcPath}
            fill="none"
            stroke={
              locked
                ? `url(#ac-temp-lock-${deviceId})`
                : `url(#ac-temp-fill-${deviceId})`
            }
            strokeWidth="12"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div className="flex items-baseline gap-0.5 leading-none">
            <span className="text-4xl font-bold text-gray-900 tabular-nums">{temp}</span>
            <span className="text-lg font-semibold text-gray-500">°C</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              disabled={disabled || temp <= TEMP_MIN}
              onClick={() => stepTemperature(deviceId, -1, { isOnline })}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-sm disabled:opacity-40 hover:bg-gray-50"
              aria-label="Decrease temperature"
            >
              <Minus size={16} />
            </button>
            <button
              type="button"
              disabled={disabled || temp >= TEMP_MAX}
              onClick={() => stepTemperature(deviceId, 1, { isOnline })}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-sm disabled:opacity-40 hover:bg-gray-50"
              aria-label="Increase temperature"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <FormControl size="small" fullWidth disabled={disabled}>
          <InputLabel id={`ac-mode-${deviceId}`}>Mode</InputLabel>
          <Select
            labelId={`ac-mode-${deviceId}`}
            label="Mode"
            value={mode}
            onChange={(e) =>
              updateAcSettings(deviceId, { acMode: e.target.value }, { isOnline })
            }
            sx={selectSx}
            renderValue={() => (
              <OptionRow Icon={modeOpt.Icon} label={modeOpt.label} />
            )}
            MenuProps={{
              PaperProps: { sx: { borderRadius: "12px", mt: 0.5 } },
            }}
          >
            {MODE_OPTIONS.map(({ value, label, Icon }) => (
              <MenuItem key={value} value={value}>
                <OptionRow Icon={Icon} label={label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth disabled={disabled}>
          <InputLabel id={`ac-fan-${deviceId}`}>Fan</InputLabel>
          <Select
            labelId={`ac-fan-${deviceId}`}
            label="Fan"
            value={fan}
            onChange={(e) =>
              updateAcSettings(
                deviceId,
                { fanSpeed: e.target.value },
                { isOnline }
              )
            }
            sx={selectSx}
            renderValue={() => (
              <OptionRow Icon={fanOpt.Icon} label={fanOpt.label} />
            )}
            MenuProps={{
              PaperProps: { sx: { borderRadius: "12px", mt: 0.5 } },
            }}
          >
            {FAN_OPTIONS.map(({ value, label, Icon }) => (
              <MenuItem key={value} value={value}>
                <OptionRow Icon={Icon} label={label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {showHealth && (
        <div className="text-xs font-semibold text-rose-600 bg-rose-50 rounded-md px-2 py-1">
          AC health alert
        </div>
      )}
    </div>
  );
}
