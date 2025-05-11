
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Booking } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QRCodeDisplay } from '@/components/events/QRCodeDisplay';
import { Spinner } from '@/components/ui/spinner';
import { Ticket, CalendarDays, ShoppingBag, UserCircle, Info, Clock, Hash, AtSign } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateDisplayTicketId } from '@/lib/ticketUtils';

async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    const bookingsCol = collection(db, 'bookings');
    const q = query(bookingsCol, where('userId', '==', userId), orderBy('bookingDate', 'desc'));
    const bookingSnapshot = await getDocs(q);
    return bookingSnapshot.docs.map(doc => {
      const data = doc.data();
      const bookingId = doc.id;
      return { 
        id: bookingId, 
        ...data,
        displayTicketId: data.displayTicketId || generateDisplayTicketId(bookingId), // Ensure displayTicketId
        bookingDate: data.bookingDate as Timestamp, 
        eventDate: data.eventDate, 
        eventTime: data.eventTime, 
        qrCodeData: data.qrCodeData || bookingId, // qrCodeData should be the actual bookingId for verification
      } as Booking;
    });
  } catch (error) {
    console.error("Error fetching user bookings: ", error);
    return [];
  }
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
      setLoadingBookings(true);
      getUserBookings(user.uid)
        .then(fetchedBookings => {
            setBookings(fetchedBookings);
        })
        .catch(error => {
            console.error("Failed to load bookings: ", error);
        })
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
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <p className="text-xl text-muted-foreground mb-4">Please log in to view your profile.</p>
            <Button asChild>
                <Link href="/login?redirect=/profile">Login</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-4">
            {user.photoURL ? (
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.photoURL} alt={user.displayName || 'User Avatar'} />
                <AvatarFallback className="text-3xl">
                  {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <UserCircle className="h-20 w-20 text-muted-foreground" />
            )}
            <div>
              <CardTitle className="text-3xl font-bold text-primary">My Profile</CardTitle>
              <CardDescription>Welcome, {user.displayName || user.email}! Here are your event bookings.</CardDescription>
            </div>
          </div>
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
                <Card key={booking.id} className="overflow-hidden transition-shadow hover:shadow-md bg-card/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold text-secondary flex items-center">
                      <Ticket className="h-6 w-6 mr-2" />
                      {booking.eventTitle || `Event Booking`}
                    </CardTitle>
                    <CardDescription>
                      Booked on: {booking.bookingDate instanceof Timestamp ? booking.bookingDate.toDate().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date(booking.bookingDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-3">
                       <div>
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center"><Hash className="h-4 w-4 mr-1"/>Ticket Reference</h4>
                        <p className="text-lg font-bold text-primary">{booking.displayTicketId}</p>
                      </div>
                       {user.email && (
                        <div className="flex items-center space-x-2">
                          <AtSign className="h-5 w-5 text-muted-foreground" />
                          <p className="text-sm">Email: {user.email}</p>
                        </div>
                       )}
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Event Details</h4>
                        <p className="text-md font-semibold">{booking.eventTitle || 'N/A'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                        <p className="text-sm">
                          Event Date: {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric'}) : 'N/A'}
                        </p>
                      </div>
                       {booking.eventTime && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <p className="text-sm">Event Time: {booking.eventTime}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                        <p className={`text-sm font-semibold ${booking.verified ? 'text-green-600' : 'text-amber-600'}`}>
                          {booking.verified ? 'Verified & Checked In' : 'Not Checked In'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end">
                       <QRCodeDisplay 
                          qrDataToEncode={booking.id} // This is the actual Firestore booking ID for QR
                          displayTicketId={booking.displayTicketId}
                          eventTitle={booking.eventTitle}
                          verifiableId={booking.id} // Display the full verifiable ID (which is the booking.id)
                       />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 mt-4 border-t">
                     <Button variant="outline" size="sm" asChild>
                        <Link href={`/events/${booking.eventId}`} className="flex items-center">
                            <Info className="h-4 w-4 mr-2" /> View Original Event
                        </Link>
                      </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
