/**
 * Shared domain types.
 *
 * These mirror the shapes returned by the backend API and by Horizon, so that
 * pages and services agree on a single definition instead of re-declaring
 * inline object types at every call site.
 */

/** A Stellar asset. `issuer` is an empty string for the native asset (XLM). */
export interface Asset {
  code: string;
  issuer: string;
}

/** A registered creator, as returned by `GET /creators/:username`. */
export interface Creator {
  username: string;
  bio: string;
  stellarAddress: string;
  acceptedAssets: Asset[];
  avatarUrl?: string;
  createdAt?: string;
}

/** The trimmed creator shape returned by the list endpoint `GET /creators`. */
export interface CreatorSummary {
  username: string;
  bio?: string;
  avatarUrl?: string;
  tipCount?: number;
  totalReceived?: string;
}

/** Direction of a payment relative to the wallet being viewed. */
export type PaymentDirection = "sent" | "received";

/** A single payment record derived from Horizon's payments endpoint. */
export interface PaymentRecord {
  timestamp: string;
  amount: string;
  direction: PaymentDirection;
  counterpart: string;
  pagingToken: string;
  asset: Asset;
  transactionHash?: string;
}

/** A cursor-paginated slice of records. */
export interface Page<T> {
  records: T[];
  nextCursor: string | null;
}

/** A balance entry for a single asset held by an account. */
export interface AssetBalance {
  asset: Asset;
  balance: string;
  /** Amount that cannot be spent because of reserves or liabilities. */
  locked?: string;
}

/** Feedback severity used by toasts and alerts. */
export type Severity = "success" | "error" | "info" | "warning";

/** Lifecycle of a tip transaction, surfaced in the UI as it progresses. */
export type TipStatus =
  | "idle"
  | "building"
  | "signing"
  | "submitting"
  | "success"
  | "error";

/** The result of a successfully submitted tip. */
export interface TipReceipt {
  hash: string;
  amount: string;
  asset: Asset;
  destination: string;
}
