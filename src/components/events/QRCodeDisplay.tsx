
interface QRCodeDisplayProps {
  data: string;
  eventTitle?: string;
}

// Helper function to extract booking ID from QR data string
const extractBookingId = (qrData: string): string | null => {
  if (!qrData || typeof qrData !== 'string') return null;
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

  const formattedQrData = data
    ? data.split(';')
      .map(part => {
        const firstColonIndex = part.indexOf(':');
        if (firstColonIndex === -1) return part; // No colon, return as is
        const key = part.substring(0, firstColonIndex);
        const value = part.substring(firstColonIndex + 1);
        return `${key}: ${value}`; // Add space after the first colon
      })
      .join(';\n')
    : null;

  return (
    <div className="mt-6 p-4 border border-dashed border-foreground/50 rounded-lg bg-muted/30 flex flex-col items-center max-w-xs mx-auto shadow-inner">
      {eventTitle && <p className="text-sm font-medium text-center mb-2">Ticket for: {eventTitle}</p>}
      
      <div 
        className="w-48 h-48 bg-foreground flex items-center justify-center text-background p-2 break-all overflow-auto font-mono"
        title={`QR Data: ${data || 'Not available'}`}
        aria-label={`QR Code for event: ${eventTitle || 'booking'}`}
        data-ai-hint="qr code pattern"
      >
        {formattedQrData ? (
          <span className="text-center text-[11px] leading-snug whitespace-pre-wrap font-medium">
            {formattedQrData}
          </span>
        ) : (
          <span className="text-center text-sm font-medium">N/A - QR Data Missing</span>
        )}
      </div>

      {bookingId && (
        <p className="mt-3 text-md font-semibold text-center">
          Ticket ID: <span className="font-bold text-primary">{bookingId}</span>
        </p>
      )}
      
      <p className="mt-3 text-xs text-muted-foreground text-center">
        Present this code or provide the Ticket ID to an admin at the event entrance for verification.
      </p>
    </div>
  );
}
