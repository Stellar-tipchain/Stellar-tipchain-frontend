# Stellar Tipchain Frontend

A modern, open-source frontend for tipping creators using the [Stellar](https://stellar.org) blockchain network. Built with **Next.js 14 (App Router)**, **TypeScript**, and **TailwindCSS**.

---

## What Is Stellar Tipchain?

Stellar Tipchain is a decentralized tipping platform that lets supporters send XLM (or any Stellar asset) directly to content creators — no middlemen, no platform fees beyond the Stellar network's minimal transaction cost (~0.00001 XLM).

Creators register a username. Supporters find them on the Explore page, visit their profile, connect a Stellar wallet, and send a tip. The tip is a real Stellar transaction signed in the user's browser via the [Freighter](https://www.freighter.app/) browser extension and broadcast to the Stellar network.

---

## How It Works

### 1. Wallet Connection

The app uses the **Freighter** browser extension as the wallet provider. Freighter is a non-custodial Stellar wallet — the user's private key never leaves their browser.

Wallet state lives in a single `WalletProvider` mounted in the root layout, so the navbar, the tip form, and the dashboard all read the same connection.

When a user clicks **Connect Wallet**:

1. `isConnected()` checks that the extension is installed.
2. `setAllowed()` prompts the user to grant the site permission.
3. `getPublicKey()` retrieves the user's Stellar public address (e.g. `GABCD…WXYZ`).
4. `getNetwork()` reports which network Freighter is set to, and the app warns if it disagrees with `NEXT_PUBLIC_STELLAR_NETWORK`.

The address is stored in `localStorage`, so a reload restores the session. Restoring uses `isAllowed()` — the one check that does not open the extension popup — meaning a returning user is reconnected silently, and a user who revoked access is quietly left disconnected. Disconnecting clears both state and storage; no server-side session is ever involved.

### 2. Sending a Tip

A tip is a Stellar payment transaction. The whole flow lives in `src/services/tips.ts`, and the UI in `src/components/TipForm.tsx`:

1. **Validate** the amount (positive, at most 7 decimal places) and the memo (28 UTF-8 bytes, not 28 characters — an emoji costs four).
2. **Check the balance** for the *selected asset* via Horizon, before opening the wallet popup, so an underfunded tip fails as a sentence rather than as a rejected transaction.
3. **Build** the payment with `stellar-sdk`, reloading the source account each time so the sequence number is current.
4. **Sign** with Freighter's `signTransaction()`.
5. **Submit** to Horizon and return the transaction hash, linked to [stellar.expert](https://stellar.expert) so the user can verify it independently.
6. **Record** the settled tip against the creator's profile. This is bookkeeping only — the payment is already final on-chain, so a backend failure here is never reported as a failed tip.

The button reports each stage: *Preparing transaction… → Waiting for your wallet… → Submitting to the network…*

### 3. Creator Profiles

Each creator has a dynamic route at `/creator/[username]`. The page shows the creator's avatar, username, bio, a copyable Stellar address with an explorer link, and the tip form scoped to the assets that creator accepts.

### 4. Network Configuration

The app supports both **testnet** and **mainnet** via `NEXT_PUBLIC_STELLAR_NETWORK`. The Horizon URL, network passphrase, and explorer base URL are all derived from it in `src/config/env.ts`:

| Network | Horizon URL | Passphrase |
|---------|-------------|------------|
| testnet | `https://horizon-testnet.stellar.org` | `Test SDF Network ; September 2015` |
| mainnet | `https://horizon.stellar.org` | `Public Global Stellar Network ; September 2015` |

On testnet, a badge in the navbar and a line in the footer make it obvious that the tips carry no real value.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | TailwindCSS |
| Wallet | Freighter (`@stellar/freighter-api`) |
| Blockchain | Stellar (Horizon REST API, `stellar-sdk`) |
| Testing | Jest + React Testing Library |
| CI | GitHub Actions (typecheck → lint → test → build) |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout — providers, navbar, footer
│   ├── page.tsx                    # Landing page
│   ├── loading.tsx                 # Route-level loading fallback
│   ├── error.tsx                   # Route-level error boundary
│   ├── not-found.tsx               # 404 page
│   ├── sitemap.ts / robots.ts      # SEO metadata routes
│   ├── manifest.ts                 # Web app manifest
│   ├── explore/page.tsx            # Browse and search creators
│   ├── creator/[username]/page.tsx # Creator profile + tip form
│   ├── tips/page.tsx               # Standalone tip form
│   ├── register/page.tsx           # Creator registration
│   ├── history/page.tsx            # Payment history for the connected wallet
│   ├── leaderboard/page.tsx        # Creators ranked by tips received
│   └── dashboard/page.tsx          # Balances and recent tips
├── components/
│   ├── WalletProvider.tsx          # App-wide wallet state
│   ├── ToastProvider.tsx           # App-wide toast queue
│   ├── TipForm.tsx                 # The shared tip flow
│   ├── Button / Input / Textarea / Card / Badge / Alert / Avatar
│   ├── AssetSelect / AmountPresets / CopyButton / TxLink / StatCard
│   └── Spinner / Skeleton / EmptyState / PageHeader / Footer / Navbar
├── hooks/
│   ├── useWallet.ts                # Reads the wallet context
│   ├── useAsync.ts                 # Load/error state with stale-result guards
│   ├── useDebounce.ts              # Debounced value for search
│   ├── useLocalStorage.ts          # Hydration-safe persisted state
│   └── useCopyToClipboard.ts       # Clipboard with graceful degradation
├── services/
│   ├── api.ts                      # Backend API, timeouts and typed errors
│   ├── horizon.ts                  # Payments, balances, account lookups
│   ├── stellar.ts                  # Transaction building and signing
│   └── tips.ts                     # The end-to-end tip flow
├── lib/
│   ├── errors.ts                   # Error types and user-facing messages
│   └── cn.ts                       # Class-name helper
├── utils/                          # Formatting, validation, explorer links
├── types/                          # Shared domain types
├── constants/                      # Routes, limits, storage keys
├── config/env.ts                   # Environment and network configuration
└── styles/globals.css              # Tailwind + base layer
```

---

## Pages

| Route | What it does |
|---|---|
| `/` | Headline, CTAs, and a three-step explanation of the flow. |
| `/explore` | Searchable creator grid. Search is debounced and matches username *and* bio. Retry on failure, distinct empty states for "no creators" and "no matches". |
| `/creator/[username]` | Profile with avatar, bio, copyable address, explorer link, and the tip form scoped to that creator's accepted assets. |
| `/tips` | Resolves the creator by username *first*, then shows the tip form — so nobody fills in an amount for a creator who does not exist. |
| `/register` | Claims a username for the connected wallet. Validation errors appear only after the first submit attempt. |
| `/history` | Payments to and from the connected wallet, in every asset, filterable by direction, with cursor pagination and per-payment explorer links. |
| `/leaderboard` | Creators ranked by tips received. |
| `/dashboard` | The creator's own view: balances per asset, tips received, and the five most recent. |

---

## Error Handling

Every user-facing failure passes through `toUserMessage` in `src/lib/errors.ts`, which maps Horizon result codes and API statuses to something actionable:

| Raw failure | What the user sees |
|---|---|
| `op_underfunded` | Your balance is too low to send this amount. |
| `op_no_destination` | The recipient account does not exist on this network yet. |
| `op_no_trust` | The recipient has not opted in to this asset. |
| `tx_bad_seq` | Your account sequence is out of date. Refresh the page and try again. |
| Freighter popup dismissed | You cancelled the request in your wallet. |
| `ApiError` 409 | That name is already taken. |
| `TimeoutError` | The request took too long. Check your connection and try again. |

---

## Setup

```bash
git clone <repo-url>
cd Stellar-tipchain-frontend
npm install
cp .env.example .env.local
```

Install the [Freighter extension](https://www.freighter.app/) and create or import a Stellar **testnet** account, then fund it with [friendbot](https://laboratory.stellar.org/#account-creator?network=test).

---

## Development

```bash
npm run dev            # Dev server at http://localhost:3000
npm run build          # Production build
npm run typecheck      # tsc --noEmit
npm run lint           # next lint
npm test               # Jest
npm run test:coverage  # Jest with coverage
npm run verify         # typecheck + lint + test
npm run format         # Prettier
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | _(empty)_ | Backend base URL. Empty means same origin. |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` | `testnet` or `mainnet`; anything else falls back to testnet. |
| `NEXT_PUBLIC_SITE_URL` | _(placeholder)_ | Absolute URL used by `sitemap.xml` and `robots.txt`. |

All three are `NEXT_PUBLIC_*` and are inlined into the browser bundle, so none of them may hold a secret.

---

## Current Completion: ~60%

| Feature | Status |
|---------|--------|
| Project scaffold (Next.js, TS, Tailwind) | ✅ Done |
| All page routes | ✅ Done |
| Reusable UI component library | ✅ Done |
| Freighter wallet connect/disconnect | ✅ Done |
| Shared wallet state + session persistence | ✅ Done |
| Wallet network mismatch detection | ✅ Done |
| Stellar transaction building, signing, submission | ✅ Done |
| Multi-asset tips (XLM + issued assets) | ✅ Done |
| On-chain memo support | ✅ Done |
| Pre-flight balance checks | ✅ Done |
| Backend API layer with timeouts and typed errors | ✅ Done |
| Horizon result-code → user message mapping | ✅ Done |
| Creator registration | ✅ Done |
| Explore + debounced search | ✅ Done |
| Tip history (all assets, filters, pagination) | ✅ Done |
| Leaderboard | ✅ Done |
| Creator dashboard | ✅ Done |
| Block explorer links | ✅ Done |
| Unit + component tests (266) | ✅ Done |
| CI pipeline | ✅ Done |
| SEO metadata, sitemap, robots, manifest | ✅ Done |
| Fiat (USD) value estimates | 🔲 Next milestone |
| Server-rendered creator profiles + OG images | 🔲 Next milestone |
| Recurring / scheduled tips | 🔲 Planned |
| Path payments (send X, recipient receives Y) | 🔲 Planned |
| Creator analytics over time | 🔲 Planned |
| E2E tests (Playwright) | 🔲 Planned |
| Light theme | 🔲 Planned |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, the pre-PR checklist, and where each kind of code belongs.

---

## License

[MIT](./LICENSE)
