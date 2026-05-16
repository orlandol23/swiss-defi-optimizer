# Testing Guide - Swiss DeFi Optimizer

## 🧪 Guia Completo de Testes

Este guia mostra como validar que tudo está funcionando corretamente no projeto.

---

## 📋 Checklist Rápido

```bash
# 1. Verificar instalação de dependências
npm install

# 2. Compilar contratos
npm run compile

# 3. Rodar testes
npm test

# 4. Verificar cobertura
npm run coverage

# 5. Analisar gas
npm run gas-report

# 6. Verificar tamanho dos contratos
npm run size
```

---

## 🚀 Testes Passo a Passo

### 1. Verificar Ambiente

**Pré-requisitos:**
```bash
# Verificar versão do Node.js (precisa >= 18)
node --version

# Verificar npm
npm --version

# Verificar Git
git --version
```

**Saída esperada:**
```
v18.x.x ou v20.x.x
9.x.x ou superior
git version 2.x.x
```

---

### 2. Instalar Dependências

```bash
# Limpar cache (se necessário)
rm -rf node_modules package-lock.json

# Instalar dependências
npm install
```

**Verificar instalação:**
```bash
# Verificar se hardhat foi instalado
npx hardhat --version

# Verificar OpenZeppelin
npm list @openzeppelin/contracts

# Verificar Chainlink
npm list @chainlink/contracts
```

**Saída esperada:**
```
Hardhat version 2.27.0 (ou similar)
@openzeppelin/contracts@4.9.6
@chainlink/contracts@1.5.0
```

---

### 3. Compilar Contratos

```bash
# Compilar todos os contratos
npm run compile
```

**O que acontece:**
- Hardhat baixa o compilador Solidity 0.8.20 (primeira vez)
- Compila todos os contratos em `contracts/`
- Gera artefatos em `artifacts/`
- Gera tipos TypeScript em `typechain-types/`

**Saída esperada:**
```
Compiled 10 Solidity files successfully
```

**Verificar compilação:**
```bash
# Verificar se artefatos foram gerados
ls artifacts/contracts/core/Vault.sol/

# Verificar tipos TypeScript
ls typechain-types/
```

**Possíveis erros:**

❌ **Erro: "Cannot download compiler"**
```
Solução: Ambiente pode estar bloqueando download
- Tente usar VPN ou rede diferente
- Ou instale solc manualmente: npm install -g solc@0.8.20
```

❌ **Erro: "File not found @openzeppelin"**
```
Solução: Reinstalar dependências
- rm -rf node_modules
- npm install
```

---

### 4. Rodar Testes Unitários

```bash
# Rodar todos os testes
npm test

# Rodar com detalhes verbose
npm test -- --verbose

# Rodar testes específicos
npx hardhat test test/unit/Vault.test.ts

# Rodar apenas testes de depósito
npx hardhat test test/unit/Vault.test.ts --grep "Deposits"
```

**Saída esperada:**
```
  Vault
    Deployment
      ✓ Should set the correct name and symbol (XXms)
      ✓ Should set the correct owner (XXms)
      ✓ Should set the correct asset (XXms)
      ... (mais testes)
    Deposits
      ✓ Should allow users to deposit USDC (XXms)
      ... (mais testes)

  30 passing (XXs)
```

**Análise de resultados:**

✅ **Todos os testes passaram**
- Contratos funcionando corretamente
- Segurança validada
- Pode prosseguir para próximos passos

⚠️ **Alguns testes falharam**
- Verificar mensagem de erro
- Revisar código do contrato
- Verificar se mudanças recentes quebraram algo

❌ **Muitos testes falharam**
- Verificar se contratos compilaram corretamente
- Verificar se dependências estão corretas
- Limpar cache: `npm run clean` e recompilar

---

### 5. Verificar Cobertura de Código

```bash
# Gerar relatório de cobertura
npm run coverage
```

**O que acontece:**
- Hardhat roda todos os testes com instrumentação
- Gera relatório de cobertura em `coverage/`
- Exibe resumo no terminal

