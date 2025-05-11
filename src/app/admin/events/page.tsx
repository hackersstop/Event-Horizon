
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Ticket, ListFilter, PlusCircle, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

// In a real app, this would be your Event type from @/types
interface SampleEvent {
  id: string;
  title: string;
  date: string;
  status: 'Published' | 'Draft' | 'Archived';
  attendees: number;
  revenue: number;
}

export default function AdminManageEventsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/admin/login');
      }
    }
  }, [user, isAdmin, authLoading, router]);

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  // Placeholder data for events - in a real app, this would come from Firestore
  const sampleEvents: SampleEvent[] = [
    { id: '1', title: 'Summer Music Festival', date: '2024-08-15', status: 'Published', attendees: 1200, revenue: 600000 },
    { id: '2', title: 'Tech Conference 2024', date: '2024-09-20', status: 'Draft', attendees: 0, revenue: 0 },
    { id: '3', title: 'Art Exhibition Opening', date: '2024-07-30', status: 'Published', attendees: 350, revenue: 87500 },
    { id: '4', title: 'Local Charity Run', date: '2024-10-05', status: 'Archived', attendees: 500, revenue: 25000 },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in-0 duration-500 ease-out space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Ticket className="h-10 w-10 text-primary" />
              <div>
                <CardTitle className="text-3xl font-bold">Manage Events</CardTitle>
                <CardDescription className="mt-1">View, edit, duplicate, or remove existing events.</CardDescription>
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
          {sampleEvents.length > 0 ? (
            <div className="space-y-4">
              {sampleEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow duration-200 ease-in-out">
                  <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-center">
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-semibold text-secondary">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">Date: {event.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                        event.status === 'Published' ? 'bg-green-100 text-green-700' :
                        event.status === 'Draft' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>{event.status}</span>
                    </div>
                    <div className="text-sm">
                       <p className="text-xs text-muted-foreground">Attendees</p>
                       <p>{event.attendees.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2">
                      <Button variant="outline" size="sm" className="w-full md:w-auto">
                        <Edit className="mr-1 h-4 w-4" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" className="w-full md:w-auto">
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
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
          <p>This is a placeholder interface. Full event management functionality will be implemented here.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
