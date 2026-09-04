# Arquitetura — Swiss DeFi Optimizer

> Status: proposta inicial. Decisões marcadas com `[DECISÃO]` ainda estão
> abertas — comentar antes da implementação.
>
> **Nota (2026-09):** esta proposta (stack Next.js/wagmi com frontend) **não
> é o escopo do repositório**, que é contracts-only (Hardhat). Arquivada aqui
> em `docs/proposals/` justamente para não ser confundida com documentação do
> que existe — nada neste arquivo descreve código presente no repo. Para o
> estado real, ver [`../../README.md`](../../README.md).

---

## 1. Stack escolhida

| Camada | Tecnologia | Por quê |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR/SSG para landing, RSC para data fetching server-side de preços; rotas API para tarefas off-chain |
| Linguagem | TypeScript (strict) | Type safety end-to-end, contratos tipados via wagmi codegen |
| Web3 client | viem 2.x | API moderna, tree-shakeable, multicall nativo, melhor DX que ethers |
| Wallet/hooks | wagmi 2.x | Padrão de facto para React + viem; lida com reconnect, chain switching |
| UI | Tailwind + shadcn/ui | Velocidade de prototipagem, componentes acessíveis |
| Estado server | TanStack Query (vem com wagmi) | Cache de leituras on-chain com invalidation por bloco |
| Estado client | Zustand | Filtros de UI, preferências; leve, sem boilerplate de Redux |
| Forms | react-hook-form + zod | Validação tipada em formulários de swap/migração |
| Testes | Vitest + Playwright | Vitest para unit, Playwright para E2E com Anvil fork |
| Lint/format | ESLint + Prettier + biome `[DECISÃO]` | Escolher um — biome só, ou ESLint+Prettier |
| Package mgr | pnpm | Workspaces futuros (app + packages/contracts) |
| Node | >= 20 LTS | App Router + Edge runtime |

## 2. Estrutura de pastas (proposta)

```
swiss-defi-optimizer/
├── apps/
│   └── web/                       # Next.js app
│       ├── app/
│       │   ├── (marketing)/       # Landing, /, /about
│       │   ├── (app)/             # Área autenticada por wallet
│       │   │   ├── dashboard/     # Posições agregadas
│       │   │   ├── opportunities/ # Lista de yields
│       │   │   ├── simulate/      # Simulador de migração
│       │   │   └── tax/           # Exportação de relatório fiscal
│       │   └── api/
│       │       ├── prices/        # Proxy/cache de CoinGecko
│       │       └── apy/           # Snapshot de APYs (cron job)
│       ├── components/
│       ├── hooks/                 # useAavePositions, useMorphoMarkets, etc.
│       ├── lib/
│       │   ├── viem/              # Client config, chains, multicall helpers
│       │   ├── wagmi/             # Config, connectors
│       │   ├── protocols/         # Adapters: aave.ts, morpho.ts
│       │   ├── tax/               # Cost basis FIFO, exportadores
│       │   └── chf/               # XCHF/ZCHF helpers (rates, pools)
│       └── tests/
├── packages/
│   ├── contracts-abi/             # ABIs tipados (gerados via wagmi cli)
│   └── shared/                    # Tipos compartilhados (Position, Opportunity)
├── docs/                          # Decisões de arquitetura (ADRs)
├── VISION.md
├── ARCHITECTURE.md
└── README.md
```

## 3. Camadas e responsabilidades

```
┌──────────────────────────────────────────┐
│  UI (RSC + Client Components)             │
│  - Dashboard, formulários, gráficos        │
└──────────────┬───────────────────────────┘
               │ usa
┌──────────────▼───────────────────────────┐
│  Hooks (wagmi + custom)                   │
│  - useAavePositions(address)              │
│  - useMorphoMarkets(chainId)              │
│  - useOptimizationSuggestions(positions)  │
└──────────────┬───────────────────────────┘
               │ usa
┌──────────────▼───────────────────────────┐
│  Protocol Adapters (puros, testáveis)     │
│  - lib/protocols/aave.ts                  │
│  - lib/protocols/morpho.ts                │
│  - Interface comum: getPositions, getAPY  │
└──────────────┬───────────────────────────┘
               │ usa
┌──────────────▼───────────────────────────┐
│  viem clients (1 por chain)               │
│  - Multicall obrigatório p/ leituras em   │
│    lote                                   │
└──────────────────────────────────────────┘
```