**Saída esperada:**
```
-----------------------|----------|----------|----------|----------|
File                   |  % Stmts | % Branch |  % Funcs |  % Lines |
-----------------------|----------|----------|----------|----------|
 contracts/            |      100 |      100 |      100 |      100 |
  Vault.sol            |      100 |      100 |      100 |      100 |
  SwissCompliance.sol  |    95.50 |    90.00 |      100 |    95.00 |
-----------------------|----------|----------|----------|----------|
All files              |    97.75 |    95.00 |      100 |    97.50 |
-----------------------|----------|----------|----------|----------|
```

**Interpretar resultados:**

✅ **Cobertura > 90%**: Excelente! Código bem testado
⚠️ **Cobertura 70-90%**: Bom, mas pode melhorar
❌ **Cobertura < 70%**: Adicionar mais testes

**Visualizar relatório HTML:**
```bash
# Abrir relatório no navegador
open coverage/index.html

# Ou visualizar arquivo específico
cat coverage/lcov.info
```

---

### 6. Análise de Gas

```bash
# Gerar relatório de gas
npm run gas-report

# Com valores em CHF (se API key configurada)
COINMARKETCAP_API_KEY=your_key npm run gas-report
```

**Saída esperada:**
```
·-----------------------------------------|---------------------------|
|  Solc version: 0.8.20                   ·  Optimizer enabled: true  |
·-----------------------------------------|---------------------------|
|  Methods                                                            |
··················|·······················|·········|·········|········|
|  Contract       ·  Method               ·  Min    ·  Max    ·  Avg  |
··················|·······················|·········|·········|········|
|  Vault          ·  deposit              ·  85000  ·  102000 · 93500 |
|  Vault          ·  withdraw             ·  45000  ·   58000 · 51500 |
|  Vault          ·  setStrategy          ·  28000  ·   45000 · 36500 |
··················|·······················|·········|·········|········|
```

**Análise de gas:**

✅ **Target atingido**: < 300k gas por transação
- Deposit: ~93k ✅
- Withdraw: ~51k ✅
- Admin functions: ~36k ✅

⚠️ **Acima do target**: Considerar otimizações
- Revisar loops
- Usar `unchecked` onde seguro
- Otimizar storage packing

---

### 7. Verificar Tamanho dos Contratos

```bash
# Verificar tamanho dos contratos compilados
npm run size
```

**Saída esperada:**
```
·-----------------------------------------|-------------|
|  Contract Name                          ·  Size (KB)  |
·-----------------------------------------|-------------|
|  Vault                                  ·    18.45    |
|  SwissCompliance                        ·    12.30    |
|  PriceConverter                         ·     3.20    |
|  MockUSDC                               ·     6.15    |
·-----------------------------------------|-------------|
```

**Limite do Ethereum:**
- **Máximo**: 24KB (24,576 bytes)
- **Todos os contratos**: ✅ Dentro do limite

❌ **Se exceder 24KB:**
- Dividir contrato em múltiplos contratos
- Usar libraries para código compartilhado
- Remover funções não essenciais

---

### 8. Testes de Segurança

```bash
# Análise estática com Slither (se instalado)
slither .

# Verificar vulnerabilidades conhecidas
npm audit

# Análise de dependências
npm audit --audit-level=moderate
```

**Instalar Slither (opcional):**
```bash
# MacOS
brew install slither-analyzer

# Linux/Ubuntu
pip3 install slither-analyzer
solc-select install 0.8.20
solc-select use 0.8.20

# Rodar análise
slither . --filter-paths "node_modules|test"
```

**Saída esperada (Slither):**
```
Compilation warnings/errors on contracts/core/Vault.sol:
... (avisos podem ser ignorados)

INFO:Detectors:
No issues found.
```

---

### 9. Testes em Localhost

```bash
# Terminal 1: Iniciar node local
npm run node

# Terminal 2: Deploy local
npm run deploy:localhost

# Terminal 3: Interagir via console
npx hardhat console --network localhost
```

**No console Hardhat:**
```javascript
// Conectar aos contratos
const Vault = await ethers.getContractFactory("Vault");
const [deployer] = await ethers.getSigners();

// Carregar deployment addresses
const addresses = require('./deployments/localhost.json');
const vault = await Vault.attach(addresses.vault);

// Testar depósito (exemplo)
const usdc = await ethers.getContractAt("MockUSDC", addresses.usdc);
await usdc.approve(vault.address, ethers.parseUnits("1000", 6));
await vault.deposit(ethers.parseUnits("1000", 6), deployer.address);

// Verificar shares
const shares = await vault.balanceOf(deployer.address);
console.log("Shares:", ethers.formatUnits(shares, 6));
```

