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

When a user clicks **Connect Wallet**:

1. The app calls `isConnected()` from `@stellar/freighter-api` to check if the extension is installed.
2. It calls `setAllowed()` to prompt the user to grant the site permission.
3. It calls `getPublicKey()` to retrieve the user's Stellar public address (e.g. `GABCD…WXYZ`).
4. The address is stored in React state via the `useWallet` hook and displayed in the Navbar.

Disconnecting clears the address from state — no server-side session is involved.

### 2. Sending a Tip

A tip is a Stellar payment transaction:

- The sender's public key is the source account (from Freighter).
- The recipient is looked up by username via the backend API.
- The amount is specified in XLM (or another Stellar asset in future milestones).
- The transaction is built using `stellar-sdk`, signed by Freighter via `signTransaction()`, and submitted to Horizon (Stellar's REST API gateway).

> **Current status (30% complete):** The tip form UI is fully built and wallet-gated. Transaction signing and submission to Horizon are stubbed — they will be wired in the next milestone.

### 3. Creator Profiles

Each creator has a dynamic route at `/creator/[username]`. The page shows the creator's avatar, username, bio, and a tip form. The username is used to resolve the creator's Stellar address from the backend before building the transaction.

### 4. Network Configuration

The app supports both **testnet** and **mainnet** via the `NEXT_PUBLIC_STELLAR_NETWORK` environment variable. The correct Horizon URL and network passphrase are selected automatically:

| Network | Horizon URL | Passphrase |
|---------|-------------|------------|
| testnet | `https://horizon-testnet.stellar.org` | `Test SDF Network ; September 2015` |
| mainnet | `https://horizon.stellar.org` | `Public Global Stellar Network ; September 2015` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| Wallet | Freighter (`@stellar/freighter-api`) |
| Blockchain | Stellar (Horizon REST API) |
| API layer | Fetch-based service (`src/services/api.ts`) |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout — Navbar + global styles
│   ├── page.tsx                    # Landing page
│   ├── not-found.tsx               # 404 page
│   ├── explore/
│   │   └── page.tsx                # Browse and search creators
│   ├── creator/
│   │   └── [username]/
│   │       └── page.tsx            # Dynamic creator profile + tip form
│   └── tips/
│       └── page.tsx                # Standalone tip form
├── components/
│   ├── Button.tsx                  # Reusable button (solid / outline variants)
│   ├── CreatorCard.tsx             # Creator grid card used on /explore
│   ├── Navbar.tsx                  # Top navigation + wallet connect button
│   └── Toast.tsx                   # Auto-dismissing feedback notification
├── hooks/
│   └── useWallet.ts                # Freighter wallet state (connect / disconnect)
├── services/
│   └── api.ts                      # Typed fetch wrapper for backend API calls
├── utils/
│   └── index.ts                    # truncateAddress, formatXLM, network constants
└── styles/
    └── globals.css                 # Tailwind base directives
```

---

## Pages

### `/` — Landing
Introduces the project with a headline, description, and two CTAs: **Explore Creators** and **Send a Tip**.

### `/explore` — Explore Creators
Displays a searchable grid of creator cards. Typing in the search box filters creators by username in real time. Each card links to the creator's profile page.

### `/creator/[username]` — Creator Profile
Shows the creator's avatar (initials-based), username, and bio. Includes a tip form with an XLM amount input. If the wallet is not connected, the button triggers the Freighter connection flow first.

### `/tips` — Send a Tip
A standalone tip form. Shows a wallet connection prompt if disconnected. Once connected, displays the sender's address and a form to enter a recipient username and XLM amount.

---

## Components

### `Button`
Accepts `variant="solid"` (default, blue fill) or `variant="outline"` (blue border). Forwards all standard `<button>` HTML attributes including `disabled`.

### `Navbar`
Renders the site logo/link, navigation links (Explore, Tip), and a wallet button. When connected, shows the truncated Stellar address and clicking it disconnects. When disconnected, shows **Connect Wallet**.

### `CreatorCard`
A linked card showing a creator's avatar, username, and optional bio. Used in the `/explore` grid.

### `Toast`
A fixed bottom-right notification that auto-dismisses after 4 seconds. Supports `success` (green), `error` (red), and `info` (blue) types.

---

## Hooks

### `useWallet`

```ts
const { address, connected, connecting, error, connect, disconnect } = useWallet();
```

| Property | Type | Description |
|----------|------|-------------|
| `address` | `string \| null` | Connected Stellar public key |
| `connected` | `boolean` | Whether a wallet is connected |
| `connecting` | `boolean` | True while the connection flow is in progress |
| `error` | `string \| null` | Last connection error message |
| `connect` | `() => Promise<void>` | Triggers Freighter connection flow |
| `disconnect` | `() => void` | Clears wallet state |

---

## API Service

`src/services/api.ts` provides a typed fetch wrapper over the backend REST API:

```ts
api.getCreators()                  // GET /creators
api.getCreator(username)           // GET /creators/:username
api.sendTip(to, amount)            // POST /tips  { to, amount }
```

All calls throw on non-2xx responses. The base URL is set via `NEXT_PUBLIC_API_URL`.

---

## Setup

**Clone and install:**
```bash
git clone <repo-url>
cd Stellar-tipchain-frontend
npm install
```

**Configure environment:**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_STELLAR_NETWORK=testnet
```

**Install Freighter:**
Download the [Freighter browser extension](https://www.freighter.app/) and create or import a Stellar testnet account.

---

## Development

```bash
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript type check (no emit)
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | _(empty)_ | Backend base URL for API calls |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` | `testnet` or `mainnet` |

---

## Current Completion: ~30%

| Feature | Status |
|---------|--------|
| Project scaffold (Next.js, TS, Tailwind) | ✅ Done |
| All page routes | ✅ Done |
| Reusable UI components | ✅ Done |
| Freighter wallet connect/disconnect | ✅ Done |
| Tip form UI (wallet-gated) | ✅ Done |
| Creator explore + search | ✅ Done |
| Network config (testnet/mainnet) | ✅ Done |
| API service layer | ✅ Done |
| Stellar transaction signing + submission | 🔲 Next milestone |
| Backend API integration (real creator data) | 🔲 Next milestone |
| Creator registration / onboarding flow | 🔲 Planned |
| Tip history page | 🔲 Planned |
| Multi-asset support (non-XLM) | 🔲 Planned |
| Unit + E2E tests | 🔲 Planned |

---

## Contributing

- Route-specific UI belongs in `src/app/<route>/page.tsx`.
- Reusable UI belongs in `src/components/`.
- API calls belong in `src/services/api.ts`.
- Wallet logic belongs in `src/hooks/useWallet.ts`.
- Stellar utilities (address formatting, network config) belong in `src/utils/index.ts`.

---

## License

MIT
