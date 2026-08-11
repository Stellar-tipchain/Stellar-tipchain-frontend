import { api } from "@/services/api";
import { buildPaymentTx, signAndSubmitTx, toSdkAsset } from "@/services/stellar";
import { availableBalance, getBalances } from "@/services/horizon";
import { TransactionError } from "@/lib/errors";
import { validateAmount, validateMemo } from "@/utils/validation";
import type { Asset, TipReceipt, TipStatus } from "@/types";

export interface SendTipParams {
  from: string;
  /** The recipient's Stellar address. */
  to: string;
  amount: string;
  asset: Asset;
  memo?: string;
  /** Creator username, used only to attribute the tip after it settles. */
  username?: string;
  /** Called as the tip moves through building, signing and submitting. */
  onStatus?: (status: TipStatus) => void;
}

/**
 * Send a tip end to end: validate, check the balance, build, sign, submit, and
 * report it to the backend.
 *
 * Both the creator page and the standalone tip form used to inline this
 * sequence, which is how they drifted apart — only one of them checked the
 * balance against the selected asset. Keeping it here means both get the same
 * checks, and the caller only has to render `onStatus`.
 */
export async function sendTip({
  from,
  to,
  amount,
  asset,
  memo,
  username,
  onStatus,
}: SendTipParams): Promise<TipReceipt> {
  const amountCheck = validateAmount(amount);
  if (!amountCheck.valid) throw new TransactionError(amountCheck.error!);

  const memoCheck = validateMemo(memo ?? "");
  if (!memoCheck.valid) throw new TransactionError(memoCheck.error!);

  // Fail before opening the wallet popup if the balance clearly cannot cover it.
  const balances = await getBalances(from);
  const available = availableBalance(balances, asset);
  if (Number(available) < Number(amount)) {
    throw new TransactionError(
      `Your available ${asset.code} balance is ${available}, which is less than ${amount}.`
    );
  }

  onStatus?.("building");
  const xdr = await buildPaymentTx({ from, to, amount, asset: toSdkAsset(asset), memo });

  onStatus?.("signing");
  // `signAndSubmitTx` covers both signing and submission; the status split is
  // for the user's benefit, since signing is where the wallet popup appears.
  onStatus?.("submitting");
  const hash = await signAndSubmitTx(xdr);

  onStatus?.("success");

  if (username) {
    // Bookkeeping only. The payment is already final on-chain, so a failure
    // here must not be reported to the user as a failed tip.
    void api
      .recordTip({ to: username, amount, assetCode: asset.code, txHash: hash })
      .catch(() => undefined);
  }

  return { hash, amount, asset, destination: to };
}

/** Progress copy for each stage of a tip, shown on the submit button. */
export function tipStatusLabel(status: TipStatus): string {
  switch (status) {
    case "building":
      return "Preparing transaction…";
    case "signing":
      return "Waiting for your wallet…";
    case "submitting":
      return "Submitting to the network…";
    case "success":
      return "Sent";
    case "error":
      return "Failed";
    default:
      return "";
  }
}
