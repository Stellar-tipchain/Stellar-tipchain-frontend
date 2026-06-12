import * as StellarSdk from "stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import { HORIZON_URL, NETWORK_PASSPHRASE } from "@/utils";

const server = new StellarSdk.Horizon.Server(HORIZON_URL);

export async function buildPaymentTx(
  from: string,
  to: string,
  amount: string,
  asset: StellarSdk.Asset = StellarSdk.Asset.native()
): Promise<string> {
  const account = await server.loadAccount(from);
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(StellarSdk.Operation.payment({ destination: to, asset, amount }))
    .setTimeout(30)
    .build();
  return tx.toXDR();
}

export async function signAndSubmitTx(xdr: string): Promise<string> {
  const signed = await signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE });
  const tx = StellarSdk.TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE);
  const result = await server.submitTransaction(tx);
  return result.hash;
}
