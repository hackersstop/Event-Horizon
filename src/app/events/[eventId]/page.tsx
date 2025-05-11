import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays, MapPin, Tag, Clock, Info } from 'lucide-react';
import type { Event } from '@/types';
import Link from 'next/link';
import { EventBookingClient } from '@/components/events/EventBookingClient';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

async function getEventDetails(eventId: string): Promise<Event | null> {
  try {
    const eventDocRef = doc(db, 'events', eventId);
    const eventDocSnap = await getDoc(eventDocRef);

    if (eventDocSnap.exists()) {
      const data = eventDocSnap.data();
      return { 
        id: eventDocSnap.id, 
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as Event;
    }
    return null;
  } catch (error) {
    console.error("Error fetching event details: ", error);
    return null;
  }
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
                <p className="text-muted-foreground">{new Date(event.date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
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
                      <span className="line-through text-muted-foreground text-lg mr-2">₹{event.amount}</span>
                      ₹{event.offerAmount}
                    </>
                  ) : (
                    `₹${event.amount}`
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
