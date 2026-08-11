import { cn } from "@/lib/cn";

/**
 * A placeholder block shown while content loads.
 *
 * `aria-hidden` keeps a screen reader from announcing a wall of empty boxes —
 * the containing region carries `aria-busy` instead.
 */
export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      // The app renders on a dark background, so the placeholder is a lighter
      // grey than the surface rather than the near-white it used to be.
      className={cn("animate-pulse bg-gray-700 rounded motion-reduce:animate-none", className)}
    />
  );
}
