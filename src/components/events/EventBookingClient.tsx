'use client';

import type { Event, Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Ticket, CreditCard, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { QRCodeDisplay } from './QRCodeDisplay';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface EventBookingClientProps {
  event: Event;
}

export function EventBookingClient({ event }: EventBookingClientProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookingState, setBookingState] = useState<'idle' | 'processing' | 'booked' | 'error'>('idle');
  const [bookedDetails, setBookedDetails] = useState<Booking | null>(null);

  const handleBookNow = async () => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?redirect=/events/${event.id}`);
      return;
    }

    setBookingState('processing');

    try {
      // Simulate payment processing (Razorpay would be integrated here)
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      // Payment successful (mock)
      const paymentId = `mock_payment_${Date.now()}`;

      const bookingData: Omit<Booking, 'id' | 'bookingDate' | 'qrCodeData'> = {
        userId: user.uid,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        paymentStatus: 'completed',
        paymentId: paymentId,
        verified: false,
        paymentCurrency: 'INR',
      };
      
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        bookingDate: serverTimestamp(), 
      });

      const qrCodeData = `EVENT_ID:${event.id};USER_ID:${user.uid};BOOKING_ID:${docRef.id}`;
      
      // Update the just created booking with QR code data
      // Normally, you'd update the document, but for client-side display, this is okay before showing QR
      // For a robust solution, QR data could be part of the initial write or an update.
      // For now, we'll construct it for display and assume it's on the created document.
      // It is better to store qrCodeData in Firestore document after generation.
      // For this demo, we will simulate it.
      
      const newBookingForDisplay: Booking = {
        ...bookingData,
        id: docRef.id,
        qrCodeData: qrCodeData,
        // bookingDate will be a server timestamp, for immediate display we might use client's current time
        // but for consistency, it's better to re-fetch or rely on what's shown in profile page.
        // For this component, we'll use the generated QR and other details.
        bookingDate: new Date() as any, // This is a placeholder for display; actual is serverTimestamp
      };

      setBookedDetails(newBookingForDisplay);
      setBookingState('booked');
      toast({
        title: "Booking Confirmed!",
        description: `You've successfully booked ${event.title}. Your QR code is displayed below. (Payment: ₹${event.offerAmount || event.amount})`,
        duration: 7000,
      });
      console.log("Mock email sent for booking:", newBookingForDisplay);


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

  if (bookingState === 'booked' && bookedDetails) {
    return (
      <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg shadow-md text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-green-700 mb-2">Booking Confirmed!</h3>
        <p className="text-green-600 mb-4">Your ticket for <strong>{event.title}</strong> is ready. Amount paid: ₹{event.offerAmount || event.amount}</p>
        <QRCodeDisplay data={bookedDetails.qrCodeData} eventTitle={event.title} />
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
        {authLoading ? 'Loading...' : (bookingState === 'processing' ? 'Processing...' : `Book Now & Pay ₹${event.offerAmount || event.amount}`)}
      </Button>
      <p className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center">
        <CreditCard className="h-3 w-3 mr-1"/> Secure payment (Demo Mode)
      </p>
    </div>
  );
}
