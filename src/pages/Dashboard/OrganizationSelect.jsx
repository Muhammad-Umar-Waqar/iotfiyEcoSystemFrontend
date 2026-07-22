
// Code for peresistency in Dashboard for Url and page not change on reload for selected org and venue assuring all cases for Admin, Manager, User
// src/pages/OrganizationSelect.jsx (or wherever file is)
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrganizationsByOwner, fetchOrganizationsByUser } from "../../slices/OrganizationSlice";

export default function OrganizationSelect({
  value = "",
  onChange,
  className = "",
  disableAutoSelect = false,
  externalLabel, // NEW optional label to show while org list loads
}) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { Organizations = [], isLoading: orgLoading } = useSelector((s) => s.Organization || {});

  const [selected, setSelected] = useState(value ?? "");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    // Fetch organizations based on role
    if (user.role === "manager") {
      dispatch(fetchOrganizationsByOwner(user.id));
    } else if (user.role === "user") {
      dispatch(fetchOrganizationsByUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (disableAutoSelect) return;
    if ((!selected || selected === "") && Organizations && Organizations.length > 0) {
      const firstOrg = Organizations[0];
      const id = String(firstOrg._id ?? firstOrg.id ?? firstOrg);
      setSelected(id);
      if (typeof onChange === "function") onChange(id, firstOrg.name ?? firstOrg.organization_name ?? undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Organizations, disableAutoSelect]);

  useEffect(() => {
    if (value !== undefined && value !== selected) setSelected(value);
  }, [value]);

  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSelect = (orgId, orgName) => {
    setSelected(String(orgId));
    if (typeof onChange === "function") onChange(String(orgId), orgName);
    setDropdownOpen(false);
  };

  const selectedOrg = Organizations.find((o) => String(o._id ?? o.id ?? o) === String(selected));
  const selectedLabel = orgLoading
    ? "Loading orgs..."
    : selectedOrg
    ? selectedOrg.name ?? selectedOrg.organization_name ?? String(selected)
    : externalLabel
    ? externalLabel
    : "Select organization";

  return (
    <div className={`${className}`} ref={containerRef}>
      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 ml-2 md:ml-auto">
        <div className="relative col-span-2">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setDropdownOpen((s) => !s)}
            onClick={() => !orgLoading && setDropdownOpen((s) => !s)}
            className={`sm:rounded-full flex items-center justify-between px-4 py-2 border cursor-pointer bg-white select-none ${selectedOrg ? "rounded-full" : "rounded-xl"}`}
            style={{ borderColor: "color-mix(in srgb, var(--eco-primary) 45%, #E2E8F0)" }}
          >
            <span className="text-sm truncate w-[90%] sm:max-w-[70%] font-medium font-bold" style={{ color: "var(--eco-primary)" }}>{selectedLabel}</span>
            <svg className={`w-4 h-4 text-gray-500 ml-2 transform ${dropdownOpen ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>

          {dropdownOpen && (
            <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
              {orgLoading ? (
                <div className="px-4 py-3 text-sm text-gray-500">Loading orgs...</div>
              ) : Organizations && Organizations.length > 0 ? (
                Organizations.map((org) => {
                  const id = String(org._id ?? org.id ?? org);
                  const name = org.name ?? org.organization_name ?? id;
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
                <div className="px-4 py-3 text-sm text-gray-500">No organizations available</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
