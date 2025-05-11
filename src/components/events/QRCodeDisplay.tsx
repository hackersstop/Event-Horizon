
interface QRCodeDisplayProps {
  data: string; // This should now be the simple Booking ID for QR representation
  eventTitle?: string;
  fullQrDataString?: string; // Optional: The full composite QR string for display
}

// New, more realistic QR Code SVG placeholder
const QrCodePlaceholderIcon = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 50 50" // Increased viewbox for more detail
    xmlns="http://www.w3.org/2000/svg"
    className="text-card-foreground"
    data-ai-hint="qr code graphic"
  >
    {/* Quiet zone - ensure parent div provides this with padding or use a white rect */}
    {/* Finder Patterns (Top-Left, Top-Right, Bottom-Left) */}
    {/* Top-left */}
    <rect x="4" y="4" width="10" height="10" fill="currentColor"/>
    <rect x="6" y="6" width="6" height="6" className="fill-card"/>
    <rect x="7" y="7" width="4" height="4" fill="currentColor"/>

    {/* Top-right */}
    <rect x="36" y="4" width="10" height="10" fill="currentColor"/>
    <rect x="38" y="6" width="6" height="6" className="fill-card"/>
    <rect x="39" y="7" width="4" height="4" fill="currentColor"/>

    {/* Bottom-left */}
    <rect x="4" y="36" width="10" height="10" fill="currentColor"/>
    <rect x="6" y="38" width="6" height="6" className="fill-card"/>
    <rect x="7" y="39" width="4" height="4" fill="currentColor"/>

    {/* Alignment Pattern (example) */}
    <rect x="32" y="32" width="7" height="7" fill="currentColor"/>
    <rect x="33.5" y="33.5" width="4" height="4" className="fill-card"/>
    <rect x="34.5" y="34.5" width="2" height="2" fill="currentColor"/>

    {/* Timing Patterns (simplified) */}
    {[...Array(7)].map((_, i) => (
      <React.Fragment key={`timing-h-${i}`}>
        <rect x={16 + i * 2} y="10" width="1.5" height="1.5" fill="currentColor" />
        { i % 2 === 0 && <rect x={17 + i * 2} y="10" width="1.5" height="1.5" className="fill-card" />}
      </React.Fragment>
    ))}
     {[...Array(7)].map((_, i) => (
      <React.Fragment key={`timing-v-${i}`}>
        <rect x="10" y={16 + i * 2} width="1.5" height="1.5" fill="currentColor" />
         { i % 2 === 0 && <rect x="10" y={17 + i * 2} width="1.5" height="1.5" className="fill-card" />}
      </React.Fragment>
    ))}


    {/* Simplified Data Modules (denser and more varied pattern) */}
    {/* Using a more structured approach for "random" blocks */}
    {
      [
        // Block 1
        [16,4,2,2], [18,4,2,2], [20,4,2,2], [22,4,2,2], [24,4,2,2], [26,4,2,2], [28,4,2,2], [30,4,2,2], [32,4,2,2],
        [16,6,2,2], [20,6,2,2], [24,6,2,2], [28,6,2,2], [32,6,2,2],
        [16,8,2,2], [18,8,2,2], [22,8,2,2], [26,8,2,2], [30,8,2,2], 
        // Block 2 (Vertical)
        [4,16,2,2], [4,18,2,2], [4,20,2,2], [4,22,2,2], [4,24,2,2], [4,26,2,2], [4,28,2,2], [4,30,2,2], [4,32,2,2],
        [6,16,2,2], [6,20,2,2], [6,24,2,2], [6,28,2,2], [6,32,2,2],
        [8,16,2,2], [8,18,2,2], [8,22,2,2], [8,26,2,2], [8,30,2,2],
        // Central Data Area
        [16,16,2,2], [18,16,2,2], [20,16,2,2], [22,16,2,2], [24,16,2,2], [26,16,2,2], [28,16,2,2], [30,16,2,2], [32,16,2,2], [34,16,2,2], [36,16,2,2],
        [16,18,2,2],                                           [26,18,2,2], [28,18,2,2],                                           [36,18,2,2],
        [16,20,2,2], [18,20,2,2], [20,20,2,2],                  [26,20,2,2],                  [30,20,2,2], [32,20,2,2], [34,20,2,2], [36,20,2,2],
        [16,22,2,2], [18,22,2,2],                               [28,22,2,2], [30,22,2,2],                                           [36,22,2,2],
        [16,24,2,2], [18,24,2,2], [20,24,2,2], [22,24,2,2], [24,24,2,2], [26,24,2,2], [28,24,2,2], [30,24,2,2], [32,24,2,2], [34,24,2,2], [36,24,2,2],
        [16,26,2,2],                                           [24,26,2,2],                                                       [34,26,2,2], [36,26,2,2],
        [16,28,2,2], [18,28,2,2], [20,28,2,2], [22,28,2,2],                  [28,28,2,2], [30,28,2,2], [32,28,2,2], [34,28,2,2], [36,28,2,2],
        [16,30,2,2], [18,30,2,2],                                           [26,30,2,2],                                           [34,30,2,2], [36,30,2,2],
        [16,32,2,2], [18,32,2,2], [20,32,2,2], [22,32,2,2], [24,32,2,2],                                           [32,32,2,2], [34,32,2,2], [36,32,2,2],
        [16,34,2,2],                                                                                           [30,34,2,2], [32,34,2,2], [34,34,2,2], [36,34,2,2],
        [16,36,2,2], [18,36,2,2], [20,36,2,2], [22,36,2,2], [24,36,2,2], [26,36,2,2], [28,36,2,2], [30,36,2,2], [32,36,2,2], [34,36,2,2], [36,36,2,2],
        // Some more varied blocks
        [20,30,4,2], [26,26,2,4], [22,18,4,2] 
      ].map(([x, y, w, h], i) => {
        // Alternate fill for a more "random" look
        const fillClass = i % 3 === 0 ? "fill-card" : "currentColor";
        return (
          <rect key={`data-${i}`} x={x as number} y={y as number} width={w as number} height={h as number} fill={fillClass} />
        )
      })
    }
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
        className="w-48 h-48 bg-white p-2 rounded-md border border-foreground/20 shadow-sm" // Explicit white background for QR
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
