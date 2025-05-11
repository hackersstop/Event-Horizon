'use client';

import type { Event, Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Ticket, CreditCard, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { QRCodeDisplay } from './QRCodeDisplay';
import { useToast } from '@/hooks/use-toast';
// import { saveBooking } from '@/actions/bookingActions'; // Placeholder for server action

interface EventBookingClientProps {
  event: Event;
}

export function EventBookingClient({ event }: EventBookingClientProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookingState, setBookingState] = useState<'idle' | 'processing' | 'booked' | 'error'>('idle');
  const [bookedEvent, setBookedEvent] = useState<Booking | null>(null);

  const handleBookNow = async () => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?redirect=/events/${event.id}`);
      return;
    }

    setBookingState('processing');

    try {
      // Simulate payment processing with Razorpay
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      // In a real app, you would call Razorpay here.
      // If payment is successful:
      const qrCodeData = `EVENT:${event.id};USER:${user.uid};BOOKING_ID:${Date.now()}`;
      const newBooking: Booking = {
        id: Date.now().toString(), // Firestore would generate this
        userId: user.uid,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        bookingDate: new Date().toISOString(), // Firestore server timestamp preferred
        qrCodeData: qrCodeData,
        paymentStatus: 'completed',
        paymentId: `mock_payment_${Date.now()}`,
        verified: false,
      };

      // Call server action to save booking
      // const result = await saveBooking(newBooking);
      // For demo, we'll just set it locally
      // if (result.success) {
      //   setBookedEvent(result.booking);
      //   setBookingState('booked');
      //   toast({ title: "Booking Confirmed!", description: "Your ticket is ready." });
      //   // Here, trigger email sending via a server action.
      // } else {
      //   setBookingState('error');
      //   toast({ variant: "destructive", title: "Booking Failed", description: result.error });
      // }

      // Mock success
      setBookedEvent(newBooking);
      setBookingState('booked');
      toast({
        title: "Booking Confirmed!",
        description: `You've successfully booked ${event.title}. Your QR code is displayed below.`,
        duration: 5000,
      });
      console.log("Mock email sent for booking:", newBooking);


    } catch (error) {
      console.error("Booking failed:", error);
      setBookingState('error');
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: "Something went wrong. Please try again.",
      });
    }
  };

  if (bookingState === 'booked' && bookedEvent) {
    return (
      <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg shadow-md text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-green-700 mb-2">Booking Confirmed!</h3>
        <p className="text-green-600 mb-4">Your ticket for <strong>{event.title}</strong> is ready.</p>
        <QRCodeDisplay data={bookedEvent.qrCodeData} eventTitle={event.title} />
        <Button onClick={() => router.push('/profile')} className="mt-6 bg-green-600 hover:bg-green-700">
          View My Bookings
        </Button>
      </div>
    );
  }
  
  if (bookingState === 'error') {
     return (
      <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg shadow-md text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-red-700 mb-2">Booking Failed</h3>
        <p className="text-red-600 mb-4">We couldn't process your booking. Please try again.</p>
        <Button onClick={() => setBookingState('idle')} variant="destructive" className="mt-6">
          Try Again
        </Button>
      </div>
    );   
  }

  return (
    <div className="mt-8 pt-6 border-t">
      <Button
        onClick={handleBookNow}
        disabled={authLoading || bookingState === 'processing'}
        size="lg"
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3"
      >
        {bookingState === 'processing' ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Ticket className="mr-2 h-5 w-5" />
        )}
        {authLoading ? 'Loading...' : (bookingState === 'processing' ? 'Processing...' : 'Book Now & Pay')}
      </Button>
      <p className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center">
        <CreditCard className="h-3 w-3 mr-1"/> Secure payment via Razorpay (Demo)
      </p>
    </div>
  );
}
