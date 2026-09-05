# Swiss DeFi Optimizer, Product Vision

> Status: initial draft. Sections marked `[TO CONFIRM]` are assumptions made
> in the absence of a written brief and must be confirmed before
> implementation.
>
> **Note (2026-09):** this vision describes a product (multi-chain dashboard
> with a frontend) that **is not the scope of this repository**, which is
> contracts-only. Archived here in `docs/proposals/` precisely so it is not
> mistaken for documentation of what exists: nothing in this file describes
> code present in the repo. For the real state, see
> [`../../README.md`](../../README.md).

---

## 1. One-line pitch

A DeFi capital optimizer with a Swiss lens: helps residents and treasuries in
Switzerland allocate, monitor and move capital across DeFi protocols while
preserving CHF exposure (XCHF, ZCHF/Frankencoin) and generating reports
compatible with Swiss accounting.

## 2. Problem

- **Yield fragmentation:** APYs and incentives change daily across Aave,
  Compound, Morpho, Spark, Pendle, Curve, etc. Tracking this manually is not
  viable.
- **CHF <-> stable USD exchange cost:** most yield pools are USD-denominated;
  entering/exiting CHF on the right chain, at the right time, via the right
  route (CoW Swap, 1inch, Uniswap v4) is non-trivial.
- **Swiss compliance:** residents pay wealth tax (Vermögenssteuer) and must
  declare holdings on 31/12. There is no DeFi-native tool that produces the
  report in the format the cantons expect.
- **L2 sprawl:** capital sits idle on L1 while the best APY is on Base or
  Arbitrum. Cost/risk-aware bridging is manual.

## 3. Target audience `[TO CONFIRM]`

| Persona | Primary need |
|---|---|
| Crypto-native investor in Switzerland | Maximize APY while keeping partial CHF exposure |
| Family office / SME treasury | Diversify cash into on-chain stables with an audit trail |
| Global DeFi power user | Cross-chain dashboard with one-click execution |

v0 targets **persona 1** because it is the easiest to reach (channels: X,
Reddit r/SwissPersonalFinance, Crypto Valley events) and tolerates rough UX.

## 4. Value proposition / differentiator

What we are **not**: another Zapper/DeBank/DeFiLlama clone.

What we **are**:
1. **CHF-first.** XCHF and ZCHF are first-class citizens in the UI, with
   pools and routes specifically pre-curated.
2. **Tax-aware.** Every movement is captured to generate the annual
   Steuererklärung-style report (CSV + PDF), with FIFO cost basis.
3. **Opinionated, not agnostic.** Recommends routes and protocols with a
   risk filter (minimum TVL, audit score, oracle exposure); does not dump
   500 pools with no hierarchy.
4. **Open source and self-hostable.** The target users distrust custody:
   all the code runs in the browser plus the user's own RPC.

## 5. MVP scope (v0.1)

Included:
- Connect wallet via wagmi (MetaMask, WalletConnect, Rabby, Ledger).
- Read positions on Ethereum + Arbitrum + Base + Optimism via viem multicall.
- List yield opportunities for: USDC, ETH, wstETH, XCHF, ZCHF.
- Compare APYs on Aave v3 and Morpho Blue (2 protocols only, to stay
  focused).
- Simulate a migration route: "take X out of Aave-ETH and move it to
  Morpho-Base".
- Export transaction history as CSV with columns friendly to the Swiss tax
  authorities (date, type, asset, quantity, CHF value on that date,
  counterparty).

Out of scope for v0:
- Automatic execution (only suggests; the user signs and sends).
- Leveraged strategies, perps, options.
- Non-EVM chains (Solana, Sui, Cosmos).
- Multi-account / multi-wallet in one session.
- Institutional account with KYC.

## 6. Success metrics (3 months post-launch) `[TO CONFIRM]`

- 500 unique wallets connected.
- 50 weekly active users.
- 10 tax reports generated in January 2027.
- USD 5M in "tracked" (not custodied) TVL.

## 7. Main risks

| Risk | Mitigation |
|---|---|
| Zapper/DeBank adding a CHF feature as competition | Speed in the tax niche plus open source |
| ZCHF/XCHF having insufficient liquidity | List pools with a minimum volume; warn the user |
| Swiss regulation (FINMA) treating this as "investment advice" | Explicit disclaimer; no custody; no automatic execution |
| RPC costs at scale | Aggressive multicall; edge caching; allow the user's own RPC |

## 8. Assumptions to validate with you

1. Is the "Swiss" focus a real differentiator or just naming? (If it is just
   naming, the product becomes a commodity against Zapper.)
2. Should v0 have wallet connect, or can it be read-only by address (simpler,
   no signature)?
3. Open source from day 1, or private until traction is validated?
4. Revenue model: free plus donations, a fee on routed swaps, or SaaS?