---

### 10. Validação Final (Checklist)

Antes de fazer deploy ou criar PR, verificar:

```bash
# ✅ Compilação
npm run compile
# Deve completar sem erros

# ✅ Testes
npm test
# Todos devem passar (30/30)

# ✅ Cobertura
npm run coverage
# Deve ser > 90%

# ✅ Gas
npm run gas-report
# Funções principais < 300k

# ✅ Tamanho
npm run size
# Todos os contratos < 24KB

# ✅ Linting TypeScript
npx tsc --noEmit
# Sem erros de tipo

# ✅ Audit
npm audit --audit-level=moderate
# Sem vulnerabilidades críticas
```

---

## 🐛 Troubleshooting

### Problema: "Cannot find module"

**Erro:**
```
Error: Cannot find module '@openzeppelin/contracts'
```

**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### Problema: "Compilation failed"

**Erro:**
```
Error HH600: Compilation failed
```

**Solução 1 - Limpar cache:**
```bash
npm run clean
npm run compile
```

**Solução 2 - Reinstalar solc:**
```bash
rm -rf ~/.cache/hardhat-nodejs
npm run compile
```

---

### Problema: "Test failed: insufficient funds"

**Erro:**
```
Error: sender doesn't have enough funds
```

**Solução:**
```javascript
// No teste, garantir que usuário tem USDC
await usdc.mint(user1.address, ethers.parseUnits("1000000", 6));

// E aprovar antes de depositar
await usdc.connect(user1).approve(vaultAddress, amount);
```

---

### Problema: "Gas estimation failed"

**Erro:**
```
Error: cannot estimate gas
```

**Solução:**
```javascript
// Fornecer gas explicitamente
await vault.deposit(amount, user, { gasLimit: 200000 });

// Ou verificar se função está revertendo
await vault.deposit(amount, user).catch(console.log);
```

---

### Problema: "Nonce too high"

**Erro:**
```
Error: nonce has already been used
```

**Solução:**
```bash
# Resetar node local
# Parar node (Ctrl+C) e reiniciar
npm run node
```

---

## 📊 CI/CD Pipeline

Os workflows do GitHub Actions rodam automaticamente:

### Em cada push:
- ✅ Compilação
- ✅ Testes unitários
- ✅ Análise de TypeScript
- ✅ Segurança básica

### Em Pull Requests:
- ✅ Cobertura de código
- ✅ Relatório de gas (comentário no PR)
- ✅ Análise de arquivos alterados
- ✅ Tamanho dos contratos

### Scheduled (diário):
- ✅ Análise de segurança completa
- ✅ Slither analysis
- ✅ Audit de dependências

### Manual (workflow_dispatch):
- ✅ Deploy para testnet
- ✅ Verificação no Etherscan

---

## 🎯 Próximos Passos

Após validar tudo localmente:

1. **Criar Pull Request**
   - Workflows automáticos rodarão
   - Revisar comentários de gas
   - Verificar cobertura

2. **Deploy Sepolia** (quando aprovado)
   ```bash
   npm run deploy:sepolia
   npm run verify:sepolia
   ```

3. **Monitorar Contratos**
   - Etherscan para transações
   - Events para auditoria
   - Gas usage em produção

4. **Frontend Integration**
   - Usar addresses de `deployments/`
   - Testar com MetaMask
   - Validar fluxos completos

---

## 📞 Suporte

**Se tudo falhar:**

1. Verificar versões:
   ```bash
   node --version  # >= 18
   npm --version   # >= 9
   ```

2. Ambiente limpo:
   ```bash
   rm -rf node_modules package-lock.json cache artifacts
   npm install
   npm run compile
   npm test
   ```

3. Verificar logs:
   ```bash
   # Testes com stack trace completo
   npm test -- --verbose --bail

   # Compilação com debug
   npx hardhat compile --verbose
   ```

4. Abrir issue no GitHub com:
   - Comando executado
   - Erro completo
   - Versões (node, npm, hardhat)
   - Sistema operacional

---

**Boa sorte com os testes! 🚀**
