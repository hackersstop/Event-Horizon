
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Ticket, ListFilter, PlusCircle, Edit, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { Event } from '@/types'; // Use the existing Event type
import { collection, getDocs, orderBy, query, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminManageEventsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorEvents, setErrorEvents] = useState<string | null>(null);
   const [deletingEventId, setDeletingEventId] = useState<string | null>(null);


  const fetchEvents = async () => {
    setLoadingEvents(true);
    setErrorEvents(null);
    try {
      const eventsCol = collection(db, 'events');
      const q = query(eventsCol, orderBy('date', 'desc')); // Order by date, most recent first
      const eventSnapshot = await getDocs(q);
      const eventList = eventSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure date fields are correctly formatted if they are Timestamps
          // 'date' is a string YYYY-MM-DD, 'createdAt' is a Timestamp
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        } as Event;
      });
      setEvents(eventList);
    } catch (error) {
      console.error("Error fetching events: ", error);
      setErrorEvents("Failed to load events. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch events from the database.",
      });
    } finally {
      setLoadingEvents(false);
    }
  };
  
  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/admin/login');
      } else {
        fetchEvents();
      }
    }
  }, [user, isAdmin, authLoading, router]);


  const handleDeleteEvent = async (eventId: string) => {
    setDeletingEventId(eventId);
    try {
      await deleteDoc(doc(db, 'events', eventId));
      toast({
        title: 'Event Deleted',
        description: 'The event has been successfully deleted.',
      });
      // Refresh events list
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        variant: 'destructive',
        title: 'Error Deleting Event',
        description: 'Could not delete the event. Please try again.',
      });
    } finally {
      setDeletingEventId(null);
    }
  };


  if (authLoading || !user || !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in-0 duration-500 ease-out space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Ticket className="h-10 w-10 text-primary" />
              <div>
                <CardTitle className="text-3xl font-bold">Manage Events</CardTitle>
                <CardDescription className="mt-1">View, edit, or remove existing events.</CardDescription>
              </div>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/admin/events/add">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Event
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingEvents ? (
            <div className="flex justify-center items-center py-16">
              <Spinner className="h-12 w-12 text-primary" />
            </div>
          ) : errorEvents ? (
             <div className="text-center py-16 border-2 border-dashed border-destructive/50 rounded-lg bg-destructive/5 p-8">
              <AlertTriangle className="h-20 w-20 text-destructive mx-auto mb-6" />
              <p className="text-2xl font-semibold text-destructive mb-2">Error Loading Events</p>
              <p className="text-md text-destructive/80 max-w-md mx-auto">
                {errorEvents}
              </p>
              <Button onClick={fetchEvents} className="mt-6" variant="destructive">
                Try Again
              </Button>
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow duration-200 ease-in-out animate-in fade-in-0 zoom-in-95 delay-100 fill-mode-both">
                  <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-center">
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-semibold text-secondary">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(event.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} at {event.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <span className="text-sm font-medium">
                        {event.offerAmount ? (
                          <>
                           <span className="line-through text-muted-foreground/80 text-xs mr-1">₹{event.amount}</span>
                            ₹{event.offerAmount}
                          </>
                        ) : (
                          `₹${event.amount}`
                        )}
                      </span>
                    </div>
                    <div className="text-sm">
                       <p className="text-xs text-muted-foreground">Location</p>
                       <p className="truncate" title={event.location}>{event.location}</p>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2">
                      <Button variant="outline" size="sm" className="w-full md:w-auto" disabled>
                        <Edit className="mr-1 h-4 w-4" /> Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="w-full md:w-auto" disabled={deletingEventId === event.id}>
                            {deletingEventId === event.id ? <Spinner className="mr-1 h-4 w-4" /> : <Trash2 className="mr-1 h-4 w-4" />}
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the event "{event.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteEvent(event.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg animate-in fade-in-0 zoom-in-95">
              <ListFilter className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
              <p className="text-2xl font-semibold text-muted-foreground mb-2">No Events Found.</p>
              <p className="text-md text-muted-foreground max-w-md mx-auto">
                Start by adding your first event. Once created, you'll be able to manage them all from this dashboard.
              </p>
              <Button asChild className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/admin/events/add">
                  <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Event
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
         <CardFooter className="text-sm text-muted-foreground pt-4 border-t">
          <p>Currently, only event deletion is implemented. Editing functionality will be added soon.</p>
        </CardFooter>
      </Card>
    </div>
  );
}

