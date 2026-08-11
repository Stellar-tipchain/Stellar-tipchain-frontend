"use client";

import { useCallback } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import { useAsync } from "@/hooks/useAsync";
import { accountUrl } from "@/utils/explorer";
import { truncateAddress } from "@/utils";
import { XLM } from "@/constants";
import Avatar from "@/components/Avatar";
import CopyButton from "@/components/CopyButton";
import ErrorBoundary from "@/components/ErrorBoundary";
import Skeleton from "@/components/Skeleton";
import TipForm from "@/components/TipForm";
import Alert from "@/components/Alert";

interface Props {
  params: { username: string };
}

export default function CreatorPage({ params }: Props) {
  const { username } = params;

  const load = useCallback(() => api.getCreator(username), [username]);
  const { data: creator, loading, error } = useAsync(load, [username]);

  if (loading) {
    return (
      <section
        className="max-w-lg mx-auto px-4 py-16 flex flex-col gap-8"
        aria-busy="true"
        aria-label="Loading creator"
      >
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="w-32 h-7" />
          <Skeleton className="w-48 h-4" />
        </div>
        <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-4">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-10" />
        </div>
      </section>
    );
  }

  if (error || !creator) {
    return (
      <section className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
        <Alert severity="error" title="Could not load this creator">
          {error ?? "No profile was returned for this username."}
        </Alert>
        <Link href="/explore" className="text-blue-400 hover:text-blue-300 transition">
          Back to Explore
        </Link>
      </section>
    );
  }

  // XLM is always offered; the creator's own list adds anything else they accept.
  const assets = [XLM, ...(creator.acceptedAssets ?? [])];

  return (
    <section className="max-w-lg mx-auto px-4 py-16 flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar name={creator.username} size="lg" />
        <h1 className="text-3xl font-bold">@{creator.username}</h1>
        {creator.bio && <p className="text-gray-400">{creator.bio}</p>}
        {creator.stellarAddress && (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <CopyButton
              value={creator.stellarAddress}
              label="Stellar address"
              className="font-mono"
            >
              {truncateAddress(creator.stellarAddress, 6)}
            </CopyButton>
            <a
              href={accountUrl(creator.stellarAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition underline underline-offset-2"
            >
              View on explorer
            </a>
          </div>
        )}
      </div>

      <ErrorBoundary>
        {creator.stellarAddress ? (
          <TipForm
            destination={creator.stellarAddress}
            username={creator.username}
            assets={assets}
            submitLabel={`Tip @${creator.username}`}
          />
        ) : (
          <Alert severity="warning" title="Not accepting tips yet">
            This creator has not registered a Stellar address.
          </Alert>
        )}
      </ErrorBoundary>
    </section>
  );
}
