"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/components/ToastProvider";
import { api } from "@/services/api";
import { toUserMessage } from "@/lib/errors";
import { validateBio, validateUsername } from "@/utils/validation";
import { MAX_BIO_LENGTH, ROUTES } from "@/constants";
import { truncateAddress } from "@/utils";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import PageHeader from "@/components/PageHeader";
import Alert from "@/components/Alert";

export default function RegisterPage() {
  const router = useRouter();
  const { address, connected, connecting, connect, networkMismatch } = useWallet();
  const { success, error: errorToast } = useToast();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validation runs on every keystroke but is only shown after a submit
  // attempt, so a half-typed username is not immediately flagged as wrong.
  const usernameError = validateUsername(username).error;
  const bioError = validateBio(bio).error;
  const canSubmit = !usernameError && !bioError && !submitting;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (usernameError || bioError) return;

    setSubmitting(true);
    try {
      await api.registerCreator(username, bio, address!);
      success(`@${username} is registered.`);
      router.push(ROUTES.creator(username));
    } catch (err) {
      errorToast(toUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="max-w-md mx-auto px-4 py-16 flex flex-col gap-6">
      <PageHeader
        title="Register as Creator"
        description="Claim a username so supporters can find and tip you."
      />

      {!connected && (
        <div className="bg-gray-800 rounded-xl p-5 flex flex-col gap-3 text-center">
          <p className="text-gray-400 text-sm">
            Connect your Stellar wallet to register. Tips will be paid to this address.
          </p>
          <Button onClick={connect} disabled={connecting}>
            {connecting ? "Connecting…" : "Connect Wallet"}
          </Button>
        </div>
      )}

      {connected && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-gray-800 rounded-xl p-6">
          {networkMismatch && (
            <Alert severity="warning" title="Wrong network">
              Your wallet is on a different network than this app.
            </Alert>
          )}

          <p className="text-xs text-gray-500">
            Registering <span className="font-mono">{truncateAddress(address!, 6)}</span>
          </p>

          <Input
            label="Username"
            required
            value={username}
            placeholder="my-username"
            error={touched ? usernameError : undefined}
            hint="Lowercase letters, numbers and hyphens. This becomes your profile link."
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
          />

          <Textarea
            label="Bio"
            rows={3}
            value={bio}
            maxLength={MAX_BIO_LENGTH}
            placeholder="Tell people about yourself… (optional)"
            error={touched ? bioError : undefined}
            onChange={(e) => setBio(e.target.value)}
          />

          <Button type="submit" disabled={!canSubmit}>
            {submitting ? "Registering…" : "Register"}
          </Button>
        </form>
      )}
    </section>
  );
}
