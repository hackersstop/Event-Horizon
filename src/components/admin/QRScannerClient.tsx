
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, TicketCheck, AlertTriangle, AtSign } from 'lucide-react';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Booking } from '@/types'; // Ensure Booking type includes displayTicketId and userEmail

export function QRScannerClient() {
  const { toast } = useToast();
  const [scannedBookingIdInput, setScannedBookingIdInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ status: 'success' | 'error' | 'info'; message: string; booking?: Booking } | null>(null);

  const handleVerify = async () => {
    const bookingIdToVerify = scannedBookingIdInput.trim(); // This is the actual Firestore booking ID from QR
    if (!bookingIdToVerify) {
      toast({ variant: 'destructive', title: 'Error', description: 'Scanned Ticket ID cannot be empty.' });
      return;
    }
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const bookingDocRef = doc(db, 'bookings', bookingIdToVerify);
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
      setScannedBookingIdInput(''); 
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
        <Label htmlFor="scannedBookingIdInput">Scanned Ticket ID (Full Firestore ID)</Label>
        <Input
          id="scannedBookingIdInput"
          value={scannedBookingIdInput}
          onChange={(e) => setScannedBookingIdInput(e.target.value)}
          placeholder="Enter full Ticket ID from QR scan"
          disabled={isVerifying}
        />
        <p className="text-xs text-muted-foreground mt-1">This should be the complete ID (e.g., abc123xyz789) encoded in the QR.</p>
      </div>
      
      <Button onClick={handleVerify} className="w-full bg-primary hover:bg-primary/90 text-lg py-3" disabled={isVerifying || !scannedBookingIdInput.trim()}>
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
              <div className="mt-2 text-sm space-y-1">
                <p><strong>Verifiable ID:</strong> {verificationResult.booking.id}</p>
                {verificationResult.booking.displayTicketId && <p><strong>Ticket Ref:</strong> {verificationResult.booking.displayTicketId}</p>}
                <p><strong>Event:</strong> {verificationResult.booking.eventTitle || verificationResult.booking.eventId}</p>
                {verificationResult.booking.userEmail && 
                  <p className="flex items-center"><AtSign className="h-4 w-4 mr-1 text-muted-foreground" /><strong>Email:</strong> {verificationResult.booking.userEmail}</p>
                }
                <p><strong>User ID (Internal):</strong> {verificationResult.booking.userId}</p>
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
