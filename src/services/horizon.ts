import { HORIZON_ENDPOINT } from "@/config/env";
import { PAGE_SIZE, XLM } from "@/constants";
import type { Asset, AssetBalance, Page, PaymentRecord } from "@/types";

/** Re-exported for callers that still import the payment shape from here. */
export type Payment = PaymentRecord;

/** Horizon's raw record shapes, narrowed to the fields this app reads. */
interface RawPayment {
  type?: string;
  created_at?: string;
  amount?: string;
  from?: string;
  to?: string;
  paging_token?: string;
  transaction_hash?: string;
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
}

interface RawBalance {
  balance?: string;
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
  selling_liabilities?: string;
}

async function horizonGet<T>(path: string, signal?: AbortSignal): Promise<T | null> {
  const res = await fetch(`${HORIZON_ENDPOINT}${path}`, { signal });
  // A 404 means the account has never been funded, which is a normal state for
  // a brand-new wallet rather than an error worth surfacing.
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Horizon error ${res.status}`);
  return (await res.json()) as T;
}

/** Convert a Horizon asset triple into the app's `Asset` shape. */
function toAsset(raw: { asset_type?: string; asset_code?: string; asset_issuer?: string }): Asset {
  if (raw.asset_type === "native" || !raw.asset_code) return XLM;
  return { code: raw.asset_code, issuer: raw.asset_issuer ?? "" };
}

/**
 * A page of payments for an account, newest first.
 *
 * Both native and issued-asset payments are returned; the previous version
 * dropped everything that was not XLM, which hid tips sent in USDC from the
 * very history page meant to show them.
 */
export async function getPaymentHistory(
  address: string,
  cursor?: string,
  signal?: AbortSignal
): Promise<Page<PaymentRecord>> {
  const params = new URLSearchParams({ order: "desc", limit: String(PAGE_SIZE) });
  if (cursor) params.set("cursor", cursor);

  const data = await horizonGet<{ _embedded?: { records?: RawPayment[] } }>(
    `/accounts/${address}/payments?${params}`,
    signal
  );
  if (!data) return { records: [], nextCursor: null };

  const raw = data._embedded?.records ?? [];

  const records: PaymentRecord[] = raw
    .filter((r) => r.type === "payment")
    .map((r) => ({
      timestamp: r.created_at ?? "",
      amount: r.amount ?? "0",
      direction: r.to === address ? "received" : "sent",
      counterpart: (r.to === address ? r.from : r.to) ?? "",
      pagingToken: r.paging_token ?? "",
      transactionHash: r.transaction_hash,
      asset: toAsset(r),
    }));

  // The cursor comes from the last raw record, not the last filtered one:
  // paging from a filtered record would silently skip everything dropped after it.
  const last = raw[raw.length - 1];
  const nextCursor = raw.length === PAGE_SIZE && last?.paging_token ? last.paging_token : null;

  return { records, nextCursor };
}

/**
 * Balances held by an account. Returns an empty list for an unfunded account.
 *
 * `available` subtracts selling liabilities, which are locked into open offers
 * and cannot be spent on a payment.
 */
export async function getBalances(
  address: string,
  signal?: AbortSignal
): Promise<AssetBalance[]> {
  const data = await horizonGet<{ balances?: RawBalance[] }>(`/accounts/${address}`, signal);
  if (!data) return [];

  return (data.balances ?? [])
    .filter((b) => b.asset_type !== "liquidity_pool_shares")
    .map((b) => ({
      asset: toAsset(b),
      balance: b.balance ?? "0",
      locked: b.selling_liabilities,
    }));
}

/** The spendable balance for one asset, or "0" when the account does not hold it. */
export function availableBalance(balances: AssetBalance[], asset: Asset): string {
  const entry = balances.find(
    (b) => b.asset.code === asset.code && b.asset.issuer === asset.issuer
  );
  if (!entry) return "0";
  const locked = Number(entry.locked ?? 0);
  const available = Number(entry.balance) - (Number.isFinite(locked) ? locked : 0);
  return available > 0 ? String(available) : "0";
}

/** True when the account exists on this network and can receive payments. */
export async function accountExists(address: string, signal?: AbortSignal): Promise<boolean> {
  return (await horizonGet<unknown>(`/accounts/${address}`, signal)) !== null;
}
