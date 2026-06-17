import { useState, useRef, useEffect } from "react";

export default function VersionsDropdown({ versions = [], currentVersion, onVersionSelect, loadingVersions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="mb-4 relative" ref={ref}>
      <label className="block text-sm font-medium text-gray-700 mb-2">Version ID</label>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-md
                   focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        disabled={loadingVersions}
      >
        <span className="truncate">{currentVersion || (loadingVersions ? "Loading versions..." : "Select version")}</span>
        <svg className={`w-4 h-4 ml-2 transform ${open ? "rotate-180" : "rotate-0"}`} viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    {/* Versions */}
      {open && (
        <ul
          role="listbox"
          tabIndex={-1}
          className="absolute z-20 mt-1 left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg
                     max-h-40 overflow-y-auto divide-y divide-gray-100"
        >
          {loadingVersions ? (
            <li className="p-2">Loading versions...</li>
          ) : versions.length === 0 ? (
            <li className="p-2">No versions available</li>
          ) : (
            versions.map((version) => (
              <li
                key={version}
                role="option"
                aria-selected={version === currentVersion}
                className={`p-2 cursor-pointer hover:bg-gray-100 truncate ${version === currentVersion ? "font-semibold" : ""}`}
                onClick={() => {
                  onVersionSelect && onVersionSelect(version);
                  setOpen(false);
                }}
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
