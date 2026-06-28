/** Open create-event flow: select card, then signal VenueDetailsPanel to open the modal. */
export function handleCreateEventPlusClick(e, onCardSelect, onCreateEventClick) {
  e.stopPropagation();
  onCardSelect?.();
  onCreateEventClick?.();
}

/** UTC HH:MM → local 12-hour time for scheduling alerts. */
export function convertUTCToLocal(utcTimeString) {
  if (!utcTimeString) return utcTimeString;

  try {
    const [hours, minutes] = utcTimeString.split(":").map(Number);
    const utcDate = new Date();
    utcDate.setUTCHours(hours, minutes, 0, 0);

    let localHours = utcDate.getHours();
    const localMinutes = utcDate.getMinutes();
    const period = localHours >= 12 ? "PM" : "AM";
    localHours = localHours % 12 || 12;

    return `${localHours}:${String(localMinutes).padStart(2, "0")} ${period}`;
  } catch {
    return utcTimeString;
  }
}
