import { cn } from "@/lib/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  /** An optional call to action, typically a Button or Link. */
  action?: React.ReactNode;
  className?: string;
}

/** Shown when a list has loaded successfully but has nothing in it. */
export default function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-12 text-center", className)}>
      <p className="text-lg font-medium text-gray-300">{title}</p>
      {description && <p className="text-sm text-gray-500 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
