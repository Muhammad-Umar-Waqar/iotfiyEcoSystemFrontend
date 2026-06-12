export const hasCollision = (events, newEvent) => {
  return events.some((event) => {

    const sameDay = event.days.some(d =>
      newEvent.days.includes(d)
    );

    if (!sameDay) return false;

    return (
      newEvent.start < event.end &&
      newEvent.end > event.start
    );
  });
};