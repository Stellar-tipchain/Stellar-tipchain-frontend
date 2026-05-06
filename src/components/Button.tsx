import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline";
}

export default function Button({ variant = "solid", className = "", ...props }: ButtonProps) {
  const base = "px-5 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "outline"
      ? "border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
      : "bg-blue-600 text-white hover:bg-blue-500";

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
