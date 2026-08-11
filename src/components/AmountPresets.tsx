"use client";

import { TIP_PRESETS } from "@/constants";
import { cn } from "@/lib/cn";

interface AmountPresetsProps {
  value: string;
  onSelect: (amount: string) => void;
  assetCode: string;
  disabled?: boolean;
}

/** Quick-pick amounts, so the common case does not require typing. */
export default function AmountPresets({
  value,
  onSelect,
  assetCode,
  disabled = false,
}: AmountPresetsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={`Quick ${assetCode} amounts`}>
      {TIP_PRESETS.map((preset) => {
        const active = value === preset;
        return (
          <button
            key={preset}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onSelect(preset)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              active ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            )}
          >
            {preset} {assetCode}
          </button>
        );
      })}
    </div>
  );
}
