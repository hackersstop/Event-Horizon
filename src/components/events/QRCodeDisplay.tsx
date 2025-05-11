
import React from 'react';

interface QRCodeDisplayProps {
  qrDataToEncode: string; // This is the actual data for the QR code (e.g., full Firestore Booking ID)
  displayTicketId: string; // The 8-digit numeric ID for display
  eventTitle?: string;
  verifiableId: string; // The full ID that the QR code represents, for display
}

// Enhanced SVG QR Code Placeholder
const EnhancedQrCodePlaceholderIcon = ({ dataHint }: { dataHint: string }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 50 50"
    xmlns="http://www.w3.org/2000/svg"
    className="text-card-foreground"
    data-ai-hint="qr code graphic"
    shapeRendering="crispEdges"
    aria-label={`QR Code representing: ${dataHint}`}
  >
    {/* Background - ensure parent container has padding for quiet zone if needed */}
    {/* <rect width="50" height="50" fill="white"/> */}

    {/* Finder Patterns (Typical 7x7 modules) */}
    {[
      { x: 3, y: 3 }, // Top-left
      { x: 40, y: 3 }, // Top-right
      { x: 3, y: 40 }, // Bottom-left
    ].map((pos, idx) => (
      <React.Fragment key={`finder-${idx}`}>
        <rect x={pos.x} y={pos.y} width="7" height="7" fill="currentColor" />
        <rect x={pos.x + 1} y={pos.y + 1} width="5" height="5" className="fill-card" /> {/* Or fill="white" if card isn't white */}
        <rect x={pos.x + 2} y={pos.y + 2} width="3" height="3" fill="currentColor" />
      </React.Fragment>
    ))}

    {/* Alignment Pattern (Simplified example, e.g., 5x5 if QR is large enough) */}
    {/* This is a very basic representation of one possible alignment pattern */}
    <rect x="36" y="36" width="5" height="5" fill="currentColor" /> 
    <rect x="37" y="37" width="3" height="3" className="fill-card" />
    <rect x="38" y="38" width="1" height="1" fill="currentColor" />


    {/* Timing Patterns (Alternating black/white modules) */}
    {/* Horizontal (between top-left and top-right finders) */}
    {Array.from({ length: 28 }).map((_, i) => ( // 40-3-7 - (3+7) = 23. Length should connect finders.
      i % 2 === 0 && <rect key={`th-${i}`} x={10 + i} y="8" width="1" height="1" fill="currentColor" />
    ))}
    {/* Vertical (between top-left and bottom-left finders) */}
    {Array.from({ length: 28 }).map((_, i) => (
      i % 2 === 0 && <rect key={`tv-${i}`} x="8" y={10 + i} width="1" height="1" fill="currentColor" />
    ))}
    
    {/* Data & Error Correction Modules (Simplified pseudo-random pattern) */}
    {/* This creates a dense, varied pattern. */}
    {Array.from({ length: 26 }).flatMap((_, r) => // Grid for data modules
      Array.from({ length: 26 }).map((_, c) => {
        const x = 11 + c * 1.15; 
        const y = 11 + r * 1.15;
        
        // Basic checks to avoid drawing over main patterns (very simplified)
        if ( (x > 2 && x < 10 && y > 2 && y < 10) || // TL finder
             (x > 39 && x < 47 && y > 2 && y < 10) || // TR finder
             (x > 2 && x < 10 && y > 39 && y < 47) || // BL finder
             (x > 35 && x < 41 && y > 35 && y < 41) || // Approx Alignment
             (y >= 7.5 && y < 9.5 && x >= 9.5 && x < 38.5) || // Horizontal Timing
             (x >= 7.5 && x < 9.5 && y >= 9.5 && y < 38.5)    // Vertical Timing
        ) {
          return null;
        }

        // Pseudo-randomly fill modules
        if (Math.random() < 0.5) { 
          // Add more variations in module size for visual complexity
          const size = Math.random() < 0.8 ? 1 : (Math.random() < 0.7 ? 1.5 : 2);
          return <rect key={`d-${r}-${c}`} x={x} y={y} width={size} height={size} fill="currentColor" />;
        }
        return null;
      })
    )}
    {/* Some larger "data blocks" for visual structure */}
     <rect x="15" y="25" width="3" height="5" fill="currentColor" />
     <rect x="25" y="15" width="5" height="3" fill="currentColor" />
     <rect x="22" y="30" width="6" height="2" fill="currentColor" />
     <rect x="30" y="22" width="2" height="6" fill="currentColor" /> {/* Corrected y_coordinate, width_attribute, height_attribute */}
  </svg>
);


export function QRCodeDisplay({ qrDataToEncode, displayTicketId, eventTitle, verifiableId }: QRCodeDisplayProps) {

  return (
    <div className="mt-4 p-4 border border-dashed border-foreground/30 rounded-lg bg-card flex flex-col items-center max-w-xs mx-auto shadow-inner">
      <p className="text-sm text-muted-foreground text-center mb-1">Scan for ticket verification</p>
      {eventTitle && <p className="text-lg font-semibold text-center mb-2 text-secondary">{eventTitle}</p>}
      
      <div 
        className="w-48 h-48 bg-white p-2 rounded-md border border-foreground/20 shadow-sm"
        title={`QR Code for Verifiable ID: ${verifiableId}`}
      >
        {qrDataToEncode ? (
          <EnhancedQrCodePlaceholderIcon dataHint={qrDataToEncode} /> {/* Changed dataHint to qrDataToEncode */}
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-center">
            QR Data Missing
          </div>
        )}
      </div>
      
      {displayTicketId && (
        <p className="mt-3 text-lg font-bold text-center text-primary bg-primary/10 px-3 py-1.5 rounded-md">
          Ticket Ref: {displayTicketId}
        </p>
      )}

      {verifiableId && (
         <p className="mt-1 text-xs text-muted-foreground text-center break-all">
           (Verifiable ID: {verifiableId})
         </p>
      )}
      
      <p className="mt-4 text-xs text-muted-foreground text-center">
        Present this QR placeholder or provide the Ticket Reference to an admin for verification.
      </p>
    </div>
  );
}
