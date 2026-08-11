import { cn } from "@/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Adds a hover state; use for cards that are themselves links or buttons. */
  interactive?: boolean;
  as?: "div" | "section" | "article" | "li";
}

/** The standard raised surface used for forms, panels and list rows. */
export default function Card({
  children,
  className,
  interactive = false,
  as: Tag = "div",
}: CardProps) {
  return (
    <Tag
      className={cn(
        "bg-gray-800 rounded-xl p-6",
        interactive && "hover:bg-gray-700 transition",
        className
      )}
    >
      {children}
    </Tag>
  );
}
