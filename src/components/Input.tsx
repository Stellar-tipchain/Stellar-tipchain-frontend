"use client";

import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
  hint?: string;
  /** Rendered inside the field on the right, e.g. an asset code or a max button. */
  suffix?: React.ReactNode;
}

/**
 * A labelled text input wired for accessibility: the label is associated with
 * the field, and any error or hint is linked through `aria-describedby` so it
 * is announced rather than only shown.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, suffix, className, ...props },
  ref
) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1 text-sm">
      <label htmlFor={id} className="text-gray-300">
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>

      <div className="relative">
        <input
          {...props}
          id={id}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "ring-2 ring-red-500",
            suffix && "pr-16",
            className
          )}
        />
        {suffix && (
          <span className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-400">
            {suffix}
          </span>
        )}
      </div>

      {hint && !error && (
        <p id={hintId} className="text-xs text-gray-500">
          {hint}
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

export default Input;
