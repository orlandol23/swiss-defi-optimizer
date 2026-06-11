# Swiss DeFi Optimizer — Visão de Produto

> Status: rascunho inicial. As seções marcadas com `[A VALIDAR]` são suposições
> feitas na ausência de um briefing escrito e devem ser confirmadas antes da
> implementação.

---

## 1. Pitch em uma linha

Um otimizador de capital em DeFi com lente suíça: ajuda residentes e tesourarias
na Suíça a alocar, monitorar e movimentar capital entre protocolos DeFi
preservando exposição em CHF (XCHF, ZCHF/Frankencoin) e gerando relatórios
compatíveis com a contabilidade suíça.

## 2. Problema

- **Fragmentação de yield:** APYs e incentivos mudam diariamente entre Aave,
  Compound, Morpho, Spark, Pendle, Curve, etc. Acompanhar manualmente é
  inviável.
- **Custo de câmbio CHF↔stable USD:** a maioria das pools de yield são USD-
  denominadas; entrar/sair de CHF na cadeia certa, no momento certo, com a
  rota certa (CoW Swap, 1inch, Uniswap v4) é não-trivial.
- **Compliance suíço:** residentes pagam imposto sobre patrimônio (Vermögens-
  steuer) e precisam declarar holdings em 31/12. Não há ferramenta DeFi-nativa
  que produza o relatório no formato esperado pelos cantões.
- **L2 sprawl:** capital fica preso na L1 enquanto o melhor APY está na Base
  ou Arbitrum. Bridging consciente de custo/risco é manual.

## 3. Público-alvo `[A VALIDAR]`

| Persona | Necessidade primária |
|---|---|
| Investidor cripto-nativo na Suíça | Maximizar APY mantendo exposição CHF parcial |
| Família office / tesouraria de PME | Diversificar caixa em stable on-chain com trilha de auditoria |
| Power user DeFi global | Dashboard cross-chain com execução one-click |

A v0 mira a **persona 1** porque é a mais fácil de alcançar (canais: X,
Reddit r/SwissPersonalFinance, eventos Crypto Valley) e tolera UX rough.

## 4. Proposta de valor / diferencial

O que **não** somos: mais um clone de Zapper/DeBank/DeFiLlama.

O que **somos**:
1. **CHF-first.** XCHF e ZCHF são cidadãos de primeira classe na UI, com pools
   e rotas específicas pré-curadas.
2. **Tax-aware.** Cada movimento é capturado para gerar o relatório anual
   estilo Steuererklärung (CSV + PDF), com cost basis FIFO.
3. **Opinionado, não agnóstico.** Recomenda rotas e protocolos com filtro de
   risco (TVL mínimo, audit score, exposição a oráculo); não despeja 500
   pools sem hierarquia.
4. **Open-source e self-hostável.** O alvo são usuários que desconfiam de
   custódia — todo o código roda no browser + RPC do usuário.

## 5. Escopo do MVP (v0.1)

Incluído:
- Conectar wallet via wagmi (MetaMask, WalletConnect, Rabby, Ledger).
- Ler posições em Ethereum + Arbitrum + Base + Optimism via viem multicall.
- Listar oportunidades de yield para: USDC, ETH, wstETH, XCHF, ZCHF.
- Comparar APYs em Aave v3 e Morpho Blue (2 protocolos só, para focar).
- Simular rota de migração: "tirar X de Aave-ETH e mover para Morpho-Base".
- Exportar histórico de transações em CSV com colunas amigáveis ao fisco
  suíço (data, tipo, ativo, qtd, valor CHF na data, contraparte).

Fora do escopo da v0:
- Execução automática (apenas sugere; usuário assina e envia).
- Estratégias alavancadas, perps, opções.
- Cadeias não-EVM (Solana, Sui, Cosmos).
- Multi-conta / multi-wallet em uma sessão.
- Conta institucional com KYC.

## 6. Métricas de sucesso (3 meses pós-launch) `[A VALIDAR]`

- 500 wallets únicas conectadas.
- 50 usuários ativos semanais.
- 10 relatórios fiscais gerados em janeiro 2027.
- TVL "trackeado" (não custodiado) de USD 5M.

## 7. Riscos principais

| Risco | Mitigação |
|---|---|
| Concorrência de Zapper/DeBank adicionar feature CHF | Velocidade no nicho fiscal + open source |
| ZCHF/XCHF terem liquidez insuficiente | Listar pools com volume mínimo; alertar usuário |
| Regulação suíça (FINMA) considerar "consultoria de investimento" | Disclaimer explícito; sem custódia; sem execução automática |
| Custos de RPC ao escalar | Multicall agressivo; cache no edge; permitir RPC do usuário |

## 8. Premissas a validar com você

1. O foco "suíço" é diferencial real ou só naming? (Se for só naming, o
   produto vira commodity contra Zapper.)
2. v0 deve ter wallet connect ou pode ser read-only por endereço (mais
   simples, sem assinatura)?
3. Open source desde o dia 1 ou privado até validar tração?
4. Modelo de receita: gratuito + doações, fee no swap roteado, ou SaaS?
