"use client";

import { useState } from "react";
import { api } from "@/services/api";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/components/ToastProvider";
import { toUserMessage } from "@/lib/errors";
import { XLM } from "@/constants";
import type { Creator } from "@/types";
import Button from "@/components/Button";
import Input from "@/components/Input";
import PageHeader from "@/components/PageHeader";
import TipForm from "@/components/TipForm";
import Spinner from "@/components/Spinner";
import Alert from "@/components/Alert";

/**
 * Standalone tip form. The recipient is resolved by username first, so the tip
 * form only ever renders once a real Stellar address is known — the previous
 * version let a user fill in an amount before discovering the creator did not
 * exist.
 */
export default function TipsPage() {
  const { connected, connecting, connect } = useWallet();
  const { error: errorToast } = useToast();

  const [username, setUsername] = useState("");
  const [creator, setCreator] = useState<Creator | null>(null);
  const [looking, setLooking] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  async function handleLookup(event: React.FormEvent) {
    event.preventDefault();
    if (!username.trim()) return;

    setLooking(true);
    setLookupError(null);
    try {
      setCreator(await api.getCreator(username.trim()));
    } catch (err) {
      setCreator(null);
      setLookupError(toUserMessage(err));
      errorToast(toUserMessage(err));
    } finally {
      setLooking(false);
    }
  }

  return (
    <section className="max-w-md mx-auto px-4 py-16 flex flex-col gap-6">
      <PageHeader title="Send a Tip" description="Find a creator by username, then send." />

      {!connected && (
        <div className="bg-gray-800 rounded-xl p-5 flex flex-col gap-3 text-center">
          <p className="text-gray-400 text-sm">Connect your Stellar wallet to send tips.</p>
          <Button onClick={connect} disabled={connecting}>
            {connecting ? "Connecting…" : "Connect Wallet"}
          </Button>
        </div>
      )}

      {connected && (
        <>
          <form onSubmit={handleLookup} className="flex flex-col gap-3 bg-gray-800 rounded-xl p-6">
            <Input
              label="Creator username"
              placeholder="alice"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setCreator(null);
              }}
            />
            <Button type="submit" variant="outline" disabled={looking || !username.trim()}>
              {looking ? <Spinner size="sm" label="Looking up creator" /> : "Find creator"}
            </Button>
          </form>

          {lookupError && <Alert severity="error">{lookupError}</Alert>}

          {creator && (
            <>
              <p className="text-sm text-gray-400">
                Tipping <span className="font-medium text-white">@{creator.username}</span>
              </p>
              <TipForm
                destination={creator.stellarAddress}
                username={creator.username}
                assets={[XLM, ...(creator.acceptedAssets ?? [])]}
              />
            </>
          )}
        </>
      )}
    </section>
  );
}
