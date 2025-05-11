'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, TicketCheck, AlertTriangle } from 'lucide-react';
// import { verifyTicket } from '@/actions/adminActions'; // Placeholder server action
import type { Booking } from '@/types';

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
    try {
      // In a real app, call a server action:
      // const result = await verifyTicket(qrData);
      // if (result.success) {
      //   setVerificationResult({ status: 'success', message: 'Ticket Verified!', booking: result.booking });
      //   toast({ title: 'Success', description: 'Ticket is valid.' });
      // } else {
      //   setVerificationResult({ status: 'error', message: result.error || 'Invalid or already used ticket.' });
      //   toast({ variant: 'destructive', title: 'Verification Failed', description: result.error || 'Ticket invalid.' });
      // }

      // Mock verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (qrData.includes("EVENT:1") && qrData.includes("VALID")) { // Mock valid QR
        setVerificationResult({ 
            status: 'success', 
            message: 'Ticket Verified Successfully!', 
            booking: { id: 'b1', eventId: '1', eventTitle: 'Summer Music Festival', userId: 'user123', qrCodeData: qrData, verified: true } as any
        });
        toast({ title: 'Success', description: 'Ticket is valid and has been marked as verified.' });
      } else if (qrData.includes("EVENT:2") && qrData.includes("USED")) { // Mock already used QR
         setVerificationResult({ status: 'info', message: 'Ticket Already Verified/Used.'});
         toast({ title: 'Info', description: 'This ticket has already been used.' });
      } else { // Mock invalid QR
        setVerificationResult({ status: 'error', message: 'Invalid Ticket Data.' });
        toast({ variant: 'destructive', title: 'Verification Failed', description: 'This ticket is invalid.' });
      }
      setQrData(''); // Clear input after verification
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
        <p className="text-xs text-muted-foreground mt-1">For demo, try: "EVENT:1;USER:xyz;VALID" or "EVENT:2;USER:abc;USED"</p>
      </div>
      
      {/* Placeholder for actual camera scanning UI */}
      {/* <Button variant="outline" className="w-full" disabled>
        <Camera className="mr-2 h-4 w-4" /> Open Camera Scanner (Not Implemented)
      </Button> */}

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
                <p><strong>Event:</strong> {verificationResult.booking.eventTitle || verificationResult.booking.eventId}</p>
                <p><strong>User ID:</strong> {verificationResult.booking.userId}</p>
                <p><strong>Status:</strong> {verificationResult.booking.verified ? "Verified" : "Pending Verification"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
