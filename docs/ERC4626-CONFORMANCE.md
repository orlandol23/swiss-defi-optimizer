# ERC-4626 conformance

`Vault` overrides the standard entry points rather than inheriting them
wholesale. Two bugs got past review before that was true, and both were the
same shape: **the limit the vault advertised and the limit it enforced were
two different numbers.** This document records the rules that came out of
those bugs and the tests that pin them, so the next contract change does not
reintroduce them.

## The three rules

**1. Never name a state variable after a standard ERC-4626 function.**

`Vault` used to declare:

```solidity
uint256 public maxDeposit;
```

That generates a zero-argument getter `maxDeposit()`. OpenZeppelin's
`ERC4626` supplies `maxDeposit(address)`. Different signatures, so Solidity
treats them as **overloads, not a conflict** — it compiles, the tests pass,
and the standard entry point is silently never overridden. An integrator
reading the vault through the ERC-4626 interface saw `type(uint256).max`,
sized a deposit against it, and got a revert.

The cap is now `depositCap`, which frees the standard name.

**2. The advertised maximum and the enforced maximum must not drift apart.**

`deposit` and `mint` enforce their limit by calling `maxDeposit(receiver)` /
`maxMint(receiver)` — never by reading `depositCap` directly. There is then
no way for the two to disagree, because there is only one number.

The first fix covered `deposit` only. `mint` still went straight to
`super.mint()`, so the cap stayed bypassable from the other entry point:
with the cap at 100 USDC, `mint()` put 200 USDC in. Same class of bug, one
function over.

**3. `maxDeposit`/`maxMint`/`maxWithdraw`/`maxRedeem` MUST NOT revert, and
MUST return 0 when the action is disabled.**

Per EIP-4626, including during emergency shutdown. Current implementation
(`contracts/core/Vault.sol`):

```solidity
function maxDeposit(address) public view override returns (uint256) {
    if (emergencyShutdown) return 0;
    return depositCap;
}

function maxMint(address) public view override returns (uint256) {
    if (emergencyShutdown) return 0;
    if (depositCap == type(uint256).max) return type(uint256).max;
    return convertToShares(depositCap);
}
```

The uncapped case in `maxMint` is special-cased deliberately: converting
`type(uint256).max` to shares would overflow.

## Deliberate behaviours, so a later "consistency" change does not break them

- **Withdrawals stay uncapped and stay open during emergency shutdown.** The
  shutdown blocks new deposits only. `maxWithdraw`/`maxRedeem` keep the
  OpenZeppelin defaults, which are correct for this design; they are covered
  by tests rather than overridden.
- **`triggerEmergencyShutdown` is one-way.** There is no resume function. A
  vault that has been shut down stays in withdrawal-only mode.
- **Preview functions ignore the cap**, per EIP-4626 — a preview must not
  revert because of a vault-specific limit.
- **Rounding favours the cap.** `convertToShares` rounds down and
  `previewMint` rounds back up, so the assets pulled for exactly
  `maxMint()` shares never exceed the cap. A test moves the exchange rate
  off 1:1 first and then asserts this across four cap values.

## What pins the regressions

Both bugs were invisible to the suite that existed when they shipped, because
every assertion read the state variable (`vault.maxDeposit()`), never the
standard function. The tests that would now catch them:

| Test | Catches |
| --- | --- |
| **ABI assertion**: exactly one `maxDeposit` fragment, taking one `address` | Rule 1 — the bug was the *existence* of a second overload |
| **Round trip**: depositing exactly `maxDeposit(receiver)` succeeds, `+1` reverts with `ExceedsDepositCap` | Rule 2, deposit side |
| Same round trip through `mint`/`maxMint`, with the exchange rate off 1:1 | Rule 2, mint side |
| `max*` return 0 under shutdown; do not revert on a zero cap or the zero address | Rule 3 |
| Full redeem while shutdown is active | The deliberate behaviour above |

Every one of them calls the **standard function**, not the state variable.
That is the whole point: a test that reads the internal number cannot detect
a vault lying to the standard interface.

Run them with `npm test` — see [`../TESTING_GUIDE.md`](../TESTING_GUIDE.md).
