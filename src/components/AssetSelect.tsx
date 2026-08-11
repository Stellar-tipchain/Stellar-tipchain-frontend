"use client";

import { useId } from "react";
import { assetKey, formatAssetLabel } from "@/utils/format";
import { cn } from "@/lib/cn";
import type { Asset } from "@/types";

interface AssetSelectProps {
  assets: Asset[];
  value: Asset;
  onChange: (asset: Asset) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Picks which asset a tip is denominated in. Options come from the creator's
 * accepted-asset list, so a sender cannot pick something the recipient has no
 * trustline for.
 */
export default function AssetSelect({
  assets,
  value,
  onChange,
  label = "Asset",
  disabled = false,
  className,
}: AssetSelectProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1 text-sm">
      <label htmlFor={id} className="text-gray-300">
        {label}
      </label>
      <select
        id={id}
        value={assetKey(value)}
        disabled={disabled || assets.length <= 1}
        onChange={(e) => {
          const next = assets.find((a) => assetKey(a) === e.target.value);
          if (next) onChange(next);
        }}
        className={cn(
          "px-3 py-2 rounded-lg bg-gray-700 text-white",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          className
        )}
      >
        {assets.map((asset) => (
          <option key={assetKey(asset)} value={assetKey(asset)}>
            {formatAssetLabel(asset)}
          </option>
        ))}
      </select>
    </div>
  );
}
