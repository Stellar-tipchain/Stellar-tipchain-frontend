import { cn } from "@/lib/cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Rendered to the right of the title, e.g. a primary action button. */
  action?: React.ReactNode;
  className?: string;
}

/** The heading block at the top of a page, so titles stay visually consistent. */
export default function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <header className={cn("flex items-start justify-between gap-4 mb-6", className)}>
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="text-gray-400 mt-1 text-sm">{description}</p>}
      </div>
      {action}
    </header>
  );
}
