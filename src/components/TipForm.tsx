"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/components/ToastProvider";
import { sendTip, tipStatusLabel } from "@/services/tips";
import { toUserMessage } from "@/lib/errors";
import { validateAmount, validateMemo } from "@/utils/validation";
import { MAX_MEMO_BYTES, XLM } from "@/constants";
import Button from "./Button";
import Input from "./Input";
import AssetSelect from "./AssetSelect";
import AmountPresets from "./AmountPresets";
import TxLink from "./TxLink";
import Alert from "./Alert";
import type { Asset, TipStatus } from "@/types";

interface TipFormProps {
  /** The recipient's Stellar address. */
  destination: string;
  /** Creator username, used to attribute the tip after it settles. */
  username?: string;
  /** Assets the recipient accepts. XLM is always first. */
  assets?: Asset[];
  submitLabel?: string;
  onSent?: (hash: string) => void;
}

/**
 * The tip form, shared by the creator profile and the standalone tip page.
 *
 * Both pages previously carried their own copy of this flow and had already
 * drifted apart in their error handling; there is one implementation now.
 */
export default function TipForm({
  destination,
  username,
  assets = [XLM],
  submitLabel = "Send Tip",
  onSent,
}: TipFormProps) {
  const { address, connected, connecting, connect, networkMismatch } = useWallet();
  const { success, error: errorToast } = useToast();

  const [amount, setAmount] = useState("10");
  const [asset, setAsset] = useState<Asset>(assets[0] ?? XLM);
  const [memo, setMemo] = useState("");
  const [status, setStatus] = useState<TipStatus>("idle");
  const [lastHash, setLastHash] = useState<string | null>(null);

  const amountError = amount ? validateAmount(amount).error : undefined;
  const memoError = validateMemo(memo).error;
  const busy = status === "building" || status === "signing" || status === "submitting";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!connected) {
      await connect();
      return;
    }
    if (amountError || memoError) return;

    setStatus("building");
    try {
      const receipt = await sendTip({
        from: address!,
        to: destination,
        amount,
        asset,
        memo: memo || undefined,
        username,
        onStatus: setStatus,
      });

      setLastHash(receipt.hash);
      setMemo("");
      success(`Tip of ${amount} ${asset.code} sent.`);
      onSent?.(receipt.hash);
    } catch (err) {
      setStatus("error");
      errorToast(toUserMessage(err));
    }
  }

  if (!connected) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-3 text-center">
        <p className="text-gray-400 text-sm">Connect your Stellar wallet to send a tip.</p>
        <Button onClick={connect} disabled={connecting}>
          {connecting ? "Connecting…" : "Connect Wallet"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 flex flex-col gap-4">
      {networkMismatch && (
        <Alert severity="warning" title="Wrong network">
          Your wallet is on a different network than this app. Switch it in Freighter before
          sending, or the payment will be rejected.
        </Alert>
      )}

      <AssetSelect assets={assets} value={asset} onChange={setAsset} />

      <Input
        label={`Amount (${asset.code})`}
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        required
        value={amount}
        error={amountError}
        suffix={asset.code}
        onChange={(e) => setAmount(e.target.value)}
      />

      <AmountPresets value={amount} onSelect={setAmount} assetCode={asset.code} disabled={busy} />

      <Input
        label="Message (optional)"
        value={memo}
        error={memoError}
        hint={`Attached to the payment on-chain — up to ${MAX_MEMO_BYTES} bytes.`}
        onChange={(e) => setMemo(e.target.value)}
      />

      <Button type="submit" disabled={busy || Boolean(amountError) || Boolean(memoError)}>
        {busy ? tipStatusLabel(status) : submitLabel}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Sending from {address?.slice(0, 8)}…
      </p>

      {lastHash && (
        <p className="text-xs text-gray-400 text-center">
          Last tip: <TxLink hash={lastHash} />
        </p>
      )}
    </form>
  );
}
