# Swiss DeFi Optimizer — Vault State Register

## 1. Estado atual do projeto

O repositório atual contém contratos Solidity, testes Hardhat, scripts de deployment e documentação operacional. Ele não contém uma interface web funcional, não contém wallet integration e não apresenta deployment público verificado ou integração com protocolos externos.

### 1.1 O que existe

- Contratos em `contracts/`:
  - `contracts/core/Vault.sol` como estudo de vault ERC-4626 sobre USDC;
  - `contracts/compliance/SwissCompliance.sol` como módulo standalone mock de regras suíças;
  - `contracts/libraries/PriceConverter.sol` para conversão CHF/USD via feed configurado;
  - `contracts/interfaces/IStrategy.sol` como interface mínima para estratégia;
  - `contracts/mocks/` para testes e fixtures locais.
- Testes em `test/unit/` para Vault e SwissCompliance.
- Scripts em `scripts/deploy.ts` para deploy local/testnet.
- Documentação em `README.md`, `TESTING_GUIDE.md` e `docs/ERC4626-CONFORMANCE.md`.
- Propostas arquivadas em `docs/proposals/` que descrevem uma visão futura de frontend/produto, mas não a implementação real do repositório.

### 1.2 O que não existe

- Frontend implementado na branch principal.
- Wallet integration.
- RPC ou acesso on-chain em UI.
- Deployment público verificado de vault ou compliance.
- Integração comprovada com Aave, Morpho, DeFiLlama, Zapper, DeBank ou outros protocolos.
- Produto DeFi funcional para renda, otimização ou execução.

### 1.3 Contratos vs. produto frontend

O código presente representa uma base de contratos e um estudo de contabilidade ERC-4626. Isso é diferente de um produto de interface de usuário. O contrato pode ser funcional como estudo de regras, com limitações conhecidas, enquanto o produto frontend precisa de decisão de experiência, claims, dados, fontes, estados visuais e arquitetura de apresentação.

A primeira UI futura deve representar honestamente esta distinção: ela comunica o estado do estudo, não um produto operacional concluído.

### 1.4 Proposta arquivada vs. implementação

`docs/proposals/VISION.md` e `docs/proposals/ARCHITECTURE.md` documentam uma visão futura de produto, mas não descrevem o que está implementado hoje. O repositório atual é contracts-only. O que está em `docs/proposals/` é histórico e deve ser tratado como proposta arquivada, não como escopo presente.

### 1.5 Estado do PR #8

O PR #8 está aberto e é documental. Conforme leitura do PR, ele adiciona documentação de roadmap e auditoria e ajusta `package.json` para o `repository.url`, sem alterar a lógica de Solidity. O PR não é uma UI, não é metadata de produto em sentido operacional, e não introduz frontend. Ele deve ser tratado como documentação de planejamento e contexto, não como implementação da primeira interface visual.

### 1.6 Estado de deployment

O script `scripts/deploy.ts` pode preparar deployments locais ou em testnet, mas o repositório não tem deployment público verificado na `main` e a documentação não afirma um deployment confirmável do vault. O projeto não deve ser apresentado como implantado. `deployments/` está vazio ou sem artefato verificado que sustente um endereço de produção.

### 1.7 Limitações técnicas relevantes

- `Vault.sol` é um estudo ERC-4626 sobre USDC.
- `harvest()` é placeholder: registra timestamp e emite `Harvest(0)`; não realiza rendimento.
- `totalAllocated` não é reconciliado com o saldo real da strategy.
- `SwissCompliance.sol` é um mock standalone e não é chamado por `Vault.sol`.
- A allowlist de `SwissCompliance` não é KYC real.
- A conversão CHF/USD depende de um price feed configurado.
- O projeto não está auditado.
- O projeto não deve ser usado com fundos reais.
- `docs/proposals/` não representa implementação atual.

### 1.8 Divergência de baseline registrada

O baseline observado antes da edição foi:

- branch atual: `ui/vault-state-register`;
- HEAD: `a2d4258e0eb74cf020b0d6cc90e98076213b2020`;
- working tree limpo;
- o commit corresponde ao SHA esperado reportado no baseline obrigatório;
- a branch atual não é `main`, mas a revisão do repo indica que este ramo foi criado a partir do commit esperado e não foi alterado por esta tarefa.

