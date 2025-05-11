import { EventList } from '@/components/events/EventList';
import type { Event } from '@/types';

// Mock data for events - in a real app, this would come from Firestore
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Summer Music Festival',
    description: 'Join us for an unforgettable weekend of music, art, and fun under the sun. Featuring top artists from around the globe!',
    location: 'Sunset Valley Park',
    date: '2024-08-15',
    time: '14:00',
    amount: 75,
    offerAmount: 60,
    imageUrl: 'https://picsum.photos/seed/musicfest/600/400',
  },
  {
    id: '2',
    title: 'Tech Innovators Conference',
    description: 'A premier conference for tech enthusiasts, developers, and entrepreneurs. Discover the latest trends and network with industry leaders.',
    location: 'Grand Convention Center',
    date: '2024-09-10',
    time: '09:00',
    amount: 199,
    imageUrl: 'https://picsum.photos/seed/techconf/600/400',
  },
  {
    id: '3',
    title: 'Art & Design Expo',
    description: 'Explore stunning artworks and innovative designs from emerging and established artists. Workshops and live demonstrations available.',
    location: 'City Art Gallery',
    date: '2024-10-05',
    time: '10:00',
    amount: 25,
    offerAmount: 20,
    imageUrl: 'https://picsum.photos/seed/artexpo/600/400',
  },
    {
    id: '4',
    title: 'Culinary Masterclass Series',
    description: 'Learn cooking techniques from world-renowned chefs. Each session focuses on a different cuisine. Limited spots available!',
    location: 'The Gourmet Kitchen Studio',
    date: '2024-11-12',
    time: '18:00',
    amount: 150,
    imageUrl: 'https://picsum.photos/seed/cookingclass/600/400',
  },
];

async function getEvents(): Promise<Event[]> {
  // In a real app, fetch from Firestore:
  // const eventsCol = collection(db, 'events');
  // const eventSnapshot = await getDocs(eventsCol);
  // const eventList = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
  // return eventList;
  return Promise.resolve(MOCK_EVENTS);
}

export default async function HomePage() {
  const events = await getEvents();

  return (
    <div className="space-y-8">
      <section className="text-center py-12 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 rounded-xl shadow-lg">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{siteConfig.name}</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover and book tickets for the most exciting events happening around you. Your next adventure starts here!
        </p>
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

// Import siteConfig for the h1 title span
import { siteConfig } from '@/config/site';
