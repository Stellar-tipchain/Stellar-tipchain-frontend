import { Horizon, TransactionBuilder, Asset, Operation, BASE_FEE, Transaction } from "stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import { HORIZON_URL, NETWORK_PASSPHRASE } from "@/utils";

const server = new Horizon.Server(HORIZON_URL);

export async function buildPaymentTx(from: string, to: string, amount: string): Promise<string> {
  const account = await server.loadAccount(from);
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(Operation.payment({ destination: to, asset: Asset.native(), amount }))
    .setTimeout(30)
    .build();
  return tx.toXDR();
}

export async function signAndSubmitTx(xdr: string): Promise<string> {
  const signed = await signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE });
  const tx = new Transaction(signed, NETWORK_PASSPHRASE);
  const result = await server.submitTransaction(tx);
  return result.hash;
}