A divergência de branch em relação a `main` é registrada aqui, sem tentativa de correção automática.

---

## 2. Decisão de produto

A primeira superfície frontend será chamada:

Swiss DeFi Optimizer — Vault State Register

Descritor:

ERC-4626 vault study — read-only preview

A primeira versão será:

- estática;
- read-only;
- sem wallet;
- sem RPC;
- sem transações;
- sem dados live;
- baseada em uma fixture de preview explicitamente identificada;
- orientada a explicar o estado e as limitações do vault.

Essa decisão é mais correta do que iniciar com um dashboard DeFi completo porque o repositório atual não tem infraestrutura, dados confiáveis, endereço de deployment verificado, wallet integrar, estratégia operacional ou dados on-chain confirmados. Um dashboard funcional de otimização de rendimento presumia um produto que ainda não existe e exigiria claims que o código atual não sustenta. A primeira fase deve comunicar honestidade: estado do vault, limites de implementação, marcação de preview e separação clara entre estudo e produto.

---

## 3. Problema que a UI resolve

A UI não pretende oferecer otimização de rendimento nesta primeira fase.

O objetivo inicial é tornar legível:

- o padrão ERC-4626 estudado;
- o modelo de ativo USDC;
- o estado de deployment;
- a contabilidade prevista;
- as limitações da strategy;
- o emergency shutdown;
- o comportamento de harvest;
- a separação entre Vault e SwissCompliance;
- as limitações de segurança e auditoria.

A primeira tela deve responder ao que o usuário precisa saber antes de qualquer hipótese de rendimento: o sistema é apenas um estudo, com leitura de estado e sem execução. A superfície é um registro, não uma ferramenta operacional.

---

## 4. Direção visual

Definição de direção visual:

Vault State Register

A linguagem visual deve ser baseada em:

- registro operacional;
- superfícies sólidas;
- linhas finas;
- divisores;
- valores alinhados;
- densidade editorial controlada;
- tipografia sans-serif do sistema;
- tipografia monoespaçada para valores técnicos;
- ausência de decoração sem função;
- leitura rápida do estado principal.

A interface não deve parecer:

- startup SaaS de IA;
- dashboard DeFi genérico;
- app bancário genérico;
- crypto landing page;
- clone de Zapper ou DeBank;
- variação visual do AI-DLH;
- variação visual do KYA;
- variação visual do Boxing.

A apresentação deve ser funcional, econômica e precisa, com foco em clareza e não em espetáculo. Nenhuma parte da interface deve sugerir que o produto já esteja em operação real.

---

## 5. Regras de autoria e propriedade

- a UI deve ser original;
- nenhum layout de referência será copiado;
- nenhum SVG externo será usado sem licença;
- nenhuma fonte externa será adicionada sem justificativa e licença;
- nenhum logo de protocolo será adicionado;
- nenhum logo da FINMA será usado;
- a cruz suíça não será usada como sinal de aprovação ou compliance;
- nenhuma imagem de stock ou asset gerado será necessário na primeira fase;
- o design record deve explicar as decisões próprias do produto.

A autoria deve ser documentada e o design deve celebrar a neutralidade do estudo. Nenhum elemento visual deve sugerir aprovação regulatória, compliance real ou performance auditável.

---

## 6. Design tokens iniciais

Os tokens abaixo são propostos como semânticos, sem exigir ainda sua implementação.

```ts
const tokens = {
  canvas: '#F5F5F3',
  surface: '#FFFFFF',
  surfaceStrong: '#EAE9E5',
  ink: '#171A1F',
  inkMuted: '#5E6773',
  rule: '#D8D7D2',
  ruleStrong: '#B8B5AE',
  info: '#2F5F9F',
  warning: '#B86B00',
  danger: '#B42318',
  confirmed: '#1F7A4B',
  focus: '#2557D6',
  radius: {
    tight: 2,
    control: 4,
    panel: 8,
  },
};
```

