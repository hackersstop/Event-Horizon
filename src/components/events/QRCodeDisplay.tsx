
interface QRCodeDisplayProps {
  data: string;
  eventTitle?: string;
}

// Helper function to extract booking ID from QR data string
const extractBookingId = (qrData: string): string | null => {
  if (!qrData) return null;
  const parts = qrData.split(';');
  for (const part of parts) {
    const [key, value] = part.split(':');
    if (key === 'BOOKING_ID') {
      return value;
    }
  }
  return null;
};

export function QRCodeDisplay({ data, eventTitle }: QRCodeDisplayProps) {
  const bookingId = extractBookingId(data);

  return (
    <div className="mt-6 p-4 border border-dashed border-foreground/50 rounded-lg bg-muted/30 flex flex-col items-center max-w-xs mx-auto shadow-inner">
      {eventTitle && <p className="text-sm font-medium text-center mb-2">Ticket for: {eventTitle}</p>}
      
      {/* Visual representation of QR data - could be replaced with actual QR image component */}
      <div 
        className="w-48 h-48 bg-foreground flex items-center justify-center text-background text-xs p-2 break-all overflow-auto font-mono"
        title={`QR Data: ${data}`}
        aria-label={`QR Code for event: ${eventTitle || 'booking'}`}
        data-ai-hint="qr code"
      >
        {/* Simulating QR code with text data */}
        <span className="text-center text-[8px] leading-tight">
          {data || 'N/A - QR Data Missing'}
        </span>
      </div>

      {bookingId && (
        <p className="mt-2 text-sm font-semibold text-center">
          Booking ID: <span className="font-bold text-primary">{bookingId}</span>
        </p>
      )}
      
      <p className="mt-3 text-xs text-muted-foreground text-center">
        Present this code or provide the Booking ID to an admin at the event entrance for verification.
      </p>
    </div>
  );
}
