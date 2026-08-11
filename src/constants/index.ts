import type { Asset } from "@/types";

/** The native Stellar asset. An empty issuer marks it as native. */
export const XLM: Asset = { code: "XLM", issuer: "" };

/** Application routes, so links are not spelled out as literals at call sites. */
export const ROUTES = {
  home: "/",
  explore: "/explore",
  tips: "/tips",
  register: "/register",
  history: "/history",
  leaderboard: "/leaderboard",
  dashboard: "/dashboard",
  creator: (username: string) => `/creator/${username}`,
} as const;

/** Quick-pick tip amounts offered under the amount field. */
export const TIP_PRESETS = ["1", "5", "10", "25", "100"] as const;

/** Stellar enforces a minimum balance; tips below this are not worth the fee. */
export const MIN_TIP_AMOUNT = 0.0000001;

/** Stellar amounts carry at most seven decimal places. */
export const MAX_AMOUNT_DECIMALS = 7;

/** Transaction memos are capped at 28 bytes for the `MEMO_TEXT` type. */
export const MAX_MEMO_BYTES = 28;

/** Username rules shared by the register form and its validator. */
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const USERNAME_PATTERN = /^[a-z0-9-]+$/;

/** Bios are kept short so creator cards stay a consistent height. */
export const MAX_BIO_LENGTH = 160;

/** Stellar public keys are 56-character base32 strings beginning with `G`. */
export const PUBLIC_KEY_LENGTH = 56;

/** Records requested per page from Horizon. */
export const PAGE_SIZE = 20;

/** How long a toast stays on screen, in milliseconds. */
export const TOAST_DURATION_MS = 4000;

/** localStorage keys, namespaced to avoid clashing with other apps on a host. */
export const STORAGE_KEYS = {
  wallet: "tipchain:wallet-address",
  theme: "tipchain:theme",
  recentCreators: "tipchain:recent-creators",
} as const;
