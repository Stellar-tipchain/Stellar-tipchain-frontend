import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "@/config/env";
import { ApiError, TimeoutError } from "@/lib/errors";
import type { Creator, CreatorSummary } from "@/types";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Overrides the default timeout for a single call. */
  timeoutMs?: number;
  /** Lets a caller cancel the request, e.g. when a component unmounts. */
  signal?: AbortSignal;
}

/**
 * Fetch wrapper for the backend API.
 *
 * Every call is bounded by a timeout, because a hung request would otherwise
 * leave a page spinning indefinitely. Failures are raised as `ApiError` so
 * callers can branch on status instead of parsing message strings.
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, timeoutMs = REQUEST_TIMEOUT_MS, signal, headers, ...init } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  // Forward an upstream cancellation into our own controller.
  signal?.addEventListener("abort", () => controller.abort(), { once: true });

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    // An abort here is either our timeout firing or the caller cancelling.
    if (controller.signal.aborted && !signal?.aborted) {
      throw new TimeoutError(path, timeoutMs);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new ApiError(response.status, path, await readErrorMessage(response));
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Prefer the server's own error message when it sends one. */
async function readErrorMessage(response: Response): Promise<string | undefined> {
  try {
    const data = (await response.json()) as { message?: string; error?: string };
    return data.message ?? data.error;
  } catch {
    return undefined;
  }
}

export const api = {
  /** All registered creators, for the explore grid. */
  getCreators: (signal?: AbortSignal) => request<CreatorSummary[]>("/creators", { signal }),

  /** A single creator by username. Throws `ApiError` with status 404 if unknown. */
  getCreator: (username: string, signal?: AbortSignal) =>
    request<Creator>(`/creators/${encodeURIComponent(username)}`, { signal }),

  /** Register the connected wallet as a creator. */
  registerCreator: (username: string, bio: string, stellarAddress: string) =>
    request<Creator>("/creators", {
      method: "POST",
      body: { username, bio, stellarAddress },
    }),

  /**
   * Record a settled tip so it can be attributed to a creator profile. The
   * payment itself already happened on-chain; this is bookkeeping only, and a
   * failure here must not be reported to the user as a failed tip.
   */
  recordTip: (payload: { to: string; amount: string; assetCode: string; txHash: string }) =>
    request<{ id: string }>("/tips", { method: "POST", body: payload }),

  /** Creators ranked by tips received, for the leaderboard. */
  getLeaderboard: (signal?: AbortSignal) =>
    request<CreatorSummary[]>("/creators/leaderboard", { signal }),
};

export { request as apiRequest };
