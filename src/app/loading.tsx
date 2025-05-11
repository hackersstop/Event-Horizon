import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[200]">
      <Spinner className="h-12 w-12 text-primary" />
    </div>
  );
}
