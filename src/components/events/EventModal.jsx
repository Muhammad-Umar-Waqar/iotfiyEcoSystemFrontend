// //FaRaZ
// import { useState } from "react";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { TimePicker } from "@mui/x-date-pickers/TimePicker";
// import { X } from "lucide-react";
// import dayjs from "dayjs";

// const daysList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// const EventModal = ({ open, onClose, onSave }) => {
//   const [start, setStart] = useState(null);
//   const [end, setEnd] = useState(null);
//   const [command, setCommand] = useState("ON");
//   const [days, setDays] = useState([]);

//   if (!open) return null;

//   const toggleDay = (day) => {
//     setDays((prev) =>
//       prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
//     );
//   };

//   // const handleSave = () => {
//   //   onSave({
//   //     id: crypto.randomUUID(),
//   //     start: start ? start.format("HH:mm") : "",
//   //     end: end ? end.format("HH:mm") : "",
//   //     command,
//   //     days,
//   //     enabled: true,
//   //   });
//   //   onClose();
//   // };


//   const handleSave = () => {
//   if (!start || !end) return;

//   // duration in minutes
//   let duration = end.diff(start, "minute");

//   // handle overnight events (e.g. 23:00 → 02:00)
//   if (duration < 0) {
//     duration += 24 * 60;
//   }

//   onSave({
//     id: crypto.randomUUID(),
//     start: start.format("HH:mm"),
//     end: end.format("HH:mm"),
//     duration, // ⭐ IMPORTANT
//     command,
//     days,
//     enabled: true,
//   });

//   onClose();
// };

//   const timePickerSx = {
//     width: "100%",
//     "& .MuiOutlinedInput-root": {
//       borderRadius: "10px",
//       backgroundColor: "#F8FAFC",
//       fontSize: "0.9rem",
//       "& fieldset": { borderColor: "#E2E8F0" },
//       "&:hover fieldset": { borderColor: "#94A3B8" },
//       "&.Mui-focused fieldset": { borderColor: "#3B82F6", borderWidth: "1.5px" },
//     },
//     "& .MuiInputLabel-root": { fontSize: "0.85rem", color: "#64748B" },
//     "& .MuiInputLabel-root.Mui-focused": { color: "#3B82F6" },
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       {/* Backdrop */}
//       <div
//         className="fixed inset-0 z-50 flex items-center justify-center"
//         style={{ backgroundColor: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(3px)" }}
//       >
//         {/* Card */}
//         <div
//           className="relative bg-white rounded-2xl shadow-2xl w-full"
//           style={{ maxWidth: "440px", margin: "16px" }}
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
//             <div>
//               <h2 className="text-base font-semibold text-slate-800 tracking-tight">
//                 New Schedule Event
//               </h2>
//               <p className="text-xs text-slate-400 mt-0.5">
//                 Set a time range and repeat days
//               </p>
//             </div>
//             <button
//               onClick={onClose}
//               className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
//             >
//               <X size={15} />
//             </button>
//           </div>

//           {/* Body */}
//           <div className="px-6 py-5 space-y-5">

//             {/* Time Row */}
//             <div>
//               <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
//                 Time Range
//               </label>
//               <div className="flex items-center gap-3">
//                 <TimePicker
//                   label="Start"
//                   value={start}
//                   onChange={setStart}
//                   ampm={false}
//                   sx={timePickerSx}
//                 />
//                 <div className="text-slate-300 font-light text-lg flex-shrink-0">→</div>
//                 <TimePicker
//                   label="End"
//                   value={end}
//                   onChange={setEnd}
//                   ampm={false}
//                   sx={timePickerSx}
//                 />
//               </div>
//             </div>

