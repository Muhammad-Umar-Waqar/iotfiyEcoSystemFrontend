// VenueSelect - Manager and User role support
// Manager: Fetch venues from API
// User: Filter venues from Redux auth state
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

export default function VenueSelect({ organizationId, value, onChange, className = "", externalLabel }) {
  const { user, token } = useSelector((state) => state.auth);

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(value ?? "");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setSelected(value ?? "");
  }, [value]);

  useEffect(() => {
    const onUpdated = () => setReloadKey((k) => k + 1);
    window.addEventListener("venue:updated", onUpdated);
    return () => window.removeEventListener("venue:updated", onUpdated);
  }, []);

  useEffect(() => {
    if (!organizationId) {
      setVenues([]);
      setSelected("");
      setError(null);
      return;
    }

    // For user role: filter venues from auth state (no API call)
    if (user?.role === "user" && user?.venues) {
      try {
        setLoading(true);
        setError(null);

        // Filter venues by selected organization
        const userVenues = user.venues.filter(
          (v) => v.organization?.id === organizationId || v.organization?._id === organizationId
        );

        // Transform to consistent format
        const arr = userVenues.map((v) => ({
          _id: v.venueId,
          id: v.venueId,
          venueId: v.venueId,
          name: v.venueName,
          venueName: v.venueName,
          venue_name: v.venueName,
          organization: v.organization?.id || v.organization?._id,
          organizationName: v.organization?.name,
        }));

        setVenues(arr);

        // If parent already provided a non-empty value (URL-driven), keep it
        if (value && String(value).trim() !== "") {
          setSelected(value);
          setLoading(false);
          return;
        }

        // Auto-select first venue if no value
        if (!value && arr.length > 0) {
          const firstId = String(arr[0]._id ?? arr[0].id ?? arr[0].venueId);
          setSelected(firstId);
          if (typeof onChange === "function") onChange(firstId, arr[0].name);
        }
      } catch (err) {
        console.error("Venue filter error:", err);
        setError(err.message || "Failed to filter venues");
        setVenues([]);
        setSelected("");
      } finally {
        setLoading(false);
      }
      return;
    }

    // For manager role: fetch from API
    const abortCtrl = new AbortController();
    const fetchVenues = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `${BASE}/venue/get-by-org/${organizationId}`;

        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: abortCtrl.signal,
        });

        const data = await res.json();
        if (!res.ok) {
          const message = data?.message || "Failed to fetch venues";
          setVenues([]);
          setSelected("");
          setError(message);
          setLoading(false);
          return;
        }

        const arr = Array.isArray(data) ? data : Array.isArray(data?.venues) ? data.venues : [];

        setVenues(arr);

        // If parent already provided a non-empty value (URL-driven), keep it
        if (value && String(value).trim() !== "") {
          setSelected(value);
          setLoading(false);
          return;
        }

        // Auto-select first venue if no value
        if (!value && arr.length > 0) {
          const firstId = String(arr[0]._id ?? arr[0].id ?? arr[0].venueId);
          setSelected(firstId);
          if (typeof onChange === "function") onChange(firstId, arr[0].name ?? arr[0].venueName);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Venue fetch error:", err);
        setError(err.message || "Network error");
        setVenues([]);
        setSelected("");
      } finally {
        if (!abortCtrl.signal.aborted) setLoading(false);
      }
    };

    fetchVenues();
    return () => abortCtrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, user, reloadKey]);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSelect = (id, name) => {
    setSelected(String(id));
    if (typeof onChange === "function") onChange(String(id), name);
    setDropdownOpen(false);
  };

  const handleKeyboard = (e) => {
    if (e.key === "Enter") setDropdownOpen((s) => !s);
    if (e.key === "Escape") setDropdownOpen(false);
  };

  const selectedVenue = venues.find((v) => String(v._id ?? v.id ?? v) === String(selected));

  // show readable name when available; otherwise use externalLabel or id
  const label = loading
    ? "Loading venues..."
    : selectedVenue
    ? selectedVenue.name ?? selectedVenue.venueName ?? String(selected)
    : externalLabel
    ? externalLabel
    : selected
    ? String(selected)
    : "Venue";

  return (
    <div className={className} ref={ref}>
      <div className="grid grid-cols-2 items-center gap-4 sm:w-[14rem] md:w-[10rem] lg:w-[15rem] xl:w-[20rem]">
        <div className="relative col-span-2 ">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyboard}
            onClick={() => !loading && organizationId && setDropdownOpen((s) => !s)}
            className={`sm:rounded-full flex items-center justify-between pr-2 pl-3 py-2 border cursor-pointer bg-[#0D5CA4] text-white select-none  rounded-full`}
          >
            <span className="text-white truncate w-[90%] sm:max-w-[70%]">{label}</span>
            <svg className={`w-6 h-6 ml-2 bg-white rounded-full p-[2px] transform ${dropdownOpen ? "rotate-180" : "rotate-0"}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10c-.7 0-1 .8-.5 1.3l4.3 4.3c.7.7 1.9.7 2.6 0l4.3-4.3c.5-.5.2-1.3-.5-1.3H7z" fill="#0D5CA4" stroke="#0D5CA4" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>

          {dropdownOpen && (
            <div className=" absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-3 text-sm text-gray-500">Loading venues...</div>
              ) : venues && venues.length > 0 ? (
                venues.map((v) => {
                  const id = String(v._id ?? v.id ?? v);
                  const name = v.name ?? v.venue_name ?? v.venueName ?? id;
                  return (
                    <div
                      key={id}
                      onClick={() => handleSelect(id, name)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm flex items-center justify-between ${String(selected) === id ? "bg-gray-50" : ""}`}
                    >
                      <div className="truncate">{name}</div>
                      {String(selected) === id && (
                        <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">No venues found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
