// import { useState, useRef, useEffect } from "react";

// export default function VersionsDropdown({ versions = [], currentVersion, onVersionSelect, loadingVersions }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef();

//   useEffect(() => {
//     function onClick(e) {
//       if (ref.current && !ref.current.contains(e.target)) setOpen(false);
//     }
//     document.addEventListener("click", onClick);
//     return () => document.removeEventListener("click", onClick);
//   }, []);

//   return (
//     <div className="mb-4 relative" ref={ref}>
//       <label className="block text-sm font-medium text-gray-700 mb-2">Version ID</label>

//       <button
//         type="button"
//         aria-haspopup="listbox"
//         aria-expanded={open}
//         onClick={() => setOpen((v) => !v)}
//         className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-md
//                    focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//         disabled={loadingVersions}
//       >
//         <span className="truncate">{currentVersion || (loadingVersions ? "Loading versions..." : "Select version")}</span>
//         <svg className={`w-4 h-4 ml-2 transform ${open ? "rotate-180" : "rotate-0"}`} viewBox="0 0 24 24" fill="none">
//           <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//         </svg>
//       </button>
//     {/* Versions */}
//       {open && (
//         <ul
//           role="listbox"
//           tabIndex={-1}
//           className="absolute z-20 mt-1 left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg
//                      max-h-40 overflow-y-auto divide-y divide-gray-100"
//         >
//           {loadingVersions ? (
//             <li className="p-2">Loading versions...</li>
//           ) : versions.length === 0 ? (
//             <li className="p-2">No versions available</li>
//           ) : (
//             versions.map((version) => (
//               <li
//                 key={version}
//                 role="option"
//                 aria-selected={version === currentVersion}
//                 className={`p-2 cursor-pointer hover:bg-gray-100 truncate ${version === currentVersion ? "font-semibold" : ""}`}
//                 onClick={() => {
//                   onVersionSelect && onVersionSelect(version);
//                   setOpen(false);
//                 }}
//               >
//                 {version}
//               </li>
//             ))
//           )}
//         </ul>
//       )}
//     </div>
//   );
// }






// src/components/ota/VersionDropDown.jsx
// UI RESKIN ONLY — zero logic changes
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Tag } from "lucide-react";

export default function VersionsDropdown({ versions = [], currentVersion, onVersionSelect, loadingVersions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // ── unchanged: click-outside handler ──────────────────────
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const displayLabel = currentVersion
    ? currentVersion
    : loadingVersions
    ? "Loading versions…"
    : "Select version";

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        Version ID
      </label>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={loadingVersions}
        onClick={() => setOpen((v) => !v)}
        className={`
          w-full flex items-center justify-between gap-2
          px-3 py-2 rounded-lg border text-sm
          bg-white text-slate-700 transition-colors
          focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400
          disabled:opacity-50 disabled:cursor-not-allowed
          ${open ? "border-indigo-400 ring-2 ring-indigo-200" : "border-slate-200 hover:border-slate-300"}
        `}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Tag size={13} className="text-slate-400 shrink-0" />
          <span className="truncate">{displayLabel}</span>
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-400 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          tabIndex={-1}
          className="absolute z-20 mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg max-h-44 overflow-y-auto divide-y divide-slate-100"
        >
          {loadingVersions ? (
            <li className="px-3 py-2.5 text-sm text-slate-400">Loading versions…</li>
          ) : versions.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-slate-400">No versions available</li>
          ) : (
            versions.map((version) => (
              <li
                key={version}
                role="option"
                aria-selected={version === currentVersion}
                onClick={() => { onVersionSelect && onVersionSelect(version); setOpen(false); }}
                className={`
                  px-3 py-2.5 cursor-pointer text-sm transition-colors
                  hover:bg-indigo-50 hover:text-indigo-700
                  ${version === currentVersion
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-slate-700"}
                `}
              >
                {version}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}