//             {/* Days */}
//             <div>
//               <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
//                 Repeat Days
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {daysList.map((d) => (
//                   <button
//                     key={d}
//                     onClick={() => toggleDay(d)}
//                     className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
//                       days.includes(d)
//                         ? "bg-blue-500 border-blue-500 text-white shadow-sm"
//                         : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
//                     }`}
//                   >
//                     {d}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Command */}
//             <div>
//               <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
//                 Command
//               </label>
//               <div
//                 className="flex rounded-xl border border-slate-200 overflow-hidden"
//                 style={{ width: "fit-content" }}
//               >
//                 {["ON", "OFF"].map((cmd) => (
//                   <button
//                     key={cmd}
//                     onClick={() => setCommand(cmd)}
//                     className={`px-6 py-2 text-sm font-semibold transition-all duration-150 ${
//                       command === cmd
//                         ? cmd === "ON"
//                           ? "bg-emerald-500 text-white"
//                           : "bg-red-500 text-white"
//                         : "bg-white text-slate-400 hover:bg-slate-50"
//                     }`}
//                   >
//                     {cmd}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-2 border-t border-slate-100">
//             <button
//               onClick={onClose}
//               className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSave}
//               className="cursor-pointer  px-5 py-2 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors shadow-sm"
//             >
//               Save Event
//             </button>
//           </div>
//         </div>
//       </div>
//     </LocalizationProvider>
//   );
// };

// export default EventModal;


import { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { X } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Swal from "sweetalert2";
dayjs.extend(utc);

const daysList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const EventModal = ({ open, onClose, onSave, deviceType = null }) => {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [days, setDays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [command, setCommand] = useState("ON");
  const [setTemperature, setSetTemperature] = useState(26);

  const isAc = deviceType === "AC";

  if (!open) return null;

  const toggleDay = (day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const isSaveDisabled =
    isLoading ||
    !start ||
    !end ||
    days.length === 0 ||
    (isAc && command === "ON" && !Number.isFinite(Number(setTemperature)));

  // const handleSave = () => {
  //   if (!start || !end) return;

  //   // duration in minutes
  //   let duration = end.diff(start, "minute");

  //   // handle overnight events (e.g. 23:00 → 02:00)
  //   if (duration < 0) {
  //     duration += 24 * 60;
  //   }

  //   onSave({
  //     id: crypto.randomUUID(),
  //     start: start.format("HH:mm"),
  //     end: end.format("HH:mm"),
  //     duration,
  //     days,
  //     enabled: true,
  //   });

  //   onClose();
  // };

  //FaRaZ
  // const handleSave = async () => {
  //   if (isSaveDisabled) return;

  //   setIsLoading(true);
    
  //   if (!start || !end) {
  //     return Swal.fire({
  //       icon: "warning",
  //       title: "Missing Time",
  //       text: "Please select both start and end time",
  //     });
  //   }

  //   if (days.length === 0) {
  //     return Swal.fire({
  //       icon: "warning",
  //       title: "No Days Selected",
  //       text: "Please select at least one day",
  //     });
  //   }

  //   // Check same time
  //   if (start.isSame(end)) {
  //     return Swal.fire({
  //       icon: "warning",
  //       title: "Invalid Time",
  //       text: "Start and End time cannot be the same",
  //     });
  //   }

  //   try {
  //     // ✅ Convert LOCAL → UTC
  //     const startUTC = start.local().utc().format("HH:mm");
  //     const endUTC = end.local().utc().format("HH:mm");


  //     console.log("Local:", start.format("HH:mm"));
  //     console.log("UTC:", start.utc().format("HH:mm"));
  //     console.log("Offset:", start.utcOffset());

  //     // Convert days → backend format
  //     const fullDaysMap = {
  //       Mon: "monday",
  //       Tue: "tuesday",
  //       Wed: "wednesday",
  //       Thu: "thursday",
  //       Fri: "friday",
  //       Sat: "saturday",
  //       Sun: "sunday",
  //     };

  //     const formattedDays = days.map((d) => fullDaysMap[d]);

  //     console.log("Saving Event:", { startUTC, endUTC, days: formattedDays });

  //     await onSave({
  //       startTime: startUTC,
  //       endTime: endUTC,
  //       days: formattedDays,
  //     });

  //     onClose();

  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSave = async () => {
  if (isSaveDisabled) return;
  setIsLoading(true);

  if (start.isSame(end)) {
    setIsLoading(false);
    return Swal.fire({
      icon: "warning",
      title: "Invalid Time",
      text: "Start and End time cannot be the same",
    });
  }

  try {
    // ── 1. Convert HH:mm to UTC ──────────────────────────────────────────
    const startUTC = start.utc().format("HH:mm");
    const endUTC   = end.utc().format("HH:mm");

    // ── 2. Calculate day shift caused by UTC conversion ───────────────────
    // Compare local weekday vs UTC weekday for the start time.
    // dayjs .day() returns 0 (Sun) … 6 (Sat).
    const localDayIndex = start.day();       // e.g. Thursday = 4
    const utcDayIndex   = start.utc().day(); // e.g. Wednesday = 3 (PKT +5, 3am → 10pm prev day)

    // Raw difference: -1 means UTC rolled back one day, +1 means rolled forward.
    // Handle the Sun(0) ↔ Sat(6) wraparound with modular arithmetic.
    let dayShift = utcDayIndex - localDayIndex; // e.g. 3 - 4 = -1
    if (dayShift > 1)  dayShift = -1; // e.g. Sat(6) local → Sun(0) UTC
    if (dayShift < -1) dayShift = 1;  // e.g. Sun(0) local → Sat(6) UTC

    // ── 3. Full day name maps ─────────────────────────────────────────────
    const shortToIndex = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    };
    const indexToFull = {
      0: "sunday", 1: "monday", 2: "tuesday", 3: "wednesday",
      4: "thursday", 5: "friday", 6: "saturday",
    };

    // ── 4. Shift each selected day ────────────────────────────────────────
    const formattedDays = days.map((d) => {
      const shifted = (shortToIndex[d] + dayShift + 7) % 7; // +7 prevents negative modulo
      return indexToFull[shifted];
    });

    console.log("Local start :", start.format("ddd HH:mm"));
    console.log("UTC start   :", start.utc().format("ddd HH:mm"));
    console.log("Day shift   :", dayShift);
    console.log("Payload     :", { startUTC, endUTC, days: formattedDays });

    await onSave({
      startTime: startUTC,
      endTime:   endUTC,
      days:      formattedDays,
      ...(isAc
        ? {
            command,
            setTemperature: command === "ON" ? Number(setTemperature) : undefined,
          }
        : {}),
    });

    onClose();
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Failed", text: "Could not create event" });
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
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
                New Schedule Event
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Set a time range and repeat days
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

            {/* Time Row */}
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                Time Range
              </label>
              <div className="flex items-center gap-3">
                <TimePicker
                  label="Start"
                  value={start}
                  onChange={setStart}
                  ampm={true}
                  sx={timePickerSx}
                />
                <div className="text-slate-300 font-light text-lg flex-shrink-0">→</div>
                <TimePicker
                  label="End"
                  value={end}
                  onChange={setEnd}
                  ampm={true}
                  sx={timePickerSx}
                />
              </div>
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
                    className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${days.includes(d)
                      ? "bg-blue-500 border-blue-500 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* AC-only: command ON/OFF + setpoint */}
            {isAc && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                    Command
                  </label>
                  <div className="flex rounded-xl border border-slate-200 overflow-hidden w-fit">
                    {["ON", "OFF"].map((cmd) => (
                      <button
                        key={cmd}
                        type="button"
                        onClick={() => setCommand(cmd)}
                        className={`px-6 py-2 text-sm font-semibold transition-all ${
                          command === cmd
                            ? cmd === "ON"
                              ? "bg-emerald-500 text-white"
                              : "bg-rose-500 text-white"
                            : "bg-white text-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        {cmd}
                      </button>
                    ))}
                  </div>
                </div>

                {command === "ON" && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                      Set Temperature (°C)
                    </label>
                    <input
                      type="number"
                      min={16}
                      max={30}
                      value={setTemperature}
                      onChange={(e) => setSetTemperature(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Range 16–30°C</p>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            {/* <button
              onClick={handleSave}
              className="cursor-pointer  px-5 py-2 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors shadow-sm"
            >
              Save Event */}

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
    </LocalizationProvider>
  );
};

export default EventModal;