
'use client';

import type { Event, Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Ticket, CreditCard, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { QRCodeDisplay } from './QRCodeDisplay';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore'; // Added doc
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
  const [generatedBookingId, setGeneratedBookingId] = useState<string | null>(null);


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

      const bookingDataForFirestore: Omit<Booking, 'id' | 'bookingDate' | 'qrCodeData'> & { qrCodeData?: string } = {
        userId: user.uid,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        paymentStatus: 'completed',
        paymentId: paymentId,
        verified: false,
        paymentCurrency: 'INR',
        // qrCodeData will be added after doc creation
      };
      
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...bookingDataForFirestore,
        bookingDate: serverTimestamp(), 
      });

      // This is the composite string for Firestore, good for backend reference
      const compositeQrCodeDataString = `EVENT_ID:${event.id};USER_ID:${user.uid};BOOKING_ID:${docRef.id}`;
      
      await updateDoc(doc(db, 'bookings', docRef.id), { 
        qrCodeData: compositeQrCodeDataString 
      });
      
      // For display and QR generation, we use the simple booking ID
      const newBookingForDisplay: Booking = {
        ...bookingDataForFirestore,
        id: docRef.id,
        qrCodeData: compositeQrCodeDataString, // Store the full string in the state for completeness if needed elsewhere
        bookingDate: new Date() as any, 
      };

      setBookedDetails(newBookingForDisplay);
      setGeneratedBookingId(docRef.id); // Set the simple booking ID for QR display
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

  if (bookingState === 'booked' && bookedDetails && generatedBookingId) {
    return (
      <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg shadow-md text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-green-700 mb-2">Booking Confirmed!</h3>
        <p className="text-green-600 mb-4">Your ticket for <strong>{event.title}</strong> is ready. Amount paid: ₹{event.offerAmount || event.amount}</p>
        {/* Pass only the booking ID (generatedBookingId) for QR code generation */}
        <QRCodeDisplay data={generatedBookingId} eventTitle={event.title} fullQrDataString={bookedDetails.qrCodeData} />
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
