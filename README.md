# Swiss DeFi Yield Optimizer 🇨🇭

> Cofre DeFi (ERC-4626) em Solidity com um módulo de *compliance* inspirado nas regras suíças e conversão de moeda via oráculos Chainlink. **Projeto de smart contracts** (Hardhat + TypeScript) — não há frontend.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org/)

## Overview

Vault tokenizado **ERC-4626** que aceita USDC e pode alocar fundos em uma estratégia externa
(via interface `IStrategy`), acompanhado de um módulo de compliance e conversão de preço.
O foco do projeto é o **código dos contratos e seus testes**, como peça de estudo de DeFi/Solidity.

- **Smart contracts:** vault ERC-4626 com `ReentrancyGuard`, `Ownable` e `SafeERC20`.
- **Oráculos:** Chainlink Price Feeds para conversão CHF/USD.
- **Compliance:** módulo *mock* que simula tributação suíça (renda/patrimônio) e checagem KYC/AML.
- **Tooling:** Hardhat + TypeScript + TypeChain + ethers v6 (apenas em scripts e testes).

> ⚠️ Escopo: este repositório contém **apenas os contratos**. Não há frontend, integração com
> carteira nem integração com protocolos externos (Aave/Compound/Curve) — ver "Possível trabalho futuro".

## Contratos

- **`Vault.sol`** — vault ERC-4626 sobre USDC, com gestão de estratégia e *emergency shutdown*.
- **`SwissCompliance.sol`** — módulo *mock* de regras tributárias suíças (demonstração).
- **`PriceConverter.sol`** — biblioteca de integração com Chainlink para conversão multi-moeda.
- **`interfaces/IStrategy.sol`**, **`interfaces/AggregatorV3Interface.sol`** — interfaces.
- **`mocks/MockUSDC.sol`** — ERC-20 de teste.

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

- **Imposto de renda** sobre yield DeFi: 0–40%
- **Imposto sobre patrimônio:** 0,1–1%
- **Relatórios:** conversão multi-moeda CHF/USD via Chainlink
- **KYC/AML:** checagem simulada

> ⚠️ Este módulo é um **mock simplificado** para fins de demonstração. Não constitui aconselhamento
> tributário. Consulte um profissional para conformidade real.

## Tech Stack

- **Solidity:** ^0.8.20
- **Framework:** Hardhat + TypeScript
- **Bibliotecas:** OpenZeppelin Contracts **v5.0.2** (ERC-4626, Ownable, ReentrancyGuard, SafeERC20), Chainlink Contracts (price feeds)
- **Testes:** Hardhat Toolbox (Chai + matchers), `solidity-coverage`, `hardhat-gas-reporter`
- **Tipagem:** TypeChain (typings dos contratos para os testes/scripts)

## Installation

Pré-requisitos: Node.js >= 18.

```bash
npm install
cp .env.example .env        # edite as chaves (opcional para rodar os testes locais)
```

## Usage

```bash
npm run compile      # compila os contratos
npm test             # testes unitários (Hardhat)
npm run coverage     # relatório de cobertura
npm run gas-report   # relatório de gás
```

### Deploy

```bash
npm run deploy:localhost   # rede Hardhat local
npm run deploy:sepolia     # testnet Sepolia (requer .env)
```

## Testing

Testes unitários (`test/unit/Vault.test.ts`) cobrindo o ciclo de vida do vault:

- Deploy e inicialização (nome, símbolo, asset, owner)
- Depósitos e saques/resgates (ERC-4626)
- Gestão de estratégia (alocação/retirada)
- Controle de acesso (`Ownable`)
- Emergency shutdown
- Casos de borda e validação de erros

## Security

Mecanismos efetivamente implementados nos contratos:

- **ReentrancyGuard** nas funções que mudam estado
- **Ownable** para funções administrativas
- **SafeERC20** nas transferências de token
- **Validação de inputs** e **emergency shutdown** (circuit breaker) no vault

> ⚠️ **Não auditado.** Projeto de portfólio/demonstração. Não use com fundos reais.

## Gas

Técnicas aplicadas: `constant`/`immutable` para valores fixos, packing de storage,
visibilidade `external` quando possível e cache de leituras de storage em memória.

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
│   ├── deploy.ts          # script de deploy
│   └── verify.ts          # verificação no Etherscan
├── deployments/           # endereços de deploy
└── docs/                  # documentação
```

## Possível trabalho futuro (não implementado)

- Frontend (carteira + dashboard) — **não existe neste repositório**
- Integração com protocolos de yield reais (Aave/Compound/Curve)
- Testes de integração e de segurança dedicados
- Deploy em testnet com endereço verificado no Etherscan

## License

MIT

## Disclaimer

**Projeto para fins educacionais e de portfólio.** NÃO é aconselhamento financeiro, jurídico ou
tributário. **Não auditado** — não use com fundos reais.
