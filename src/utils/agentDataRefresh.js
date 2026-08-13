import {
  fetchOrganizationsByOwner,
  fetchOrganizationsByUser,
} from "../slices/OrganizationSlice";
import { fetchVenuesByOrganization } from "../slices/VenueSlice";
import { fetchDevicesByVenue } from "../slices/DeviceSlice";
import { fetchSubUsers } from "../slices/UserSlice";

const ORG_VENUE_STORAGE_KEY = "iotifiy:org-venue";

function normalizeEntityId(value) {
  if (value == null || value === "") return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{") || trimmed.includes("ObjectId(")) return null;
    return trimmed;
  }
  if (typeof value === "object") {
    if (value._id != null) return String(value._id);
    if (value.id != null) return String(value.id);
  }
  const asString = String(value);
  if (asString.startsWith("{") || asString.includes("ObjectId(")) return null;
  return asString;
}

function readOrgVenueSelection() {
  try {
    const raw = localStorage.getItem(ORG_VENUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Refetch Redux lists after agent CRUD (same data manual forms update).
 * scopes: organizations | venues | devices | users
 * hints: { organizationId?, organizationIds?, venueId?, venueIds?, previousVenueId? }
 */
export function dispatchAgentDataRefresh(
  dispatch,
  getState,
  { scopes = [], hints = {} } = {}
) {
  if (!dispatch || !Array.isArray(scopes) || scopes.length === 0) return;

  const state = typeof getState === "function" ? getState() : {};
  const user = state.auth?.user;
  if (!user?.id) return;

  const uniqueScopes = [...new Set(scopes)];
  const selection = readOrgVenueSelection();
  const fallbackOrgId = normalizeEntityId(
    hints.organizationId ||
      selection?.organization?.id ||
      selection?.organization?._id ||
      selection?.organization
  );
  const fallbackVenueId = normalizeEntityId(
    hints.venueId ||
      selection?.venue?.id ||
      selection?.venue?._id ||
      selection?.venue
  );

  // Venue org-move needs BOTH old + new org lists (same as Edit Venue UI)
  const organizationIds = [];
  const pushOrgId = (raw) => {
    const id = normalizeEntityId(raw);
    if (id && !organizationIds.includes(id)) organizationIds.push(id);
  };
  pushOrgId(hints.organizationId);
  pushOrgId(hints.previousOrganizationId);
  if (Array.isArray(hints.organizationIds)) {
    for (const id of hints.organizationIds) pushOrgId(id);
  }
  pushOrgId(fallbackOrgId);

  // Device venue-move needs BOTH old + new venue device lists
  const venueIds = [];
  const pushVenueId = (raw) => {
    const id = normalizeEntityId(raw);
    if (id && !venueIds.includes(id)) venueIds.push(id);
  };
  pushVenueId(hints.venueId);
  pushVenueId(hints.previousVenueId);
  if (Array.isArray(hints.venueIds)) {
    for (const id of hints.venueIds) pushVenueId(id);
  }
  pushVenueId(fallbackVenueId);

  if (uniqueScopes.includes("organizations")) {
    if (user.role === "manager") {
      dispatch(fetchOrganizationsByOwner(user.id));
    } else if (user.role === "user") {
      dispatch(fetchOrganizationsByUser());
    }
  }

  if (uniqueScopes.includes("venues")) {
    if (organizationIds.length) {
      for (const id of organizationIds) {
        dispatch(fetchVenuesByOrganization(id));
      }
    } else if (user.role === "manager") {
      const orgs = state.Organization?.Organizations || [];
      for (const org of orgs) {
        const id = normalizeEntityId(org._id || org.id);
        if (id) dispatch(fetchVenuesByOrganization(id));
      }
    }
  }

  if (uniqueScopes.includes("devices")) {
    for (const id of venueIds) {
      dispatch(fetchDevicesByVenue(id));
    }
  }

  if (uniqueScopes.includes("users") && user.role === "manager") {
    dispatch(fetchSubUsers(user.id));
  }

  window.dispatchEvent(
    new CustomEvent("eco:agent-data-changed", {
      detail: { scopes: uniqueScopes, hints },
    })
  );

  // VenueList already listens for this (manual Edit Venue uses it too)
  if (uniqueScopes.includes("venues")) {
    window.dispatchEvent(new Event("venue:updated"));
  }
}