A escala reduzida evita a aparência genérica de cards SaaS e reforça a linguagem de registro operacional.

Proibido explicitamente:

- gradientes;
- glassmorphism;
- neon;
- glow;
- backdrop-filter ornamental;
- sombras decorativas;
- gráficos sem dados;
- pills para todos os atributos;
- excesso de uppercase;
- tracking exagerado.

Semântica das cores:

- vermelho apenas para risco/bloqueio;
- amarelo ou âmbar para atenção;
- azul/cinza para informação;
- verde somente para confirmação real;
- neutro para preview e ausência de fonte.

A identidade visual deve ser funcional e editorial, com pouca ornamentação e muita legibilidade.

---

## 7. Estrutura de informação da primeira tela

A ordem da primeira tela deve seguir esta sequência:

1. Masthead.
2. Risk strip.
3. Vault State Register.
4. Accounting Model.
5. Strategy.
6. Contract Notes.
7. SwissCompliance.
8. Method Notes.

### 7.1 Exemplos de conteúdo

```
SWISS DEFI OPTIMIZER
ERC-4626 VAULT STUDY

PREVIEW ONLY
NO DEPLOYMENT VERIFIED
NOT AUDITED
DO NOT USE WITH REAL FUNDS

VAULT STATE REGISTER

Environment       Preview
Network           Not verified
Deployment        No deployment verified
Asset model       USDC
Standard          ERC-4626
Total assets      —
Total shares      —
Price per share   —
Last update       —
```

Também devem aparecer, em notas e labels, elementos como:

- `SwissCompliance — mock standalone`;
- `Not enforced by Vault`;
- `Not KYC`;
- `Not regulatory approval`;
- `Tax output is not tax advice`;
- `Harvest is timestamp-only placeholder`;
- `Strategy balance is not reconciled`.

A tela deve ter leitura direta e sem qualquer incentivo à interpretação de operação real.

---

## 8. Claims permitidos e proibidos

| Claim | Permitido/Proibido | Fonte | Condição de uso |
| --- | --- | --- | --- |
| audited | Proibido | Nenhuma | Nunca declarar; o projeto não é auditado. |
| FINMA compliant | Proibido | Nenhuma | Não usar em copy, visual nem em metadados. |
| KYC verified | Proibido | Nenhuma | Não afirmar identidade ou aprovação real. |
| AML approved | Proibido | Nenhuma | Não usar em marketing ou labels. |
| regulatory approval | Proibido | Nenhuma | Não sugerir aprovação, autorização ou compliance regulatório. |
| best APY | Proibido | Nenhuma | Nunca comparar rendimento como melhor ou garantido. |
| guaranteed yield | Proibido | Nenhuma | Harvest não realiza rendimento; não prometer retorno. |
| live TVL | Proibido | Nenhuma | Não usar TVL sem endereço on-chain e dados verificáveis. |
| tax-ready | Proibido | Nenhuma | `SwissCompliance` é mock e não substitui assessoria fiscal. |
| tax advice | Proibido | Nenhuma | Não usar em output nem em texto de apoio. |
| real compliance | Proibido | Nenhuma | `SwissCompliance` é standalone e mock. |
| settlement available | Proibido | Nenhuma | Nenhuma operação real ou liquidação. |
| deployed | Proibido | Nenhuma | Somente com status verificado e explícito. |
| optimizer functional | Proibido | Nenhuma | O projeto não é um operador funcional. |
| secure with real funds | Proibido | Nenhuma | O projeto não é seguro para uso com fundos reais. |
| ERC-4626 vault study | Permitido, com qualificação | `README.md`, `Vault.sol`, `docs/ERC4626-CONFORMANCE.md` | Usar como descrição do estudo em curso. |
| USDC asset model | Permitido, com qualificação | `Vault.sol` e documentação | Declarar apenas como modelo de ativo atual. |
| preview only | Permitido, com qualificação | Decisão de produto | Deve constar em masthead e rodapé. |
| no deployment verified | Permitido, com qualificação | `scripts/deploy.ts`, `README.md` | A UI deve mostrar como estado de deployment. |
| not connected | Permitido, com qualificação | decisão da fase 0 | Mostrar em preview e em ausência de wallet. |
| not audited | Permitido, com qualificação | `README.md`, `Security` | Declarar de forma direta e sem marketing. |
| do not use with real funds | Permitido, com qualificação | `README.md`, `docs` | Obrigatório em masthead ou disclaimer. |
| SwissCompliance mock standalone | Permitido, com qualificação | `README.md`, `SwissCompliance.sol` | Explicar que não é integrado ao vault. |
| not enforced by Vault | Permitido, com qualificação | `README.md`, `Vault.sol` | Descreve separação do módulo. |
| harvest timestamp-only placeholder | Permitido, com qualificação | `Vault.sol` e `README.md` | Explicitar que não gera rendimento. |
| strategy balance not reconciled | Permitido, com qualificação | `README.md`, `Vault.sol` | Deixar explícito como limitação técnica. |

