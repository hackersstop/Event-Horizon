
import React from 'react'; // Added React import for JSX

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
    viewBox="0 0 50 50"
    xmlns="http://www.w3.org/2000/svg"
    className="text-card-foreground"
    data-ai-hint="qr code graphic"
    shapeRendering="crispEdges" // Helps make pixels sharp
  >
    {/* Background for quiet zone (ensure parent provides padding) */}
    {/* <rect width="100%" height="100%" fill="white"/> */}

    {/* Finder Patterns (Top-Left, Top-Right, Bottom-Left) - typical 7x7 module size */}
    {/* Top-left */}
    <rect x="3" y="3" width="7" height="7" fill="currentColor"/>
    <rect x="4" y="4" width="5" height="5" className="fill-card"/>
    <rect x="5" y="5" width="3" height="3" fill="currentColor"/>

    {/* Top-right */}
    <rect x="40" y="3" width="7" height="7" fill="currentColor"/>
    <rect x="41" y="4" width="5" height="5" className="fill-card"/>
    <rect x="42" y="5" width="3" height="3" fill="currentColor"/>

    {/* Bottom-left */}
    <rect x="3" y="40" width="7" height="7" fill="currentColor"/>
    <rect x="4" y="41" width="5" height="5" className="fill-card"/>
    <rect x="5" y="42" width="3" height="3" fill="currentColor"/>

    {/* Alignment Pattern (example, a 5x5 module pattern if space allows, often smaller) */}
    {/* This is a simplified alignment pattern example for a small QR code */}
    <rect x="35" y="35" width="5" height="5" fill="currentColor"/>
    <rect x="36" y="36" width="3" height="3" className="fill-card"/>
    <rect x="37" y="37" width="1" height="1" fill="currentColor"/>

    {/* Timing Patterns (Horizontal and Vertical - alternating modules) */}
    {/* Horizontal */}
    {[...Array(28)].map((_, i) => (
      i % 2 === 0 && <rect key={`th-${i}`} x={10 + i * 1} y="8" width="1" height="1" fill="currentColor"/>
    ))}
    {/* Vertical */}
    {[...Array(28)].map((_, i) => (
      i % 2 === 0 && <rect key={`tv-${i}`} x="8" y={10 + i * 1} width="1" height="1" fill="currentColor"/>
    ))}

    {/* Data Modules (many small squares representing data) */}
    {/* This needs to be dense and somewhat random-looking. */}
    {Array.from({ length: 25 }).flatMap((_, r) => 
      Array.from({ length: 25 }).map((_, c) => {
        const x = 11 + c * 1.1; // Adjusted for denser packing
        const y = 11 + r * 1.1; // Adjusted for denser packing
        // Avoid drawing over finder/alignment patterns (rough check)
        if ( (x > 2 && x < 10 && y > 2 && y < 10) || 
             (x > 39 && x < 47 && y > 2 && y < 10) ||
             (x > 2 && x < 10 && y > 39 && y < 47) ||
             (x > 34 && x < 40 && y > 34 && y < 40) ) {
          return null;
        }
        // Avoid drawing over timing patterns
        if ( (y >= 7.5 && y < 9.5 && x >=9.5 && x < 38.5) || (x >=7.5 && x < 9.5 && y >=9.5 && y < 38.5)) {
            return null;
        }

        if (Math.random() > 0.45) { // % of black modules
          return <rect key={`d-${r}-${c}`} x={x} y={y} width="1" height="1" fill="currentColor"/>;
        }
        return null;
      })
    )}
    
    {/* A few slightly larger, more structured "data" blocks to vary pattern */}
    <rect x="13" y="20" width="4" height="2" fill="currentColor" />
    <rect x="20" y="15" width="2" height="5" fill="currentColor" />
    <rect x="25" y="28" width="6" height="3" fill="currentColor" />
    <rect x="15" y="35" width="3" height="3" fill="currentColor" />
    <rect x="30" y="12" width="2" height="4" fill="currentColor" />
    <rect x="22" y="22" width="3" height="3" className="fill-card" /> 
    <rect x="23" y="23" width="1" height="1" fill="currentColor" />

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
      
      {bookingId && (
        <p className="mt-3 text-md font-mono text-center text-primary bg-primary/10 px-3 py-1 rounded-md">
          Ticket ID: <span className="font-bold">{bookingId}</span>
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
        In a real app, this would be a scannable QR code generated by a library.
      </p>
    </div>
  );
}

