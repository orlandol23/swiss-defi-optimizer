# Roadmap

What this repository is, what it would take to be a reference ERC-4626 vault
rather than a study of one, and in what order. Written 2026-09-07 from the
audit in [`AUDIT-2026-09.md`](AUDIT-2026-09.md) and the owner's decisions of
2026-09-06.

The rule for this file is the one the README already follows: nothing is
described as done until the PR that did it is linked here. Items carry a
definition of done so a phase can be closed with confidence.

## Where it stands (2026-09-07)

Contracts only, Hardhat, 88 tests. An ERC-4626 vault over USDC with a single
strategy slot, emergency shutdown, and conformance rules that were earned from
two real bugs and are pinned by tests. A mock Swiss compliance contract for
demonstration. A Chainlink price conversion library.

The README's "Known limitations" and "Possible future work" are accurate and
stay the source of truth for what does not exist. This file says what to build
and why.

Not in scope, and not planned in this repository: a frontend, wallet
integration, integration with live yield protocols. The archived proposals in
`proposals/` describe a different product and are kept only so they are not
mistaken for documentation of this one.

## What separates a study from a reference implementation

A reviewer who opens a vault repository looks for five things, in this order.
Each is a phase below.

1. **Who can take the money, and how fast.** Today: a single owner, in two
   transactions, with no delay and no announcement.
2. **What happens when the strategy misbehaves.** Today: a reverting strategy
   freezes the vault; a losing strategy makes every share price too high and is
   never reconciled.
3. **Does the vault tell the truth to integrators.** Today: `maxWithdraw` can
   advertise more than the vault can deliver; `harvest()` emits an event that
   reports no profit.
4. **How was it tested.** Today: unit and conformance tests. No fuzzing, no
   invariant suite, no differential test against a reference implementation.
5. **Has it ever been deployed, and can I read it.** Today: no testnet
   deployment, no verified address.

## Phase 1: the owner's reach, made explicit (decided, small)

- [ ] `Ownable2Step` in place of `Ownable`; `renounceOwnership` overridden to
  revert (a vault with no owner cannot detach a broken strategy).
- [ ] README section "What the owner can do" stating, in plain words, that the
  owner can move 100% of assets into any contract and that no timelock exists.
- [ ] `emergencyDetachStrategy()`: clears `strategy` and `totalAllocated`
  without calling the strategy, emits `StrategyDetached(strategy, lostAssets)`.
  The loss is recorded, not hidden. Covered by a `RevertingStrategy` mock.
- [ ] `ERC4626-CONFORMANCE.md` gains the declared exception: `maxWithdraw` and
  `maxRedeem` report the OZ default and do not account for allocated assets.

**DoD:** the three decisions in `AUDIT-2026-09.md` link to the merged PR; a
reviewer can learn the owner's power from the README alone.

## Phase 2: strategy accounting that survives a loss

- [ ] `IStrategy.totalAssets()` (or `balanceOf`) so the vault can read back
  what the strategy actually holds.
- [ ] `totalAssets()` reconciled against the strategy's report, with a
  documented policy for a shortfall (socialise the loss across shares, which is
  the ERC-4626 default, and emit `StrategyLoss`).
- [ ] `maxWithdraw` / `maxRedeem` bounded by liquidity actually available
  (vault balance plus what the strategy can return), in its own PR, with the
  conformance tests adjusted and the reason written next to each change.
- [ ] `harvest()` either does something real (pull yield from the strategy and
  account for it) or is removed. An event that always reports 0 is worse than
  no event.

**DoD:** a `LosingStrategy` mock that returns less than it was given produces a
correct share price and a withdrawable maximum that never reverts.

## Phase 3: the first-depositor question, decided

- [ ] Decide `_decimalsOffset()`. The OZ default of 0 is thin for a 6-decimal
  asset. Raising it changes share maths for every depositor, so it is a
  decision, recorded as an ADR, not a quiet change. The alternative is a seed
  deposit at deploy, also an ADR.
- [ ] Whichever is chosen, an inflation-attack test that fails on the current
  code and passes after.

**DoD:** `docs/adr/0001-first-depositor-protection.md` exists and the test is
green.

## Phase 4: testing a reviewer will believe

- [ ] Foundry alongside Hardhat, for fuzzing and invariants only (the Hardhat
  suite stays). Invariants: total shares times share price never exceeds total
  assets plus dust; `maxDeposit`/`maxMint`/`maxWithdraw`/`maxRedeem` never
  revert; shutdown is monotonic.
- [ ] The a16z ERC-4626 property test suite run against `Vault`, with every
  deviation either fixed or listed in `ERC4626-CONFORMANCE.md`.
- [ ] `PriceConverter`: `decimals()` guarded, `decimals > 18` rejected, staleness
  checked in `getPriceFeedInfo` as it is in `getLatestPrice`.
- [ ] Coverage reported honestly in `TESTING_GUIDE.md` (the real number, not a
  target), and the guide's frontend steps removed.

**DoD:** `forge test` and `npx hardhat test` both green in CI; the property
suite's deviations are zero or documented.

## Phase 5: deployed and readable

- [ ] `scripts/deploy.ts` with an explicit network allowlist that throws on
  anything unknown, Circle's canonical USDC address for Sepolia, and mocks only
  under a flag that names the network.
- [ ] Deployment to Sepolia with the source verified on Etherscan; address and
  deployment block in the README.
- [ ] A short runbook: how to pause, how to detach, how to transfer ownership
  in two steps, what to check before each.

**DoD:** the README's "Possible future work" loses the line "Testnet deployment
with a verified address on Etherscan" because it is done.

## CI and hygiene (no phase, do as they come)

- [ ] Pin `romeovs/lcov-reporter-action` by SHA (decided).
- [ ] Informational `npm audit` step over the full tree.
- [ ] Index the strategy address in `AssetsAllocated` / `AssetsWithdrawn`.
- [ ] Remove the "storage packing" claim from the README, or pack the storage.

## Out of scope, on purpose

A timelock on owner actions, multi-strategy allocation, a governance token, a
frontend, live protocol adapters. Each would be a product decision, and this
repository is a contracts study that intends to be an honest one. If a
timelock is ever wanted, it goes through an ADR first.

## Principles

1. Nothing ticked by intention. A box closes in the PR that closes it.
2. The README is the reference and stays honest about what does not exist.
3. Every conformance rule is pinned by a test and explained by the bug that
   produced it.
4. Security fixes never relax a gate in the same commit.