Regras operacionais:

- cada claim deve ter fonte documentada;
- toda UI deve carregar qualificação em contexto, não em lettering isolado;
- nenhuma frase nova pode inventar garantia, aprovação ou execução.

---

## 9. Arquitetura proposta

A futura aplicação deve ser isolada em:

- `web/`;
- Vite;
- React;
- TypeScript;
- CSS próprio ou CSS Modules.

A primeira fase não precisa de:

- Next.js;
- RSC;
- backend;
- wagmi;
- viem;
- TanStack Query;
- Zustand;
- API;
- banco de dados.

Isso porque a primeira fase é estática, sem wallet e sem leitura on-chain real. A arquitetura futura deve separar:

- componentes;
- tokens;
- tipos;
- fixture de preview;
- adaptadores de dados;
- integração on-chain futura.

A UI não deve acessar blockchain diretamente. No futuro, componentes devem receber dados tipados de adaptadores. A separação obriga a camada de apresentação a depender de dados estruturados, não de side effects de rede.

---

## 10. Modelo tipado futuro

A futura camada UI deve contar com tipos como os abaixo:

```ts
type DataSource = 'preview' | 'fixture' | 'rpc' | 'indexer';
type Availability = 'available' | 'not-available' | 'not-verified' | 'stale' | 'error';

type TokenAmount = {
  raw: string;
  decimals: number;
  symbol: string;
};

type Field<T> = {
  value: T | null;
  source: DataSource | null;
  availability: Availability;
  label: string;
  note?: string | null;
};

type VaultUiState = {
  environment: Field<'preview'>;
  network: Field<'not verified' | null>;
  deployment: Field<'no deployment verified' | null>;
  assetModel: Field<'USDC'>;
  standard: Field<'ERC-4626'>;
  totalAssets: Field<TokenAmount | null>;
  totalShares: Field<TokenAmount | null>;
  pricePerShare: Field<TokenAmount | null>;
  lastUpdate: Field<string | null>;
  harvest: Field<'timestamp-only placeholder' | null>;
  strategyBalanceReconciled: Field<boolean | null>;
  emergencyShutdown: Field<boolean | null>;
};
```

O valor bruto deve manter precisão, e a formatação para exibição deve acontecer na camada de apresentação.

O modelo deve permitir no futuro:

- preview;
- fixture;
- RPC;
- indexer;
- available;
- not-available;
- not-verified;
- stale;
- error.

Campos sem fonte devem aceitar `null`. Isso evita que a UI invente dados, e torna a ausência de origem tão explícita quanto a presença de valor.

---

## 11. Fases futuras

### Fase 0

Decisão de produto, autoria, claims e arquitetura.

### Fase 1

Shell visual estático em `web/`.

### Fase 2

Estados tipados e fixtures.

### Fase 3

Acessibilidade, responsividade, copy e screenshots.

### Fase 4

Deployment estático opcional, sempre marcado como preview.

### Fase 5

Leitura on-chain read-only, somente após deployment e endereço verificáveis.

### Fase 6

Simulação de operações, se aprovada.

### Fase 7

Wallet e operações reais, como tarefa independente, com revisão de segurança.

Nenhuma fase posterior deve ser presumida como parte da Fase 0. A decisão desta fase é de escopo e responsabilidade, não de roadmap implícito.

