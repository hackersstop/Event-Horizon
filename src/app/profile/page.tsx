'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Booking, Event } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QRCodeDisplay } from '@/components/events/QRCodeDisplay';
import { Spinner } from '@/components/ui/spinner';
import { Ticket, CalendarDays, MapPin, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

// Mock function to fetch user bookings
async function getUserBookings(userId: string): Promise<Booking[]> {
  // In a real app, fetch from Firestore:
  // const bookingsQuery = query(collection(db, 'bookings'), where('userId', '==', userId), orderBy('bookingDate', 'desc'));
  // const bookingSnapshot = await getDocs(bookingsQuery);
  // return bookingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
  
  // Mock data:
  if (userId === "mockUserId") { // Assume a mock user ID
    return Promise.resolve([
      { id: 'b1', userId: 'mockUserId', eventId: '1', eventTitle: 'Summer Music Festival', eventDate: '2024-08-15', bookingDate: new Date().toISOString(), qrCodeData: `EVENT:1;USER:mockUserId;BOOKING_ID:b1`, paymentStatus: 'completed', verified: false },
      { id: 'b2', userId: 'mockUserId', eventId: '2', eventTitle: 'Tech Innovators Conference', eventDate: '2024-09-10', bookingDate: new Date(Date.now() - 86400000).toISOString(), qrCodeData: `EVENT:2;USER:mockUserId;BOOKING_ID:b2`, paymentStatus: 'completed', verified: true },
    ]);
  }
  return Promise.resolve([]);
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/profile');
    } else if (user) {
      getUserBookings(user.uid) // Use actual user.uid for real app
        .then(setBookings)
        .finally(() => setLoadingBookings(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loadingBookings) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by the redirect, but as a fallback:
    return <p className="text-center">Please log in to view your profile.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">My Profile</CardTitle>
          <CardDescription>Welcome, {user.displayName || user.email}! Here are your event bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">You have no bookings yet.</p>
              <Button asChild className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/">Explore Events</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-secondary flex items-center">
                      <Ticket className="h-6 w-6 mr-2" />
                      {booking.eventTitle || `Event ID: ${booking.eventId}`}
                    </CardTitle>
                    <CardDescription>
                      Booked on: {new Date(booking.bookingDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4 items-center">
                    <div>
                       <p className="text-sm text-muted-foreground flex items-center mb-1">
                        <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                        Event Date: {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className={`text-sm font-medium ${booking.verified ? 'text-green-600' : 'text-amber-600'}`}>
                        Status: {booking.verified ? 'Verified' : 'Not Verified'}
                      </p>
                       <Button variant="outline" size="sm" className="mt-2" asChild>
                        <Link href={`/events/${booking.eventId}`}>View Event Details</Link>
                      </Button>
                    </div>
                    <div className="md:ml-auto">
                       <QRCodeDisplay data={booking.qrCodeData} eventTitle={booking.eventTitle} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
