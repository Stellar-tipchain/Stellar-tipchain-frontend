/** Truncate a Stellar address for display: GABCD…WXYZ */
export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

/** Format a number as XLM */
export function formatXLM(amount: number): string {
  return `${amount.toLocaleString(undefined, { maximumFractionDigits: 7 })} XLM`;
}

export const STELLAR_NETWORK =
  (process.env.NEXT_PUBLIC_STELLAR_NETWORK as "testnet" | "mainnet") ?? "testnet";

export const NETWORK_PASSPHRASE =
  STELLAR_NETWORK === "mainnet"
    ? "Public Global Stellar Network ; September 2015"
    : "Test SDF Network ; September 2015";

export const HORIZON_URL =
  STELLAR_NETWORK === "mainnet"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";
