
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

const QrCodePlaceholderIcon = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-foreground"
    data-ai-hint="qr code pattern"
  >
    <rect width="30" height="30" fill="currentColor" />
    <rect x="70" width="30" height="30" fill="currentColor" />
    <rect y="70" width="30" height="30" fill="currentColor" />
    <rect x="35" y="35" width="30" height="30" fill="currentColor" />
    <rect x="10" y="10" width="10" height="10" fill="currentColor" />
    <rect x="80" y="10" width="10" height="10" fill="currentColor" />
    <rect x="10" y="80" width="10" height="10" fill="currentColor" />
    <rect x="50" y="0" width="10" height="10" fill="currentColor" />
    <rect x="0" y="50" width="10" height="10" fill="currentColor" />
    <rect x="90" y="50" width="10" height="10" fill="currentColor" />
    <rect x="50" y="90" width="10" height="10" fill="currentColor" />
    <rect x="70" y="70" width="10" height="10" fill="currentColor" />
    <rect x="85" y="85" width="10" height="10" fill="currentColor" />
  </svg>
);


export function QRCodeDisplay({ data, eventTitle }: QRCodeDisplayProps) {
  const bookingId = extractBookingId(data);

  const formattedQrParts = data
    ? data.split(';').map(part => {
        const [key, value] = part.split(':');
        return { key, value };
      })
    : [];

  return (
    <div className="mt-6 p-4 border border-dashed border-foreground/30 rounded-lg bg-card flex flex-col items-center max-w-xs mx-auto shadow-inner">
      {eventTitle && <p className="text-sm font-medium text-center mb-2 text-secondary">{eventTitle}</p>}
      
      <div 
        className="w-48 h-48 bg-background p-2 rounded-md border border-foreground/20"
        title={data ? `QR Data: ${data}` : 'QR Data Not Available'}
        aria-label={`QR Code placeholder for event: ${eventTitle || 'booking'}`}
      >
        {data ? (
          <QrCodePlaceholderIcon />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-center">
            N/A - QR Data Missing
          </div>
        )}
      </div>

      {bookingId && (
        <p className="mt-4 text-md font-semibold text-center">
          Ticket ID: <span className="font-bold text-primary select-all">{bookingId}</span>
        </p>
      )}
      
      {data && formattedQrParts.length > 0 && (
        <div className="mt-3 text-xs text-muted-foreground text-left bg-muted/50 p-2 rounded-md w-full">
          <p className="font-medium mb-1 text-foreground">Raw QR Data:</p>
          {formattedQrParts.map((part, index) => (
            <div key={index} className="truncate">
              <span className="font-semibold">{part.key}:</span> {part.value}
            </div>
          ))}
        </div>
      )}
      
      <p className="mt-4 text-xs text-muted-foreground text-center">
        Present this QR placeholder or provide the Ticket ID to an admin at the event entrance for verification.
      </p>
    </div>
  );
}
