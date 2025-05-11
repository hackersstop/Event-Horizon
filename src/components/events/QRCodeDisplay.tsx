interface QRCodeDisplayProps {
  data: string;
  eventTitle?: string;
}

export function QRCodeDisplay({ data, eventTitle }: QRCodeDisplayProps) {
  // In a real app, use a library like qrcode.react to generate an actual QR code
  // For example:
  // import QRCode from 'qrcode.react';
  // return <QRCode value={data} size={256} level="H" />;

  return (
    <div className="mt-6 p-4 border border-dashed border-foreground/50 rounded-lg bg-muted/30 flex flex-col items-center max-w-xs mx-auto shadow-inner">
      {eventTitle && <p className="text-sm font-medium text-center mb-2">Ticket for: {eventTitle}</p>}
      <div 
        className="w-48 h-48 bg-foreground flex items-center justify-center text-background text-xs p-2 break-all"
        title={`QR Data: ${data}`}
        aria-label={`QR Code for event: ${eventTitle || 'booking'}`}
        data-ai-hint="qr code"
      >
        <span className="text-center"> Placeholder QR Code <br /> (Data: {data.substring(0, 20)}...)</span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground text-center">
        Present this code at the event entrance.
      </p>
    </div>
  );
}
