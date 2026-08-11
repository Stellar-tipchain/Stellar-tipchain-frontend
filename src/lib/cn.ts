/**
 * Join class names, dropping anything falsy.
 *
 * Keeps conditional Tailwind classes readable at call sites:
 * `cn("px-4", isActive && "bg-blue-600", className)`.
 */
export type ClassValue = string | number | bigint | boolean | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
}
