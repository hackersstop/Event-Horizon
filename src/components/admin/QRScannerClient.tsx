'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, TicketCheck, AlertTriangle } from 'lucide-react';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Booking } from '@/types';

// QR Data Format: EVENT_ID:event_id_val;USER_ID:user_id_val;BOOKING_ID:booking_id_val
// Example: "EVENT_ID:eventXYZ;USER_ID:userABC;BOOKING_ID:booking123"
const parseQRData = (data: string): { bookingId: string | null, eventId: string | null, userId: string | null } => {
  const parts = data.split(';');
  let bookingId: string | null = null;
  let eventId: string | null = null;
  let userId: string | null = null;

  parts.forEach(part => {
    const [key, value] = part.split(':');
    if (key === 'BOOKING_ID') bookingId = value;
    if (key === 'EVENT_ID') eventId = value;
    if (key === 'USER_ID') userId = value;
  });
  
  return { bookingId, eventId, userId };
};


export function QRScannerClient() {
  const { toast } = useToast();
  const [qrData, setQrData] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ status: 'success' | 'error' | 'info'; message: string; booking?: Booking } | null>(null);

  const handleVerify = async () => {
    if (!qrData.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'QR Code data cannot be empty.' });
      return;
    }
    setIsVerifying(true);
    setVerificationResult(null);

    const { bookingId } = parseQRData(qrData);

    if (!bookingId) {
      setVerificationResult({ status: 'error', message: 'Invalid QR Code format. Booking ID not found.' });
      toast({ variant: 'destructive', title: 'Verification Failed', description: 'Invalid QR Code format.' });
      setIsVerifying(false);
      return;
    }

    try {
      const bookingDocRef = doc(db, 'bookings', bookingId);
      const bookingDocSnap = await getDoc(bookingDocRef);

      if (!bookingDocSnap.exists()) {
        setVerificationResult({ status: 'error', message: 'Booking not found. Invalid ticket.' });
        toast({ variant: 'destructive', title: 'Verification Failed', description: 'Booking not found.' });
        setIsVerifying(false);
        return;
      }

      const bookingData = { id: bookingDocSnap.id, ...bookingDocSnap.data() } as Booking;
      
      // Ensure bookingDate is handled as Timestamp if needed for display, though not directly used here.
      // bookingData.bookingDate will be a Firestore Timestamp.

      if (bookingData.verified) {
        setVerificationResult({ status: 'info', message: 'Ticket Already Verified/Used.', booking: bookingData });
        toast({ title: 'Info', description: 'This ticket has already been used.' });
      } else {
        await updateDoc(bookingDocRef, { verified: true });
        const updatedBookingData = { ...bookingData, verified: true };
        setVerificationResult({ status: 'success', message: 'Ticket Verified Successfully!', booking: updatedBookingData });
        toast({ title: 'Success', description: 'Ticket is valid and has been marked as verified.' });
      }
      setQrData(''); // Clear input after verification attempt
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationResult({ status: 'error', message: 'An unexpected error occurred during verification.' });
      toast({ variant: 'destructive', title: 'Error', description: 'Verification process failed.' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="qrData">QR Code Data</Label>
        <Input
          id="qrData"
          value={qrData}
          onChange={(e) => setQrData(e.target.value)}
          placeholder="Paste QR data here or use scanner"
          disabled={isVerifying}
        />
        <p className="text-xs text-muted-foreground mt-1">Demo QR Data Format: EVENT_ID:id;USER_ID:id;BOOKING_ID:id</p>
        <p className="text-xs text-muted-foreground mt-1">Example: EVENT_ID:someEvent123;USER_ID:userABC;BOOKING_ID:your_actual_booking_id_from_firestore</p>

      </div>
      
      <Button onClick={handleVerify} className="w-full bg-primary hover:bg-primary/90 text-lg py-3" disabled={isVerifying || !qrData.trim()}>
        {isVerifying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <TicketCheck className="mr-2 h-5 w-5" />}
        {isVerifying ? 'Verifying...' : 'Verify Ticket'}
      </Button>

      {verificationResult && (
        <Card className={`mt-4 ${
            verificationResult.status === 'success' ? 'border-green-500 bg-green-50' : 
            verificationResult.status === 'error' ? 'border-red-500 bg-red-50' : 
            'border-amber-500 bg-amber-50'
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className={`flex items-center text-lg ${
                verificationResult.status === 'success' ? 'text-green-700' :
                verificationResult.status === 'error' ? 'text-red-700' :
                'text-amber-700'
            }`}>
              {verificationResult.status === 'success' && <CheckCircle className="mr-2 h-5 w-5" />}
              {verificationResult.status === 'error' && <XCircle className="mr-2 h-5 w-5" />}
              {verificationResult.status === 'info' && <AlertTriangle className="mr-2 h-5 w-5" />}
              Verification Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`font-medium ${
                verificationResult.status === 'success' ? 'text-green-600' :
                verificationResult.status === 'error' ? 'text-red-600' :
                'text-amber-600'
            }`}>{verificationResult.message}</p>
            {verificationResult.booking && (
              <div className="mt-2 text-sm">
                <p><strong>Booking ID:</strong> {verificationResult.booking.id}</p>
                <p><strong>Event:</strong> {verificationResult.booking.eventTitle || verificationResult.booking.eventId}</p>
                <p><strong>User ID:</strong> {verificationResult.booking.userId}</p>
                <p><strong>Status:</strong> {verificationResult.booking.verified ? "Verified & Checked In" : "Pending Verification"}</p>
                {verificationResult.booking.bookingDate && 
                  <p><strong>Booked On:</strong> {
                    verificationResult.booking.bookingDate instanceof Timestamp 
                    ? verificationResult.booking.bookingDate.toDate().toLocaleDateString('en-IN') 
                    : new Date(verificationResult.booking.bookingDate).toLocaleDateString('en-IN')
                  }</p>
                }
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
