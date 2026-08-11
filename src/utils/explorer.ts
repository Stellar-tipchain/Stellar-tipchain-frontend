import { EXPLORER_BASE_URL } from "@/config/env";
import type { Asset } from "@/types";

/**
 * Links into stellar.expert for the active network, so a user can independently
 * verify any transaction the app claims to have submitted.
 */

/** Link to a submitted transaction. */
export function txUrl(hash: string): string {
  return `${EXPLORER_BASE_URL}/tx/${hash}`;
}

/** Link to an account's explorer page. */
export function accountUrl(address: string): string {
  return `${EXPLORER_BASE_URL}/account/${address}`;
}

/** Link to an asset's explorer page. Native XLM has its own path. */
export function assetUrl(asset: Asset): string {
  if (!asset.issuer) return `${EXPLORER_BASE_URL}/asset/XLM`;
  return `${EXPLORER_BASE_URL}/asset/${asset.code}-${asset.issuer}`;
}
