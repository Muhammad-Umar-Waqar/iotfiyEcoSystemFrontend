import { useState } from "react";
import { createPortal } from "react-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { X } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Swal from "sweetalert2";
dayjs.extend(utc);

const daysList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TriggerEventModal = ({ open, onClose, onSave }) => {
  const [startTime, setStartTime] = useState(null);
  const [days, setDays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!open) return null;

  const toggleDay = (day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const isSaveDisabled = isLoading || !startTime || days.length === 0;

  const handleSave = async () => {
    if (isSaveDisabled) return;
    setIsLoading(true);

    if (!startTime) {
      setIsLoading(false);
      return Swal.fire({
        icon: "warning",
        title: "Missing Time",
        text: "Please select start time",
      });
    }

    if (days.length === 0) {
      setIsLoading(false);
      return Swal.fire({
        icon: "warning",
        title: "No Days Selected",
        text: "Please select at least one day",
      });
    }

    try {
      // Convert LOCAL → UTC
      const startUTC = startTime.utc().format("HH:mm");

      // Calculate day shift caused by UTC conversion
      const localDayIndex = startTime.day();
      const utcDayIndex = startTime.utc().day();

      let dayShift = utcDayIndex - localDayIndex;
      if (dayShift > 1) dayShift = -1;
      if (dayShift < -1) dayShift = 1;

      // Day name maps
      const shortToIndex = {
        Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
      };
      const indexToFull = {
        0: "sunday", 1: "monday", 2: "tuesday", 3: "wednesday",
        4: "thursday", 5: "friday", 6: "saturday",
      };

      // Shift each selected day
      const formattedDays = days.map((d) => {
        const shifted = (shortToIndex[d] + dayShift + 7) % 7;
        return indexToFull[shifted];
      });

      console.log("Trigger Event - Local start:", startTime.format("ddd HH:mm"));
      console.log("Trigger Event - UTC start:", startTime.utc().format("ddd HH:mm"));
      console.log("Trigger Event - Day shift:", dayShift);
      console.log("Trigger Event - Payload:", { startUTC, days: formattedDays });

      await onSave({
        startTime: startUTC,
        days: formattedDays,
      });

      // Reset form
      setStartTime(null);
      setDays([]);
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Failed", text: "Could not create trigger event" });
    } finally {
      setIsLoading(false);
    }
  };

  const timePickerSx = {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      backgroundColor: "#F8FAFC",
      fontSize: "0.9rem",
      "& fieldset": { borderColor: "#E2E8F0" },
      "&:hover fieldset": { borderColor: "#94A3B8" },
      "&.Mui-focused fieldset": { borderColor: "#3B82F6", borderWidth: "1.5px" },
    },
    "& .MuiInputLabel-root": { fontSize: "0.85rem", color: "#64748B" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#3B82F6" },
  };

  return createPortal(
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* Backdrop — portaled to body so it centers on the viewport, not VenueDetailsPanel */}
      <div
        className="fixed inset-0 z-[1400] flex items-center justify-center"
        style={{ backgroundColor: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(3px)" }}
      >
        {/* Card */}
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full"
          style={{ maxWidth: "440px", margin: "16px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-slate-800 tracking-tight">
                New Trigger Event
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Set a trigger time and repeat days
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            {/* Start Time */}
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                Trigger Time
              </label>
              <TimePicker
                label="Start Time"
                value={startTime}
                onChange={setStartTime}
                ampm={true}
                sx={timePickerSx}
              />
            </div>

            {/* Days */}
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                Repeat Days
              </label>
              <div className="flex flex-wrap gap-2">
                {daysList.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                      days.includes(d)
                        ? "bg-blue-500 border-blue-500 text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaveDisabled}
              className={`cursor-pointer px-5 py-2 text-sm font-semibold rounded-lg transition-colors shadow-sm ${
                isSaveDisabled
                  ? "bg-blue-300 text-white cursor-not-allowed opacity-70"
                  : "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
              }`}
            >
              {isLoading ? "Saving..." : "Save Event"}
            </button>
          </div>
        </div>
      </div>
    </LocalizationProvider>,
    document.body
  );
};

export default TriggerEventModal;
