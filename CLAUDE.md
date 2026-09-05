# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Commit and PR conventions

Commits are authored as `Orlando Fernandes
<27815856+orlandol23@users.noreply.github.com>`, set by `env` in
`.claude/settings.json`. Confirm it landed with
`git log -1 --format='%an <%ae>'`; if another identity got in, amend with
`--reset-author` instead of leaving it in the history.

Nothing in a commit message or a pull request body may name the tool or the
session that wrote it: no `Co-Authored-By:` trailer, no `Claude-Session:`
trailer, no "Generated with/by Claude Code" footer, and no `claude.ai/code`
link. Describe the change, not how it was produced.

PR bodies may be written in Portuguese. They are read by the repository owner,
not by visitors browsing the code.

## Language

The README is the reference, and it is in English. So is everything else a
visitor reads on GitHub: documentation, code comments, test names, commit
messages and PR titles.

Solidity NatSpec is already English and stays that way. There is no locale
bundle in this repository, so there is no product-content exception.

## Scope

Smart contracts only — Hardhat + TypeScript. There is no frontend, no wallet
integration and no integration with external yield protocols. Keep the README
honest about that; do not describe unbuilt work as if it exists.

## Commands

```bash
npm install
npm run compile      # hardhat compile
npm test             # hardhat test — 87 tests
npm run coverage     # solidity-coverage
npm run size         # contract sizes
```

Keep the test count in `TESTING_GUIDE.md` in sync when tests are added.

Compiling downloads the `solc` binary from `binaries.soliditylang.org` on first
run; restricted networks will fail there, and CI is then the only way to verify
contract changes.

## Contracts

| File                             | Role                                        |
| -------------------------------- | ------------------------------------------- |
| `core/Vault.sol`                 | ERC-4626 vault over USDC, strategy + shutdown|
| `compliance/SwissCompliance.sol` | Mock Swiss tax rules (demonstration only)    |
| `libraries/PriceConverter.sol`   | Chainlink price feed conversion              |
| `mocks/MockUSDC.sol`             | Test ERC-20                                  |

## ERC-4626 conformance

The rules below are the short form. `docs/ERC4626-CONFORMANCE.md` has the
long form: the two bugs that produced them, why the old tests could not see
them, and the tests that now pin each rule. Keep the two in agreement.

`Vault` overrides the standard entry points. Two rules that previous bugs
violated:

- The advertised maximum and the enforced maximum must never drift apart.
  `deposit`/`mint` enforce their limit by calling `maxDeposit(receiver)` /
  `maxMint(receiver)` rather than reading the cap directly.
- Per EIP-4626, `maxDeposit`/`maxMint`/`maxWithdraw`/`maxRedeem` MUST NOT
  revert, and MUST return 0 when the corresponding action is disabled
  (including during emergency shutdown).

Never name a state variable after a standard ERC-4626 function — the generated
zero-argument getter shadows the standard entry point and integrators read the
wrong value.
