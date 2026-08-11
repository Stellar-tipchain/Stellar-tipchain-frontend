# Contributing

Thanks for helping build Stellar Tipchain.

## Getting set up

```bash
npm install
cp .env.example .env.local
npm run dev
```

You will also need the [Freighter](https://www.freighter.app/) browser extension
with a funded **testnet** account. Fund one at
[friendbot](https://laboratory.stellar.org/#account-creator?network=test).

## Before you open a pull request

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm test            # jest
npm run build       # production build
```

CI runs exactly these four, in this order. A red build will not be merged.

## Where code goes

| Kind of code | Location |
|---|---|
| Route-specific UI | `src/app/<route>/page.tsx` |
| Reusable UI | `src/components/` |
| React state logic | `src/hooks/` |
| Backend API calls | `src/services/api.ts` |
| Horizon / on-chain reads | `src/services/horizon.ts` |
| Transaction building and signing | `src/services/stellar.ts` |
| The end-to-end tip flow | `src/services/tips.ts` |
| Pure helpers | `src/utils/` |
| Shared types | `src/types/` |
| Constants, routes, limits | `src/constants/` |
| Environment and network config | `src/config/env.ts` |

Two rules keep this from drifting:

- **Pages do not build transactions.** They call `sendTip` and render its
  status. The creator page and the standalone tip form both go through
  `TipForm` for exactly this reason — when they each owned a copy of the flow,
  only one of them checked the sender's balance against the selected asset.
- **Nothing shows a raw error.** Everything user-facing goes through
  `toUserMessage`, so a Horizon result code such as `op_underfunded` becomes a
  sentence a supporter can act on.

## Testing

Tests live next to the code they cover (`foo.ts` → `foo.test.ts`), except for
components, which use `src/components/__tests__/`.

Prefer queries that assert what a user perceives — `getByRole`,
`getByLabelText`, `toHaveAccessibleName` — over class names or test IDs. A
component that is hard to query that way is usually hard to use with a screen
reader too.

Two environment quirks worth knowing:

- `userEvent.setup()` installs its own `navigator.clipboard` stub, so
  `stubClipboard()` from `src/test-utils/clipboard.ts` has to be called *after*
  it.
- jsdom does not provide `TextEncoder`; `jest.setup.ts` bridges it in from Node.

## Commits

Conventional-commit prefixes (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`,
`chore:`), with a scope where it helps: `feat(wallet): …`. Keep each commit to
one reviewable change.
