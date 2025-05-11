import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays, MapPin, Tag, Clock, Info, Ticket } from 'lucide-react';
import type { Event } from '@/types';
import Link from 'next/link';
import { EventBookingClient } from '@/components/events/EventBookingClient';

// Mock function to get event details by ID
async function getEventDetails(eventId: string): Promise<Event | null> {
  // In a real app, fetch from Firestore:
  // const eventDoc = await getDoc(doc(db, 'events', eventId));
  // if (eventDoc.exists()) return { id: eventDoc.id, ...eventDoc.data() } as Event;
  // return null;

  // Mock data:
  const mockEvents: Event[] = [
    { id: '1', title: 'Summer Music Festival', description: 'Join us for an unforgettable weekend of music, art, and fun under the sun. Featuring top artists from around the globe!', location: 'Sunset Valley Park', date: '2024-08-15', time: '14:00', amount: 75, offerAmount: 60, imageUrl: 'https://picsum.photos/seed/musicfest/800/500' },
    { id: '2', title: 'Tech Innovators Conference', description: 'A premier conference for tech enthusiasts, developers, and entrepreneurs. Discover the latest trends and network with industry leaders.', location: 'Grand Convention Center', date: '2024-09-10', time: '09:00', amount: 199, imageUrl: 'https://picsum.photos/seed/techconf/800/500' },
    { id: '3', title: 'Art & Design Expo', description: 'Explore stunning artworks and innovative designs from emerging and established artists. Workshops and live demonstrations available.', location: 'City Art Gallery', date: '2024-10-05', time: '10:00', amount: 25, offerAmount: 20, imageUrl: 'https://picsum.photos/seed/artexpo/800/500' },
    { id: '4', title: 'Culinary Masterclass Series', description: 'Learn cooking techniques from world-renowned chefs. Each session focuses on a different cuisine. Limited spots available!', location: 'The Gourmet Kitchen Studio', date: '2024-11-12', time: '18:00', amount: 150, imageUrl: 'https://picsum.photos/seed/cookingclass/800/500' },
  ];
  return mockEvents.find(e => e.id === eventId) || null;
}

export async function generateMetadata({ params }: { params: { eventId: string } }) {
  const event = await getEventDetails(params.eventId);
  if (!event) {
    return { title: 'Event Not Found' };
  }
  return {
    title: event.title,
    description: event.description,
  };
}

export default async function EventDetailsPage({ params }: { params: { eventId: string } }) {
  const event = await getEventDetails(params.eventId);

  if (!event) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Event Not Found</h1>
        <p className="text-muted-foreground">The event you are looking for does not exist or may have been moved.</p>
        <Button asChild className="mt-4">
          <Link href="/">Back to Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden shadow-xl">
        <div className="relative w-full h-72 md:h-96">
          <Image
            src={event.imageUrl}
            alt={event.title}
            layout="fill"
            objectFit="cover"
            data-ai-hint="event banner"
          />
        </div>
        <CardHeader className="p-6">
          <CardTitle className="text-3xl md:text-4xl font-bold text-primary">{event.title}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-md">
            <div className="flex items-start space-x-3">
              <CalendarDays className="h-6 w-6 text-secondary mt-1" />
              <div>
                <h3 className="font-semibold">Date</h3>
                <p className="text-muted-foreground">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="h-6 w-6 text-secondary mt-1" />
              <div>
                <h3 className="font-semibold">Time</h3>
                <p className="text-muted-foreground">{event.time}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="h-6 w-6 text-secondary mt-1" />
              <div>
                <h3 className="font-semibold">Location</h3>
                <p className="text-muted-foreground">{event.location}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Tag className="h-6 w-6 text-secondary mt-1" />
              <div>
                <h3 className="font-semibold">Price</h3>
                <p className="text-xl font-bold text-primary">
                  {event.offerAmount ? (
                    <>
                      <span className="line-through text-muted-foreground text-lg mr-2">${event.amount}</span>
                      ${event.offerAmount}
                    </>
                  ) : (
                    `$${event.amount}`
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Info className="h-6 w-6 text-secondary" />
              <h3 className="text-xl font-semibold">About this event</h3>
            </div>
            <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
          
          <EventBookingClient event={event} />

        </CardContent>
      </Card>
    </div>
  );
}
