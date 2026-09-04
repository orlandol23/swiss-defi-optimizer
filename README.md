# Swiss DeFi Yield Optimizer 🇨🇭

> A Solidity DeFi vault (ERC-4626) with a *compliance* module inspired by Swiss tax rules and currency conversion through Chainlink oracles. **A smart contract project** (Hardhat + TypeScript) — there is no frontend.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org/)

## Overview

A tokenized **ERC-4626** vault that accepts USDC and can allocate funds to an external strategy
(through the `IStrategy` interface), alongside a compliance and price conversion module.
The project focuses on the **contract code and its tests**, as a DeFi/Solidity study piece.

- **Smart contracts:** ERC-4626 vault with `ReentrancyGuard`, `Ownable` and `SafeERC20`.
- **Oracles:** Chainlink Price Feeds for CHF/USD conversion.
- **Compliance:** *mock* module simulating Swiss taxation (income/wealth) and KYC/AML checks.
- **Tooling:** Hardhat + TypeScript + TypeChain + ethers v6 (in scripts and tests only).

> ⚠️ Scope: this repository contains **the contracts only**. There is no frontend, no wallet
> integration and no integration with external protocols (Aave/Compound/Curve) — see "Possible future work".

## Contracts

- **`Vault.sol`** — ERC-4626 vault over USDC, with strategy management and *emergency shutdown*.
- **`SwissCompliance.sol`** — *mock* module of Swiss tax rules (demonstration). **Standalone: the vault does not call it.**
- **`PriceConverter.sol`** — Chainlink integration library for multi-currency conversion.
- **`interfaces/IStrategy.sol`**, **`interfaces/AggregatorV3Interface.sol`** — interfaces.
- **`mocks/MockUSDC.sol`** — test ERC-20.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Smart Contracts Layer                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Vault.sol    │◄─┤ Swiss        │  │ PriceConverter│  │
│  │ (ERC-4626)   │  │ Compliance   │  │ (library)     │  │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘   │
│         │ IStrategy                          │           │
│         ▼                                    ▼           │
│  ┌──────────────┐                    ┌──────────────┐   │
│  │ Strategy     │                    │ Chainlink    │   │
│  │ (interface)  │                    │ Oracles      │   │
│  └──────────────┘                    └──────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Compliance (mock)

- **Income tax** on DeFi yield: 0–40%
- **Wealth tax:** 0.1–1%
- **Reporting:** multi-currency CHF/USD conversion via Chainlink
- **KYC/AML:** simulated checks

> ⚠️ This module is a **simplified mock** for demonstration purposes. It does not constitute tax
> advice. Consult a professional for real compliance.

> ⚠️ **Not wired into the vault.** `SwissCompliance` is a standalone contract. `Vault.sol` never
> calls it, and no deposit or withdrawal is gated on compliance — the deploy script simply deploys
> the two side by side. Treat it as an isolated study piece, not as a compliance layer the vault
> enforces. `isCompliant()` reads the owner-managed `isAllowlisted` allowlist, which is a stand-in
> for KYC, not KYC.

## Tech Stack

- **Solidity:** ^0.8.20
- **Framework:** Hardhat + TypeScript
- **Libraries:** OpenZeppelin Contracts **v5.4.0** (ERC-4626, Ownable, ReentrancyGuard, SafeERC20) — the last 5.x release that still compiles under Solidity 0.8.20; 5.5.0 onwards requires ^0.8.24. Chainlink price feeds are the oracle design, but the only Chainlink code here is `AggregatorV3Interface`, vendored in `contracts/interfaces/` — the `@chainlink/contracts` package is not a dependency.
- **Tests:** Hardhat Toolbox (Chai + matchers), `solidity-coverage`, `hardhat-gas-reporter`
- **Typings:** TypeChain (contract typings for the tests/scripts)

## Installation

Prerequisites: Node.js >= 18.

```bash
npm install
cp .env.example .env        # edit the keys (optional for running the local tests)
```

## Usage

```bash
npm run compile      # compile the contracts
npm test             # unit tests (Hardhat)
npm run coverage     # coverage report
npm run gas-report   # gas report
```

### Deploy

```bash
npm run deploy:localhost   # local Hardhat network
npm run deploy:sepolia     # Sepolia testnet (requires .env)
```

## Testing

Unit tests (`test/unit/Vault.test.ts`) covering the vault lifecycle:

- Deployment and initialization (name, symbol, asset, owner)
- Deposits and withdrawals/redemptions (ERC-4626)
- Strategy management (allocation/withdrawal)
- Access control (`Ownable`)
- Emergency shutdown
- Edge cases and error validation

## Security

Mechanisms actually implemented in the contracts:

- **ReentrancyGuard** on state-changing functions
- **Ownable** for administrative functions
- **SafeERC20** on token transfers
- **Input validation** and **emergency shutdown** (circuit breaker) in the vault

> ⚠️ **Not audited.** Portfolio/demonstration project. Do not use with real funds.

## Gas

Techniques applied: `constant`/`immutable` for fixed values, storage packing,
`external` visibility where possible and caching storage reads in memory.

## Project Structure

```
swiss-defi-optimizer/
├── contracts/
│   ├── core/              # Vault.sol (ERC-4626)
│   ├── compliance/        # SwissCompliance.sol (mock)
│   ├── libraries/         # PriceConverter.sol (Chainlink)
│   ├── interfaces/        # IStrategy, AggregatorV3Interface
│   └── mocks/             # MockUSDC.sol
├── test/
│   └── unit/              # Vault.test.ts
├── scripts/
│   ├── deploy.ts          # deployment script
│   └── verify.ts          # Etherscan verification
├── deployments/           # deployment addresses (empty — nothing deployed yet)
└── docs/
    ├── ERC4626-CONFORMANCE.md   # the standard's rules, the two bugs, the tests that pin them
    └── proposals/               # archived product proposals — NOT descriptions of this repo
```

Documentation worth reading, in order: this README for scope,
[`TESTING_GUIDE.md`](TESTING_GUIDE.md) for the suite, and
[`docs/ERC4626-CONFORMANCE.md`](docs/ERC4626-CONFORMANCE.md) for the
standard-conformance rules the vault has to hold to.

`docs/proposals/` holds an earlier product vision (a multi-chain frontend
dashboard) that was never built and is **not** the scope of this repository.
It is kept for history, in a folder named so it cannot be mistaken for
documentation of the code.

## Possible future work (not implemented)

- Frontend (wallet + dashboard) — **does not exist in this repository**
- Integration with real yield protocols (Aave/Compound/Curve)
- Dedicated integration and security tests
- Testnet deployment with a verified address on Etherscan

## License

MIT — see [LICENSE](LICENSE).

## Disclaimer

**Project for educational and portfolio purposes.** This is NOT financial, legal or tax advice.
**Not audited** — do not use with real funds.
