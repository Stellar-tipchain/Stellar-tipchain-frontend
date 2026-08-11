import Spinner from "@/components/Spinner";

/** Route-level fallback shown while a page segment streams in. */
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" aria-busy="true">
      <Spinner size="lg" label="Loading page" className="text-blue-500" />
    </div>
  );
}
