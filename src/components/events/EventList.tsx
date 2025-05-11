import type { Event } from '@/types';
import { EventCard } from './EventCard';

interface EventListProps {
  events: Event[];
}

export function EventList({ events }: EventListProps) {
  if (!events || events.length === 0) {
    return <p className="text-center text-muted-foreground">No events found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
