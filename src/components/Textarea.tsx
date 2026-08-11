"use client";

import { TextareaHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  label: string;
  error?: string;
  /** When set, a live character counter is shown under the field. */
  maxLength?: number;
}

/** A labelled multi-line input with an optional character counter. */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, maxLength, className, value, ...props },
  ref
) {
  const id = useId();
  const errorId = `${id}-error`;
  const count = typeof value === "string" ? value.length : 0;
  const overLimit = maxLength !== undefined && count > maxLength;

  return (
    <div className="flex flex-col gap-1 text-sm">
      <label htmlFor={id} className="text-gray-300">
        {label}
      </label>

      <textarea
        {...props}
        id={id}
        ref={ref}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-500 resize-none",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          error && "ring-2 ring-red-500",
          className
        )}
      />

      {maxLength !== undefined && (
        <p
          className={cn("text-xs text-right", overLimit ? "text-red-400" : "text-gray-500")}
          aria-live="polite"
        >
          {count}/{maxLength}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

export default Textarea;