Princípios:
- **Adapters são puros.** Recebem `PublicClient` e endereço; retornam
  posições normalizadas. Sem React, sem hooks. Facilita teste com Anvil.
- **Hooks são finos.** Apenas embrulham adapter em `useQuery` com chave
  estável `[protocol, chain, address, blockTag]`.
- **UI nunca fala com viem direto.** Sempre via hook.

## 4. Integrações externas

| Serviço | Uso | Plano |
|---|---|---|
| RPCs | Leitura on-chain | Default: Ankr público; permitir RPC custom do usuário (campo em settings) |
| CoinGecko Pro `[DECISÃO]` | Preços spot e histórico em CHF | Avaliar Coingecko vs CryptoCompare; ambos têm endpoint CHF nativo |
| DeFiLlama Yields API | Cross-check de APYs | Gratuita, rate-limited |
| Aave v3 subgraph | Histórico de juros | Hosted Service do The Graph |
| Morpho Blue API | Markets e oráculos | Endpoint REST oficial |
| Swiss FX rates | Fallback CHF/USD diário (fisco suíço usa SNB) | https://data.snb.ch (CSV diário, gratuito) |

## 5. Fluxo: "Dashboard inicial"

1. Usuário conecta wallet (wagmi connector).
2. `useAccount()` retorna address + chainId.
3. RSC dispara em paralelo:
   - `getAavePositions(address, [1, 42161, 8453, 10])`
   - `getMorphoPositions(address, [1, 8453])`
   - `getNativeBalances(address, [1, 42161, 8453, 10])`
4. Cada adapter faz **1 chamada multicall por chain** (não N chamadas).
5. Resultados agregados em `Position[]` normalizado.
6. Para cada `Position`, anexa preço CHF do bloco (via cache server-side).
7. UI renderiza com total em CHF + por chain + por protocolo.

## 6. Fluxo: "Sugestão de otimização"

1. Dado `Position[]` do usuário, para cada posição:
   - Buscar APY atual da posição.
   - Buscar APYs de pools alternativos para o mesmo asset.
2. Diferença líquida = `apy_alvo − apy_atual − custo_swap − custo_bridge − gas`.
3. Filtros de risco:
   - TVL mínimo configurável (default 50M USD).
   - Idade do pool (default >= 90 dias).
   - Sem dependência de oráculo de baixa qualidade (whitelist).
4. Top 5 sugestões mostradas com breakdown completo.
5. Clicar em "Simular" abre rota detalhada (swap → bridge → deposit) sem
   executar.

## 7. Modelo de dados (core)

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

## 8. Decisões abertas para discutir

1. **Monorepo (pnpm workspaces) vs single app?** Recomendo monorepo desde já,
   pois prevejo `packages/contracts-abi` e provavelmente um `packages/sdk`
   se abrirmos integração externa.
2. **RSC pesado vs client-heavy?** Recomendo RSC para preços/APYs (cache de
   servidor compartilhado entre usuários) e client para tudo que depende do
   address conectado (privacidade).
3. **Onde rodam os cron jobs de snapshot de APY?** Vercel Cron, GitHub
   Actions, ou um worker dedicado?
4. **Banco de dados?** v0 pode viver sem (tudo lido on-chain + cache em
   memória). Quando adicionarmos histórico longo, Postgres (Neon/Supabase) +
   um schema simples.
5. **Auth?** Provavelmente nenhuma — sessão é o address conectado. Se
   adicionarmos features pagas, SIWE (Sign-In With Ethereum).

## 9. Roadmap incremental sugerido

| Sprint | Entrega |
|---|---|
| 0 | Scaffold Next.js + wagmi + viem; landing estática; conectar wallet |
| 1 | Adapter Aave v3 + dashboard de posições (1 chain) |
| 2 | Multi-chain (4 chains) com multicall |
| 3 | Adapter Morpho Blue + comparador de APY |
| 4 | Simulador de migração (sem executar) |
| 5 | Preços em CHF + linha CHF agregada |
| 6 | Exportador CSV para imposto suíço |
| 7 | Polimento + beta fechado com 10 usuários |
