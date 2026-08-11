/**
 * Environment configuration, read once and normalised.
 *
 * Next.js inlines `process.env.NEXT_PUBLIC_*` at build time, so these must be
 * referenced as full literal property accesses rather than looked up
 * dynamically — that is why each variable is read explicitly below.
 */

export type StellarNetwork = "testnet" | "mainnet";

const RAW_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK;

/** The active Stellar network. Anything other than `mainnet` falls back to testnet. */
export const NETWORK: StellarNetwork = RAW_NETWORK === "mainnet" ? "mainnet" : "testnet";

/** True when the app is pointed at the public network and tips move real value. */
export const IS_MAINNET = NETWORK === "mainnet";

/** Base URL of the backend API. Empty string means "same origin". */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Horizon endpoint for the active network. */
export const HORIZON_ENDPOINT = IS_MAINNET
  ? "https://horizon.stellar.org"
  : "https://horizon-testnet.stellar.org";

/** Network passphrase used when building and signing transactions. */
export const NETWORK_PASSPHRASE_VALUE = IS_MAINNET
  ? "Public Global Stellar Network ; September 2015"
  : "Test SDF Network ; September 2015";

/** Base URL of the block explorer used for transaction and account links. */
export const EXPLORER_BASE_URL = IS_MAINNET
  ? "https://stellar.expert/explorer/public"
  : "https://stellar.expert/explorer/testnet";

/** Milliseconds before an API request is aborted. */
export const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Warnings for configuration that is missing or likely wrong. Surfaced in the
 * UI rather than thrown, so a misconfigured deploy degrades instead of crashing.
 */
export function configWarnings(): string[] {
  const warnings: string[] = [];
  if (!API_BASE_URL) {
    warnings.push("NEXT_PUBLIC_API_URL is not set — creator data will not load.");
  }
  if (RAW_NETWORK && RAW_NETWORK !== "testnet" && RAW_NETWORK !== "mainnet") {
    warnings.push(
      `NEXT_PUBLIC_STELLAR_NETWORK="${RAW_NETWORK}" is not recognised — defaulting to testnet.`
    );
  }
  return warnings;
}
