import { cn } from "@/lib/cn";

const SIZES = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-10 h-10 border-4",
} as const;

interface SpinnerProps {
  size?: keyof typeof SIZES;
  className?: string;
  /** Announced to screen readers while the spinner is visible. */
  label?: string;
}

/** An indeterminate loading indicator. */
export default function Spinner({ size = "md", className, label = "Loading" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block rounded-full border-current border-r-transparent animate-spin align-[-0.125em]",
        SIZES[size],
        className
      )}
    />
  );
}
