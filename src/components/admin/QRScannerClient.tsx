
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

export function QRScannerClient() {
  const { toast } = useToast();
  const [ticketIdInput, setTicketIdInput] = useState(''); // Changed state name for clarity
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ status: 'success' | 'error' | 'info'; message: string; booking?: Booking } | null>(null);

  const handleVerify = async () => {
    const bookingId = ticketIdInput.trim(); // Use the direct input as bookingId
    if (!bookingId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Ticket ID cannot be empty.' });
      return;
    }
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const bookingDocRef = doc(db, 'bookings', bookingId);
      const bookingDocSnap = await getDoc(bookingDocRef);

      if (!bookingDocSnap.exists()) {
        setVerificationResult({ status: 'error', message: 'Booking not found. Invalid ticket ID.' });
        toast({ variant: 'destructive', title: 'Verification Failed', description: 'Booking not found for this Ticket ID.' });
        setIsVerifying(false);
        return;
      }

      const bookingData = { id: bookingDocSnap.id, ...bookingDocSnap.data() } as Booking;
      
      if (bookingData.verified) {
        setVerificationResult({ status: 'info', message: 'Ticket Already Verified/Used.', booking: bookingData });
        toast({ title: 'Info', description: 'This ticket has already been used.' });
      } else {
        await updateDoc(bookingDocRef, { verified: true });
        const updatedBookingData = { ...bookingData, verified: true };
        setVerificationResult({ status: 'success', message: 'Ticket Verified Successfully!', booking: updatedBookingData });
        toast({ title: 'Success', description: 'Ticket is valid and has been marked as verified.' });
      }
      setTicketIdInput(''); // Clear input after verification attempt
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
        <Label htmlFor="ticketIdInput">Ticket ID</Label>
        <Input
          id="ticketIdInput"
          value={ticketIdInput}
          onChange={(e) => setTicketIdInput(e.target.value)}
          placeholder="Enter Ticket ID from QR code or booking"
          disabled={isVerifying}
        />
        <p className="text-xs text-muted-foreground mt-1">Enter the Ticket ID (Booking ID) that is represented by the QR code.</p>
      </div>
      
      <Button onClick={handleVerify} className="w-full bg-primary hover:bg-primary/90 text-lg py-3" disabled={isVerifying || !ticketIdInput.trim()}>
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
                <p><strong>Ticket ID:</strong> {verificationResult.booking.id}</p>
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
                 <p className="text-xs mt-1">Raw QR Data Stored: {verificationResult.booking.qrCodeData}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
