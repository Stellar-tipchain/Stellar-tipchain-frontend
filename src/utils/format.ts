import { MAX_AMOUNT_DECIMALS } from "@/constants";
import type { Asset } from "@/types";

/**
 * Format an amount for display, trimming trailing zeros and grouping
 * thousands. Amounts arrive from Horizon as strings to avoid float drift, so
 * this accepts either a string or a number.
 */
export function formatAmount(amount: string | number): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString(undefined, { maximumFractionDigits: MAX_AMOUNT_DECIMALS });
}

/** Format an amount alongside its asset code, e.g. `12.5 USDC`. */
export function formatAssetAmount(amount: string | number, asset: Asset): string {
  return `${formatAmount(amount)} ${asset.code}`;
}

/** Human label for an asset: the code alone for XLM, `CODE:GABC…` otherwise. */
export function formatAssetLabel(asset: Asset): string {
  if (!asset.issuer) return asset.code;
  return `${asset.code}:${asset.issuer.slice(0, 4)}…`;
}

/** Stable key for an asset, used for React keys and select values. */
export function assetKey(asset: Asset): string {
  return `${asset.code}:${asset.issuer}`;
}

/** True when two assets refer to the same thing. */
export function isSameAsset(a: Asset, b: Asset): boolean {
  return a.code === b.code && a.issuer === b.issuer;
}

/** Format an ISO timestamp as a locale date and time. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

/** Format an ISO timestamp as a locale date only. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

/**
 * Relative time such as "3 hours ago". `now` is injectable so tests do not
 * depend on the wall clock.
 */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "—";

  const seconds = Math.round((now.getTime() - then.getTime()) / 1000);
  const future = seconds < 0;
  const abs = Math.abs(seconds);

  const [value, unit]: [number, Intl.RelativeTimeFormatUnit] =
    abs < MINUTE ? [abs, "second"]
    : abs < HOUR ? [Math.floor(abs / MINUTE), "minute"]
    : abs < DAY ? [Math.floor(abs / HOUR), "hour"]
    : abs < MONTH ? [Math.floor(abs / DAY), "day"]
    : abs < YEAR ? [Math.floor(abs / MONTH), "month"]
    : [Math.floor(abs / YEAR), "year"];

  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  return formatter.format(future ? value : -value, unit);
}

/** Shorten a transaction hash for display. */
export function truncateHash(hash: string, chars = 8): string {
  if (hash.length <= chars + 4) return hash;
  return `${hash.slice(0, chars)}…${hash.slice(-4)}`;
}

/** Format a fiat value, defaulting to USD. */
export function formatFiat(value: number, currency = "USD"): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });
}

/** Pluralise a noun against a count: `pluralize(1, "tip")` → `"1 tip"`. */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
