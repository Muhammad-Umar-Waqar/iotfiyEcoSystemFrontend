import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "iotifiy:org-venue";

const defaultValue = { organization: null, venue: null }; // organization: {id,name}, venue: {id,name}

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readInitial() {
  // Prefer localStorage (shared across tabs). If local missing but session has it, migrate.
  const localRaw = localStorage.getItem(STORAGE_KEY);
  if (localRaw) {
    const parsed = safeParse(localRaw);
    return parsed ?? defaultValue;
  }
  const sessRaw = sessionStorage.getItem(STORAGE_KEY);
  const sessParsed = safeParse(sessRaw);
  if (sessParsed) {
    // migrate to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessParsed));
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("OrgVenueContext: migration to localStorage failed", err);
    }
    return sessParsed;
  }
  return defaultValue;
}

const OrgVenueContext = createContext(null);

export function OrgVenueProvider({ children }) {
  const [state, setState] = useState(() => readInitial());

  // persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn("OrgVenueContext: failed to write localStorage", err);
    }
  }, [state]);

  // listen to storage events from other tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;
      const newVal = e.newValue ? safeParse(e.newValue) : defaultValue;
      if (!newVal) return;
      // update local state to match other tab
      setState(newVal);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // helpers to normalise id/name shapes
  const normalizeOrg = (o) => {
    if (!o) return null;
    const id = String(o.id ?? o._id ?? o);
    const name = o.name ?? o.organization_name ?? o.label ?? o.title ?? null;
    return { id, name };
  };

  const normalizeVenue = (v) => {
    if (!v) return null;
    const id = String(v.id ?? v._id ?? v.venueId ?? v);
    const name = v.name ?? v.venueName ?? v.venue_name ?? v.title ?? v.label ?? null;
    return { id, name };
  };

  // set organization; if org changes, clear venue automatically
  const setOrganization = useCallback((orgOrIdOrNull) => {
    setState((prev) => {
      if (!orgOrIdOrNull) {
      return { organization: null, venue: null };
    }
      const newOrg = normalizeOrg(orgOrIdOrNull);
      const orgChanged = prev.organization && newOrg && prev.organization.id !== newOrg.id;
      return {
        organization: newOrg,
        venue: orgChanged ? null : prev.venue,
      };
    });
  }, []);

  // set venue; does not change organization
  const setVenue = useCallback((venueOrIdOrNull) => {
    setState((prev) => {
      const newVenue = normalizeVenue(venueOrIdOrNull);
      return {
        ...prev,
        venue: newVenue,
      };
    });
  }, []);

  const clearOrganization = useCallback(() => {
    setState({ organization: null, venue: null });
  }, []);

  const clearVenue = useCallback(() => {
    setState((prev) => ({ ...prev, venue: null }));
  }, []);

  return (
    <OrgVenueContext.Provider
      value={{
        organization: state.organization,
        venue: state.venue,
        setOrganization,
        setVenue,
        clearOrganization,
        clearVenue,
      }}
    >
      {children}
    </OrgVenueContext.Provider>
  );
}

export function useOrgVenue() {
  const ctx = useContext(OrgVenueContext);
  if (!ctx) {
    throw new Error("useOrgVenue must be used inside OrgVenueProvider");
  }
  return ctx;
}
