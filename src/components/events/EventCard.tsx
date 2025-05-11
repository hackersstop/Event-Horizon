import Link from 'next/link';
import Image from 'next/image';
import type { Event } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Tag, ArrowRight } from 'lucide-react';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative w-full h-48">
          <Image
            src={event.imageUrl}
            alt={event.title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="event concert"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-3">
        <CardTitle className="text-xl font-semibold leading-tight hover:text-primary transition-colors">
          <Link href={`/events/${event.id}`}>{event.title}</Link>
        </CardTitle>
        
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-2 text-primary" />
            <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            <span>{event.location}</span>
          </div>
        </div>

        <p className="text-sm text-foreground line-clamp-3">
          {event.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        <div className="flex items-center">
          <Tag className="h-5 w-5 mr-2 text-accent" />
          <span className="text-lg font-bold text-primary">
            {event.offerAmount ? (
              <>
                <span className="line-through text-muted-foreground text-sm mr-1">${event.amount}</span>
                ${event.offerAmount}
              </>
            ) : (
              `$${event.amount}`
            )}
          </span>
        </div>
        <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
          <Link href={`/events/${event.id}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
