import { cn } from "@/lib/cn";

const SIZES = {
  sm: "w-8 h-8 text-sm",
  md: "w-14 h-14 text-xl",
  lg: "w-20 h-20 text-3xl",
} as const;

/**
 * Deterministic background colour per name, so the same creator keeps the same
 * avatar colour on every page rather than flickering between renders.
 */
const PALETTE = [
  "bg-blue-600",
  "bg-purple-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
];

export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 1_000_003;
  }
  return PALETTE[hash % PALETTE.length];
}

interface AvatarProps {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}

/** An initials avatar. Decorative — the username is always shown alongside it. */
export default function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shrink-0",
        SIZES[size],
        avatarColor(name),
        className
      )}
    >
      {name[0]?.toUpperCase() ?? "?"}
    </div>
  );
}
