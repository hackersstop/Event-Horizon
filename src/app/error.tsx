'use client'; // Error components must be Client Components
 
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);
 
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
      <h2 className="text-3xl font-semibold text-destructive mb-2">Oops, Something Went Wrong!</h2>
      <p className="text-muted-foreground mb-6">
        We encountered an unexpected issue. Please try again.
      </p>
      <p className="text-sm text-foreground/70 mb-6">
        Error details: {error.message}
        {error.digest && <span className="block text-xs">Digest: {error.digest}</span>}
      </p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        Try Again
      </Button>
    </div>
  );
}
