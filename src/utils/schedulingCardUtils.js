/** Open create-event flow: select card, then signal VenueDetailsPanel to open the modal. */
export function handleCreateEventPlusClick(e, onCardSelect, onCreateEventClick) {
  e.stopPropagation();
  onCardSelect?.();
  onCreateEventClick?.();
}
