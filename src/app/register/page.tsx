"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { api } from "@/services/api";
import Button from "@/components/Button";
import Toast from "@/components/Toast";

const USERNAME_RE = /^[a-z0-9-]+$/;

export default function RegisterPage() {
  const router = useRouter();
  const { address, connected, connecting, connect } = useWallet();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState<{ username?: string; bio?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  function validate() {
    const e: { username?: string; bio?: string } = {};
    if (!username) e.username = "Username is required";
    else if (username.length < 3 || username.length > 20 || !USERNAME_RE.test(username))
      e.username = "3–20 chars, lowercase letters, numbers, hyphens only";
    if (bio.length > 160) e.bio = "Bio must be 160 characters or less";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await api.registerCreator(username, bio, address!);
      router.push(`/creator/${username}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setToast({
        message: msg.includes("409") ? "Username already taken" : "Registration failed, please try again",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="max-w-md mx-auto px-4 py-16 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Register as Creator</h1>

      {!connected && (
        <div className="bg-gray-800 rounded-xl p-5 flex flex-col gap-3 text-center">
          <p className="text-gray-400 text-sm">Connect your Stellar wallet to register.</p>
          <Button onClick={connect} disabled={connecting}>
            {connecting ? "Connecting…" : "Connect Wallet"}
          </Button>
        </div>
      )}

      {connected && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-gray-800 rounded-xl p-6">
          <p className="text-xs text-gray-500">Wallet: {address?.slice(0, 8)}…</p>

          <div className="flex flex-col gap-1 text-sm">
            <label htmlFor="username">Username *</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="my-username"
              className="mt-1 px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
          </div>

          <div className="flex flex-col gap-1 text-sm">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself… (optional)"
              rows={3}
              className="mt-1 px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 text-right">{bio.length}/160</p>
            {errors.bio && <p className="text-red-400 text-xs">{errors.bio}</p>}
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Registering…" : "Register"}
          </Button>
        </form>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  );
}
