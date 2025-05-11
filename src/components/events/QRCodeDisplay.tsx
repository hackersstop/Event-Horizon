
interface QRCodeDisplayProps {
  data: string; // This should now be the simple Booking ID for QR representation
  eventTitle?: string;
  fullQrDataString?: string; // Optional: The full composite QR string for display
}

// Placeholder for a more realistic QR Code SVG
// In a real app, you'd use a library like qrcode.react to generate an actual QR code image.
const QrCodePlaceholderIcon = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 40 40"
    xmlns="http://www.w3.org/2000/svg"
    className="text-card-foreground" // Uses text color for QR modules
    data-ai-hint="qr code graphic"
  >
    {/* Background of the SVG is transparent, relies on parent div's background */}
    {/* Finder Patterns (Top-Left, Top-Right, Bottom-Left) - black parts */}
    <rect x="3" y="3" width="9" height="9" fill="currentColor"/>
    <rect x="5" y="5" width="5" height="5" className="fill-card"/> {/* Inner white part */}
    <rect x="6" y="6" width="3" height="3" fill="currentColor"/>

    <rect x="28" y="3" width="9" height="9" fill="currentColor"/>
    <rect x="30" y="5" width="5" height="5" className="fill-card"/> {/* Inner white part */}
    <rect x="31" y="6" width="3" height="3" fill="currentColor"/>

    <rect x="3" y="28" width="9" height="9" fill="currentColor"/>
    <rect x="5" y="30" width="5" height="5" className="fill-card"/> {/* Inner white part */}
    <rect x="6" y="31" width="3" height="3" fill="currentColor"/>

    {/* Alignment Pattern (example, smaller) */}
    <rect x="25" y="25" width="6" height="6" fill="currentColor"/>
    <rect x="26.5" y="26.5" width="3" height="3" className="fill-card"/> {/* Inner white part */}
    

    {/* Simplified Data Modules (random-ish pattern) - filled with currentColor */}
    {[
      [14,3,2,2],[16,3,2,2],[18,3,2,2],[20,3,2,2],[22,3,2,2],[24,3,2,2],
      [3,14,2,2],[3,16,2,2],[3,18,2,2],[3,20,2,2],[3,22,2,2],[3,24,2,2],
      [14,5,2,2],[18,5,2,2],[22,5,2,2],
      [5,14,2,2],[5,18,2,2],[5,22,2,2],
      [14,14,2,2],[16,14,2,2],[18,14,2,2],[20,14,2,2],[22,14,2,2],[24,14,2,2],
      [14,16,2,2],[24,16,2,2],
      [14,18,2,2],[18,18,2,2],[22,18,2,2],
      [14,20,2,2],[24,20,2,2],
      [14,22,2,2],[16,22,2,2],[18,22,2,2],[20,22,2,2],[22,22,2,2],[24,22,2,2],
      [14,24,2,2],[20,24,2,2],
      [28,14,2,2],[30,14,2,2],[32,14,2,2],[34,14,2,2],
      [14,28,2,2],[14,30,2,2],[14,32,2,2],[14,34,2,2],
      [28,28,2,2],[30,28,2,2],[32,28,2,2],[34,28,2,2],[30,30,2,2],[34,32,2,2],[28,34,2,2],[32,30,2,2],
      [13,13,2,2],[13,25,2,2],[25,13,2,2], // Some more dots
      [8,20,2,2],[20,8,2,2],[8,8,2,2]
    ].map(([x, y, w, h], i) => (
      <rect key={i} x={x as number} y={y as number} width={w as number} height={h as number} fill="currentColor" />
    ))}
    {/* Add a comment about this being a placeholder */}
  </svg>
);


export function QRCodeDisplay({ data: bookingId, eventTitle, fullQrDataString }: QRCodeDisplayProps) {
  // data prop is now assumed to be the simple booking ID.

  const formattedFullQrParts = fullQrDataString
    ? fullQrDataString.split(';').map(part => {
        const [key, value] = part.split(':');
        return { key, value };
      })
    : [];

  return (
    <div className="mt-6 p-4 border border-dashed border-foreground/30 rounded-lg bg-card flex flex-col items-center max-w-xs mx-auto shadow-inner">
      <p className="text-sm text-muted-foreground text-center mb-1">Scan this QR code for ticket verification</p>
      {eventTitle && <p className="text-lg font-semibold text-center mb-2 text-secondary">{eventTitle}</p>}
      
      <div 
        className="w-48 h-48 bg-card p-2 rounded-md border border-foreground/20 shadow-sm" // Changed background to card for contrast with icon
        title={bookingId ? `QR Code for Ticket ID: ${bookingId}` : 'QR Data Not Available'}
        aria-label={`QR Code placeholder for event: ${eventTitle || 'booking'}. Ticket ID: ${bookingId || 'N/A'}`}
      >
        {bookingId ? (
          <QrCodePlaceholderIcon />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-center">
            N/A - QR Data Missing
          </div>
        )}
      </div>
      {/* Note: This is a placeholder. In a real application, use a QR code generation library. */}


      {bookingId && (
        <p className="mt-4 text-md font-semibold text-center">
          Ticket ID: <span className="font-bold text-primary select-all">{bookingId}</span>
        </p>
      )}
      
      {fullQrDataString && formattedFullQrParts.length > 0 && (
        <div className="mt-3 text-xs text-muted-foreground text-left bg-muted/50 p-2 rounded-md w-full">
          <p className="font-medium mb-1 text-foreground">Raw Stored QR Data (for info):</p>
          {formattedFullQrParts.map((part, index) => (
            <div key={index} className="truncate">
              <span className="font-semibold">{part.key}:</span> {part.value}
            </div>
          ))}
        </div>
      )}
      
      <p className="mt-4 text-xs text-muted-foreground text-center">
        Present this QR placeholder or provide the Ticket ID to an admin at the event entrance for verification.
        In a real app, this would be a scannable QR code.
      </p>
    </div>
  );
}
