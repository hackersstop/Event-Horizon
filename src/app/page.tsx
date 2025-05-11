
import { EventList } from '@/components/events/EventList';
import type { Event } from '@/types';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { siteConfig } from '@/config/site';

async function getEvents(): Promise<Event[]> {
  try {
    const eventsCol = collection(db, 'events');
    // Order by date, assuming 'date' is stored in a way that Firestore can sort, e.g., YYYY-MM-DD string
    // Or by 'createdAt' if you want to sort by creation time
    const q = query(eventsCol, orderBy('date', 'asc')); // Or orderBy('createdAt', 'desc')
    const eventSnapshot = await getDocs(q);
    const eventList = eventSnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        // Ensure date fields are correctly formatted if they are Timestamps
        // For this app, 'date' is a string, 'createdAt' would be a Timestamp
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as Event;
    });
    return eventList;
  } catch (error) {
    console.error("Error fetching events: ", error);
    return [];
  }
}

export default async function HomePage() {
  const events = await getEvents();

  return (
    <div className="space-y-8">
      <section className="text-center py-12 rounded-xl">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Welcome to <span className="block sm:inline bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{siteConfig.name}</span>
        </h1>
      </section>
      
      <section>
        <h2 className="text-3xl font-semibold mb-6 border-b-2 border-primary pb-2">Upcoming Events</h2>
        {events.length > 0 ? (
          <EventList events={events} />
        ) : (
          <p className="text-center text-muted-foreground py-10">No events available at the moment. Please check back later!</p>
        )}
      </section>
    </div>
  );
}

