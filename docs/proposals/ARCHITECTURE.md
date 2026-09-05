# Architecture: Swiss DeFi Optimizer

> Status: initial proposal. Decisions marked `[DECISION]` are still open,
> comment before implementation.
>
> **Note (2026-09):** this proposal (a Next.js/wagmi stack with a frontend)
> **is not the scope of this repository**, which is contracts-only
> (Hardhat). Archived here in `docs/proposals/` precisely so it is not
> mistaken for documentation of what exists: nothing in this file describes
> code present in the repo. For the real state, see
> [`../../README.md`](../../README.md).

---

## 1. Chosen stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR/SSG for the landing page, RSC for server-side price data fetching; API routes for off-chain tasks |
| Language | TypeScript (strict) | End-to-end type safety, typed contracts via wagmi codegen |
| Web3 client | viem 2.x | Modern API, tree-shakeable, native multicall, better DX than ethers |
| Wallet/hooks | wagmi 2.x | De facto standard for React + viem; handles reconnect, chain switching |
| UI | Tailwind + shadcn/ui | Prototyping speed, accessible components |
| Server state | TanStack Query (bundled with wagmi) | Caches on-chain reads with per-block invalidation |
| Client state | Zustand | UI filters, preferences; lightweight, no Redux boilerplate |
| Forms | react-hook-form + zod | Typed validation on swap/migration forms |
| Tests | Vitest + Playwright | Vitest for unit tests, Playwright for E2E with an Anvil fork |
| Lint/format | ESLint + Prettier + biome `[DECISION]` | Pick one: biome alone, or ESLint+Prettier |
| Package manager | pnpm | Future workspaces (app + packages/contracts) |
| Node | >= 20 LTS | App Router + Edge runtime |

## 2. Folder structure (proposed)

```
swiss-defi-optimizer/
├── apps/
│   └── web/                       # Next.js app
│       ├── app/
│       │   ├── (marketing)/       # Landing, /, /about
│       │   ├── (app)/             # Wallet-authenticated area
│       │   │   ├── dashboard/     # Aggregated positions
│       │   │   ├── opportunities/ # Yield list
│       │   │   ├── simulate/      # Migration simulator
│       │   │   └── tax/           # Tax report export
│       │   └── api/
│       │       ├── prices/        # CoinGecko proxy/cache
│       │       └── apy/           # APY snapshot (cron job)
│       ├── components/
│       ├── hooks/                 # useAavePositions, useMorphoMarkets, etc.
│       ├── lib/
│       │   ├── viem/              # Client config, chains, multicall helpers
│       │   ├── wagmi/             # Config, connectors
│       │   ├── protocols/         # Adapters: aave.ts, morpho.ts
│       │   ├── tax/               # FIFO cost basis, exporters
│       │   └── chf/               # XCHF/ZCHF helpers (rates, pools)
│       └── tests/
├── packages/
│   ├── contracts-abi/             # Typed ABIs (generated via wagmi cli)
│   └── shared/                    # Shared types (Position, Opportunity)
├── docs/                          # Architecture decisions (ADRs)
├── VISION.md
├── ARCHITECTURE.md
└── README.md
```

## 3. Layers and responsibilities

```
┌──────────────────────────────────────────┐
│  UI (RSC + Client Components)             │
│  - Dashboard, forms, charts                │
└──────────────┬───────────────────────────┘
               │ uses
┌──────────────▼───────────────────────────┐
│  Hooks (wagmi + custom)                   │
│  - useAavePositions(address)              │
│  - useMorphoMarkets(chainId)              │
│  - useOptimizationSuggestions(positions)  │
└──────────────┬───────────────────────────┘
               │ uses
┌──────────────▼───────────────────────────┐
│  Protocol Adapters (pure, testable)       │
│  - lib/protocols/aave.ts                  │
│  - lib/protocols/morpho.ts                │
│  - Common interface: getPositions, getAPY │
└──────────────┬───────────────────────────┘
               │ uses
┌──────────────▼───────────────────────────┐
│  viem clients (1 per chain)                │
│  - Multicall required for batch reads     │
└──────────────────────────────────────────┘
```

Principles:
- **Adapters are pure.** They take a `PublicClient` and an address; they
  return normalized positions. No React, no hooks. This makes testing with
  Anvil easy.
