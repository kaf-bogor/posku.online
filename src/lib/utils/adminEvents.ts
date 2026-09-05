import type { EventItem } from '~/lib/types/event';

export type EventAdminStatus = 'upcoming' | 'active' | 'past' | 'hidden';
export type EventStatusFilter = 'all' | EventAdminStatus;

export interface EventStatusView {
  label: string;
  color: 'blue' | 'green' | 'orange' | 'gray';
}

export function getEventStatus(event: EventItem): EventStatusView {
  const now = new Date();
  if (!event.isActive) {
    return { label: 'Disembunyikan', color: 'gray' };
  }
  if (new Date(event.startDate) > now) {
    return { label: 'Akan datang', color: 'blue' };
  }
  if (new Date(event.endDate) < now) {
    return { label: 'Selesai', color: 'orange' };
  }
  return { label: 'Berlangsung', color: 'green' };
}

export function filterEvents(
  events: EventItem[],
  query: string,
  statusFilter: EventStatusFilter
): EventItem[] {
  const q = query.trim().toLowerCase();
  const now = new Date();

  return events.filter((event) => {
    const matchQ =
      !q ||
      event.title.toLowerCase().includes(q) ||
      (event.location ?? '').toLowerCase().includes(q);
    if (!matchQ) return false;

    switch (statusFilter) {
      case 'upcoming':
        return event.isActive && new Date(event.startDate) > now;
      case 'active':
        return (
          event.isActive &&
          new Date(event.startDate) <= now &&
          new Date(event.endDate) >= now
        );
      case 'past':
        return new Date(event.endDate) < now;
      case 'hidden':
        return !event.isActive;
      default:
        return true;
    }
  });
}
