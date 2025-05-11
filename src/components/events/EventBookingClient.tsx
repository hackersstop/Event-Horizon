
'use client';

import type { Event, Booking, AdminConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Ticket, CreditCard, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { QRCodeDisplay } from './QRCodeDisplay';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { generateDisplayTicketId } from '@/lib/ticketUtils';
import { siteConfig } from '@/config/site';
import { sendBookingConfirmationEmail } from '@/actions/sendBookingEmail'; // Import the server action

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface EventBookingClientProps {
  event: Event;
}

const ADMIN_CONFIG_DOC_PATH = 'app_config/admin_settings';

export function EventBookingClient({ event }: EventBookingClientProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookingState, setBookingState] = useState<'idle' | 'processing' | 'booked' | 'error'>('idle');
  const [bookedDetails, setBookedDetails] = useState<Booking | null>(null);
  const [generatedBookingId, setGeneratedBookingId] = useState<string | null>(null);
  const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    const loadRazorpayScript = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        // console.log('Razorpay SDK loaded');
      };
      script.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'Payment Error',
          description: 'Could not load payment gateway. Please try again later.',
        });
      };
      document.body.appendChild(script);
    };

    loadRazorpayScript();

    async function fetchAdminConfig() {
      setLoadingConfig(true);
      try {
        const configDocRef = doc(db, ADMIN_CONFIG_DOC_PATH);
        const configDocSnap = await getDoc(configDocRef);
        if (configDocSnap.exists()) {
          const configData = configDocSnap.data() as AdminConfig;
          if (configData.razorpayKeyId) {
            setRazorpayKeyId(configData.razorpayKeyId);
          } else {
            toast({ variant: 'destructive', title: 'Configuration Error', description: 'Razorpay Key ID is not configured by admin.' });
          }
        } else {
           toast({ variant: 'destructive', title: 'Configuration Error', description: 'Admin payment settings not found.' });
        }
      } catch (error) {
        console.error('Failed to load Razorpay config:', error);
        toast({ variant: 'destructive', title: 'Configuration Error', description: 'Could not load payment settings.' });
      } finally {
        setLoadingConfig(false);
      }
    }
    fetchAdminConfig();

    return () => {
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript && existingScript.parentNode) {
        // existingScript.parentNode.removeChild(existingScript); // Optional, consider implications
      }
    };
  }, [toast]);


  const handleBookNow = async () => {
    if (authLoading || loadingConfig) return;
    if (!user) {
      router.push(`/login?redirect=/events/${event.id}`);
      return;
    }

    if (!razorpayKeyId) {
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: 'Payment gateway is not configured. Please contact support.',
      });
      return;
    }
    
    if (!window.Razorpay) {
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: 'Payment gateway is not loaded. Please refresh and try again.',
      });
      return;
    }

    setBookingState('processing');

    const amountInPaisa = Math.round((event.offerAmount || event.amount) * 100);

    const options = {
      key: razorpayKeyId,
      amount: amountInPaisa.toString(),
      currency: 'INR',
      name: siteConfig.name,
      description: `Ticket for ${event.title}`,
      image: '/logo-placeholder.png', 
      handler: async (response: any) => {
        const paymentId = response.razorpay_payment_id;
        const orderId = response.razorpay_order_id; 

        try {
          const bookingDataForFirestore: Omit<Booking, 'id' | 'bookingDate' | 'qrCodeData' | 'displayTicketId'> & { qrCodeData?: string, displayTicketId?: string, userEmail?: string } = {
            userId: user.uid,
            userEmail: user.email || undefined,
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.date,
            eventTime: event.time,
            paymentStatus: 'completed',
            paymentId: paymentId,
            paymentCurrency: 'INR',
            verified: false,
          };

          const docRef = await addDoc(collection(db, 'bookings'), {
            ...bookingDataForFirestore,
            bookingDate: serverTimestamp(),
          });

          const actualBookingId = docRef.id;
          const displayId = generateDisplayTicketId(actualBookingId);
          const compositeQrCodeDataString = actualBookingId;

          await updateDoc(doc(db, 'bookings', actualBookingId), {
            qrCodeData: compositeQrCodeDataString,
            displayTicketId: displayId,
            razorpayOrderId: orderId, 
          });

          const newBookingForDisplay: Booking = {
            ...bookingDataForFirestore,
            id: actualBookingId,
            displayTicketId: displayId,
            qrCodeData: compositeQrCodeDataString,
            bookingDate: new Date() as any, // This will be a Timestamp from DB in profile
            userEmail: user.email || undefined,
          };

          setBookedDetails(newBookingForDisplay);
          setGeneratedBookingId(actualBookingId);
          setBookingState('booked');
          toast({
            title: "Booking Confirmed!",
            description: `${event.title} booked. Ticket ID: ${displayId}. (Payment: ₹${event.offerAmount || event.amount})`,
            duration: 7000,
          });

          // Send confirmation email
          if (user.email) {
            const emailResult = await sendBookingConfirmationEmail(newBookingForDisplay, event, user.email);
            if (emailResult.success) {
              toast({ title: "Email Sent", description: "A confirmation email has been sent (simulated)." });
            } else {
              toast({ variant: "destructive", title: "Email Failed", description: emailResult.message });
            }
          }

        } catch (dbError) {
          console.error("Booking failed after payment (DB error):", dbError);
          setBookingState('error');
          toast({
            variant: "destructive",
            title: "Booking Record Failed",
            description: "Payment was successful, but we couldn't save your booking. Please contact support with Payment ID: " + paymentId,
            duration: 10000,
          });
        }
      },
      prefill: {
        name: user.displayName || '',
        email: user.email || '',
      },
      notes: {
        eventId: event.id,
        userId: user.uid,
        eventTitle: event.title,
      },
      theme: {
        color: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#3399cc'
      },
      modal: {
        ondismiss: () => {
          if (bookingState !== 'booked') { 
            setBookingState('idle');
            toast({
              title: 'Payment Cancelled',
              description: 'Your booking was not completed.',
              variant: 'default'
            });
          }
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        console.error('Razorpay payment.failed response:', response);
        setBookingState('error');
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: response.error.description || "Your payment could not be processed. Please try again.",
          duration: 7000,
        });
      });
      rzp.open();
    } catch(e) {
        console.error("Razorpay initialization error", e);
        setBookingState('error');
        toast({
            variant: "destructive",
            title: "Payment Gateway Error",
            description: "Could not initialize the payment gateway. Please try again.",
        });
    }
  };


  if (bookingState === 'booked' && bookedDetails && generatedBookingId) {
    return (
      <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg shadow-md text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-green-700 mb-2">Booking Confirmed!</h3>
        <p className="text-green-600 mb-1">Your ticket for <strong>{event.title}</strong> is ready.</p>
        <p className="text-green-600 mb-1">Amount paid: ₹{event.offerAmount || event.amount}</p>
        <p className="text-md font-semibold text-green-700 mb-4">Ticket Reference: {bookedDetails.displayTicketId}</p>
        
        <QRCodeDisplay 
          qrDataToEncode={generatedBookingId} 
          displayTicketId={bookedDetails.displayTicketId}
          eventTitle={event.title}
          verifiableId={generatedBookingId}
        />
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
        disabled={authLoading || bookingState === 'processing' || loadingConfig || !razorpayKeyId}
        size="lg"
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3"
      >
        {bookingState === 'processing' || loadingConfig ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Ticket className="mr-2 h-5 w-5" />
        )}
        {authLoading ? 'Loading User...' : 
         loadingConfig ? 'Loading Payment Gateway...' :
         (bookingState === 'processing' ? 'Processing Payment...' : `Book Now & Pay ₹${event.offerAmount || event.amount}`)}
      </Button>
      <p className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center">
        <CreditCard className="h-3 w-3 mr-1"/> Secure payment with Razorpay
      </p>
       {!razorpayKeyId && !loadingConfig && (
         <p className="text-xs text-destructive mt-1 text-center">
           Payment gateway not configured by admin. Booking unavailable.
         </p>
       )}
    </div>
  );
}