- **Hooks are thin.** They just wrap an adapter in `useQuery` with a stable
  key `[protocol, chain, address, blockTag]`.
- **UI never talks to viem directly.** Always through a hook.

## 4. External integrations

| Service | Use | Plan |
|---|---|---|
| RPCs | On-chain reads | Default: public Ankr; allow the user's own custom RPC (settings field) |
| CoinGecko Pro `[DECISION]` | Spot and historical prices in CHF | Evaluate CoinGecko vs CryptoCompare; both have a native CHF endpoint |
| DeFiLlama Yields API | Cross-check of APYs | Free, rate-limited |
| Aave v3 subgraph | Interest history | The Graph's Hosted Service |
| Morpho Blue API | Markets and oracles | Official REST endpoint |
| Swiss FX rates | Daily CHF/USD fallback (the Swiss tax authorities use the SNB) | https://data.snb.ch (daily CSV, free) |

## 5. Flow: "Initial dashboard"

1. User connects wallet (wagmi connector).
2. `useAccount()` returns address + chainId.
3. RSC fires in parallel:
   - `getAavePositions(address, [1, 42161, 8453, 10])`
   - `getMorphoPositions(address, [1, 8453])`
   - `getNativeBalances(address, [1, 42161, 8453, 10])`
4. Each adapter makes **1 multicall per chain** (not N calls).
5. Results are aggregated into a normalized `Position[]`.
6. For each `Position`, the block's CHF price is attached (via a
   server-side cache).
7. UI renders with a total in CHF, broken down by chain and by protocol.

## 6. Flow: "Optimization suggestion"

1. Given the user's `Position[]`, for each position:
   - Fetch the position's current APY.
   - Fetch APYs of alternative pools for the same asset.
2. Net difference = `target_apy - current_apy - swap_cost - bridge_cost - gas`.
3. Risk filters:
   - Configurable minimum TVL (default 50M USD).
   - Pool age (default >= 90 days).
   - No dependency on a low-quality oracle (whitelist).
4. Top 5 suggestions shown with a full breakdown.
5. Clicking "Simulate" opens the detailed route (swap -> bridge -> deposit)
   without executing it.

## 7. Data model (core)

```ts
type ChainId = 1 | 10 | 8453 | 42161;

type Position = {
  protocol: 'aave-v3' | 'morpho-blue';
  chainId: ChainId;
  market: Address;
  asset: { address: Address; symbol: string; decimals: number };
  side: 'supply' | 'borrow';
  amount: bigint;
  amountUsd: number;
  amountChf: number;
  apy: number;
  blockNumber: bigint;
};

type Opportunity = {
  from: Position;
  to: { protocol; chainId; market; apy };
  netApyDelta: number;
  estimatedCostUsd: number;
  riskFlags: string[];
};
```

## 8. Open decisions to discuss

1. **Monorepo (pnpm workspaces) vs single app?** I recommend a monorepo from
   the start, since I anticipate `packages/contracts-abi` and probably a
   `packages/sdk` if we open up external integration.
2. **Heavy RSC vs client-heavy?** I recommend RSC for prices/APYs (server
   cache shared across users) and client-side for anything that depends on
   the connected address (privacy).
3. **Where do the APY snapshot cron jobs run?** Vercel Cron, GitHub Actions,
   or a dedicated worker?
4. **Database?** v0 can live without one (everything read on-chain plus
   in-memory cache). When we add long-term history, Postgres
   (Neon/Supabase) plus a simple schema.
5. **Auth?** Probably none: the session is the connected address. If we add
   paid features, SIWE (Sign-In With Ethereum).

## 9. Suggested incremental roadmap

| Sprint | Deliverable |
|---|---|
| 0 | Scaffold Next.js + wagmi + viem; static landing page; wallet connect |
| 1 | Aave v3 adapter + positions dashboard (1 chain) |
| 2 | Multi-chain (4 chains) with multicall |
| 3 | Morpho Blue adapter + APY comparator |
| 4 | Migration simulator (no execution) |
| 5 | CHF prices + aggregated CHF line |
| 6 | CSV exporter for Swiss taxes |
| 7 | Polish + closed beta with 10 users |