---

## 12. Arquivos permitidos e proibidos

### Permitidos nesta futura fundação

- `web/**`;
- `docs/ui/**`.

### Proibidos

- `contracts/**`;
- `test/**`;
- `scripts/**`;
- `.github/workflows/**`;
- `hardhat.config.ts`;
- `.env.example`;
- `package-lock.json`;
- metadata do GitHub;
- secrets;
- deployment de contratos.

A primeira fase de UI não deve mexer na infraestrutura contratual, de testes ou de implantação.

---

## 13. Gates de aceite

### 13.1 Comportamento

Nenhuma alteração em contratos, testes ou scripts.

### 13.2 Visual

A UI deve comunicar o estado do projeto em menos de dez segundos.

### 13.3 Responsividade

Validar 320px, 390px, 768px e 1440px.

### 13.4 Acessibilidade

Validar foco, teclado, contraste, headings, landmarks, reduced motion e informação não dependente apenas de cor.

### 13.5 Copy

Cada claim deve ter fonte e qualificação.

### 13.6 Propriedade

Não usar assets ou layouts copiados.

### 13.7 Reprodutibilidade

Screenshots devem ser reais, nomeadas por estado, viewport e SHA.

### 13.8 Deployment

Se houver preview futuro, ele deve ser descrito como deployment da UI, nunca como deployment do vault.

---

## 14. Critérios de parada

O trabalho deve parar se:

- houver necessidade de alterar `contracts/`;
- houver necessidade de alterar testes;
- houver necessidade de instalar dependências fora do escopo;
- houver pressão para adicionar wallet;
- houver necessidade de inventar dados;
- houver ambiguidade sobre framework;
- houver ambiguidade sobre deployment;
- houver claim sem fonte;
- houver tentativa de tratar `docs/proposals` como implementação;
- houver tentativa de misturar o PR #8 com a futura UI.

A Fase 0 é uma decisão de arquitetura e comunicação, e não deve se transformar em desenvolvimento funcional de produto ou em trabalho contratual.

---

## Validação final

Depois da criação deste documento, foram executados os comandos de validação solicitados sobre o estado do repositório, sem criar commit, sem fazer push e sem alterar artefatos de contratos ou aplicação.

Comandos executados:

```bash
git status --short --branch
git log -1 --oneline --decorate
git rev-parse HEAD
git branch --show-current
find . -maxdepth 3 -type f | sort
gh pr view 8 --json number,title,body,state,headRefName,baseRefName,author,files,url,mergeStateStatus,isDraft --repo orlandol23/swiss-defi-optimizer
git diff --check
git diff --name-only
git diff --stat
```

Resultado esperado e observado:

- branch atual: `ui/vault-state-register`;
- SHA inicial: `a2d4258e0eb74cf020b0d6cc90e98076213b2020`;
- SHA final: igual ao inicial, porque não houve commit;
- arquivo criado e não rastreado: `docs/ui/VAULT-STATE-REGISTER-DECISION.md`;
- `git diff --check` sem erros de whitespace;
- `git status --short --untracked-files=all` mostrando `?? docs/ui/VAULT-STATE-REGISTER-DECISION.md`;
- `git ls-files --others --exclude-standard` listando o arquivo;
- `test -s docs/ui/VAULT-STATE-REGISTER-DECISION.md` confirmando que o arquivo existe e não está vazio;
- `git diff --name-only` pode permanecer vazio para arquivos untracked;
- `git diff --stat` também pode permanecer vazio para arquivos untracked.

Confirmações obrigatórias:

- não houve commit;
- não houve push;
- não houve alteração em contratos, testes, scripts, workflows ou metadata;
- a operação foi restrita ao documento de decisão em `docs/ui/`.

---

## Resumo executivo

A primeira UI deve ser um registro do estado do projeto e não um dashboard de rendimento. A decisão de produto foi registrada com foco em honestidade, legibilidade e limitação de claims. A arquitetura futura fica separada em camada de apresentação e em dados tipados, sem assumir APIs, wallet, produção de yield ou deployments que não sejam declarados como preview e não verificados.
