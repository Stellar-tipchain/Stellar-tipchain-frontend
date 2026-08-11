import * as StellarSdk from "stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import { HORIZON_ENDPOINT, NETWORK_PASSPHRASE_VALUE } from "@/config/env";
import { TransactionError } from "@/lib/errors";
import type { Asset } from "@/types";

const server = new StellarSdk.Horizon.Server(HORIZON_ENDPOINT);

/** Translate the app's `Asset` shape into an SDK asset. */
export function toSdkAsset(asset: Asset): StellarSdk.Asset {
  if (!asset.issuer) return StellarSdk.Asset.native();
  return new StellarSdk.Asset(asset.code, asset.issuer);
}

export interface BuildPaymentOptions {
  from: string;
  to: string;
  amount: string;
  asset?: StellarSdk.Asset;
  /** Optional note attached to the payment, capped at 28 bytes. */
  memo?: string;
}

/**
 * Build an unsigned payment transaction and return its XDR.
 *
 * The source account is loaded from Horizon on every build so the sequence
 * number is current — a cached account would produce a `tx_bad_seq` failure
 * the moment the user sends two tips in a row.
 */
export async function buildPaymentTx({
  from,
  to,
  amount,
  asset = StellarSdk.Asset.native(),
  memo,
}: BuildPaymentOptions): Promise<string> {
  const account = await server.loadAccount(from);

  const builder = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE_VALUE,
  })
    .addOperation(StellarSdk.Operation.payment({ destination: to, asset, amount }))
    .setTimeout(30);

  if (memo) builder.addMemo(StellarSdk.Memo.text(memo));

  return builder.build().toXDR();
}

/** Sign an XDR with Freighter and submit it to Horizon, returning the tx hash. */
export async function signAndSubmitTx(xdr: string): Promise<string> {
  const signed = await signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE_VALUE });
  const tx = StellarSdk.TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE_VALUE);
  const result = await server.submitTransaction(tx);

  if (!result.hash) {
    throw new TransactionError("The network accepted the transaction but returned no hash.");
  }
  return result.hash;
}

/**
 * The reserve a Stellar account must always retain: a 1 XLM base reserve plus
 * 0.5 XLM per subentry (trustlines, offers, signers). Spending into it fails,
 * so the tip form treats it as unavailable.
 */
export function minimumReserve(subentryCount: number): number {
  return 1 + 0.5 * subentryCount;
}
