import { cn } from "@/lib/cn";

const TONES = {
  neutral: "bg-gray-700 text-gray-300",
  success: "bg-green-900 text-green-300",
  error: "bg-red-900 text-red-300",
  info: "bg-blue-900 text-blue-300",
  warning: "bg-amber-900 text-amber-300",
} as const;

interface BadgeProps {
  children: React.ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}

/** A small status pill, used for payment direction and network labels. */
export default function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
