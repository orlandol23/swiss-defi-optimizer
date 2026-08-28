# Testing Guide - Swiss DeFi Optimizer

## 🧪 Complete Testing Guide

This guide shows how to verify that everything in the project is working correctly.

---

## 📋 Quick Checklist

```bash
# 1. Check dependency installation
npm install

# 2. Compile contracts
npm run compile

# 3. Run tests
npm test

# 4. Check coverage
npm run coverage

# 5. Analyze gas
npm run gas-report

# 6. Check contract sizes
npm run size
```

---

## 🚀 Step-by-Step Testing

### 1. Check the Environment

**Prerequisites:**
```bash
# Check the Node.js version (needs >= 18)
node --version

# Check npm
npm --version

# Check Git
git --version
```

**Expected output:**
```
v18.x.x or v20.x.x
9.x.x or higher
git version 2.x.x
```

---

### 2. Install Dependencies

```bash
# Clear the cache (if needed)
rm -rf node_modules package-lock.json

# Install dependencies
npm install
```

**Verify the installation:**
```bash
# Check that hardhat was installed
npx hardhat --version

# Check OpenZeppelin
npm list @openzeppelin/contracts

# Check Chainlink
npm list @chainlink/contracts
```

**Expected output:**
```
Hardhat version 2.29.0 (or similar)
@openzeppelin/contracts@5.0.2
@chainlink/contracts@1.5.0
```

---

### 3. Compile the Contracts

```bash
# Compile all contracts
npm run compile
```

**What happens:**
- Hardhat downloads the Solidity 0.8.20 compiler (first run)
- Compiles every contract under `contracts/`
- Generates artifacts in `artifacts/`
- Generates TypeScript types in `typechain-types/`

**Expected output:**
```
Compiled 19 Solidity files successfully (evm target: paris).
```

**Verify the compilation:**
```bash
# Check that artifacts were generated
ls artifacts/contracts/core/Vault.sol/

# Check the TypeScript types
ls typechain-types/
```

**Possible errors:**

❌ **Error: "Cannot download compiler"**
```
Fix: the environment may be blocking the download
- Try a VPN or a different network
- Or install solc manually: npm install -g solc@0.8.20
```

❌ **Error: "File not found @openzeppelin"**
```
Fix: reinstall the dependencies
- rm -rf node_modules
- npm install
```

---

### 4. Run the Unit Tests

```bash
# Run every test
npm test

# Run with verbose detail
npm test -- --verbose

# Run a specific test file
npx hardhat test test/unit/Vault.test.ts

# Run only the deposit tests
npx hardhat test test/unit/Vault.test.ts --grep "Deposits"
```

**Expected output:**
```
  Vault
    Deployment
      ✓ Should set the correct name and symbol (XXms)
      ✓ Should set the correct owner (XXms)
      ✓ Should set the correct asset (XXms)
      ... (more tests)
    Deposits
      ✓ Should allow users to deposit USDC (XXms)
      ... (more tests)

  73 passing (XXs)
```

**Reading the results:**

✅ **All tests passed**
- The contracts behave correctly
- Security checks validated
- Safe to move on to the next steps

⚠️ **Some tests failed**
- Read the error message
- Review the contract code
- Check whether a recent change broke something

❌ **Many tests failed**
- Check that the contracts compiled correctly
- Check that the dependencies are correct
- Clear the cache: `npm run clean`, then recompile

---

### 5. Check Code Coverage

```bash
# Generate the coverage report
npm run coverage
```

**What happens:**
- Hardhat runs every test with instrumentation
- Generates a coverage report in `coverage/`
- Prints a summary in the terminal

**Expected output:**
```
----------------------------|----------|----------|----------|----------|----------------|
File                        |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
----------------------------|----------|----------|----------|----------|----------------|
 compliance/                |        0 |        0 |        0 |        0 |                |
  SwissCompliance.sol       |        0 |        0 |        0 |        0 |... 331,332,335 |
 core/                      |    78.95 |    71.25 |    93.33 |    82.86 |                |
  Vault.sol                 |    78.95 |    71.25 |    93.33 |    82.86 |... 317,319,321 |
 interfaces/                |      100 |      100 |      100 |      100 |                |
  AggregatorV3Interface.sol |      100 |      100 |      100 |      100 |                |
  IStrategy.sol             |      100 |      100 |      100 |      100 |                |
 libraries/                 |        0 |        0 |        0 |        0 |                |
  PriceConverter.sol        |        0 |        0 |        0 |        0 |... 197,198,199 |
 mocks/                     |       75 |      100 |       75 |       75 |                |
  MockUSDC.sol              |       75 |      100 |       75 |       75 |             40 |
----------------------------|----------|----------|----------|----------|----------------|
All files                   |    42.11 |    46.72 |    48.57 |    39.87 |                |
----------------------------|----------|----------|----------|----------|----------------|
```

**Interpreting the results:**

✅ **Coverage > 90%**: excellent, the code is well tested
⚠️ **Coverage 70-90%**: good, but there is room to improve
❌ **Coverage < 70%**: add more tests

**View the HTML report:**
```bash
# Open the report in a browser
open coverage/index.html

# Or inspect a specific file
cat coverage/lcov.info
```

---

### 6. Gas Analysis

```bash
# Generate the gas report
npm run gas-report

# With values in CHF (if an API key is configured)
COINMARKETCAP_API_KEY=your_key npm run gas-report
```

**Expected output:**
```
·································|·················|···············|·················|················|···············
|  Contracts / Methods           ·  Min            ·  Max          ·  Avg            ·  # calls       ·  chf (avg)   │
·································|·················|···············|·················|················|···············
|  Vault                         ·                                                                                   │
·································|·················|···············|·················|················|···············
|      deposit                   ·         80,497  ·      114,721  ·        113,000  ·            20  ·           -  │
|      withdraw                  ·              -  ·            -  ·         52,024  ·             3  ·           -  │
|      setStrategy               ·              -  ·            -  ·         47,841  ·             6  ·           -  │
|      setDepositCap             ·         25,504  ·       30,352  ·         29,903  ·            22  ·           -  │
·································|·················|···············|·················|················|···············
```

**Gas analysis:**

✅ **Target met**: < 300k gas per transaction
- Deposit: ~113k ✅
- Withdraw: ~52k ✅
- Admin functions: ~30–48k ✅

⚠️ **Above target**: consider optimizing
- Review loops
- Use `unchecked` where it is safe
- Optimize storage packing

---

### 7. Check Contract Sizes

```bash
# Check the size of the compiled contracts
npm run size
```

**Expected output:**
```
 ·------------------------|--------------------------------|--------------------------------·
 |  Solc version: 0.8.20  ·  Optimizer enabled: true       ·  Runs: 200                     │
 ·························|································|·································
 |  Contract Name         ·  Deployed size (KiB) (change)  ·  Initcode size (KiB) (change)  │
 ·························|································|·································
 |  MockUSDC              ·                 2.018 (0.000)  ·                 2.956 (0.000)  │
 ·························|································|·································
 |  PriceConverter        ·                 0.185 (0.000)  ·                 0.215 (0.000)  │
 ·························|································|·································
 |  SwissCompliance       ·                 3.910 (0.000)  ·                 4.155 (0.000)  │
 ·························|································|·································
 |  Vault                 ·                 7.228 (0.000)  ·                 8.645 (0.000)  │
 ·------------------------|--------------------------------|--------------------------------·
```

**Ethereum limit:**
- **Maximum**: 24KB (24,576 bytes)
- **All contracts**: ✅ within the limit

❌ **If a contract exceeds 24KB:**
- Split it into multiple contracts
- Move shared code into libraries
- Remove non-essential functions

---

### 8. Security Testing

```bash
# Static analysis with Slither (if installed)
slither .

# Check for known vulnerabilities
npm audit

# Dependency analysis
npm audit --audit-level=moderate
```

**Install Slither (optional):**
```bash
# macOS
brew install slither-analyzer

# Linux/Ubuntu
pip3 install slither-analyzer
solc-select install 0.8.20
solc-select use 0.8.20

# Run the analysis
slither . --filter-paths "node_modules|test"
```

**Expected output (Slither):**
```
Compilation warnings/errors on contracts/core/Vault.sol:
... (warnings can be ignored)

INFO:Detectors:
No issues found.
```

---

### 9. Testing on Localhost

```bash
# Terminal 1: start a local node
npm run node

# Terminal 2: deploy locally
npm run deploy:localhost

# Terminal 3: interact through the console
npx hardhat console --network localhost
```

**In the Hardhat console:**
```javascript
// Connect to the contracts
const Vault = await ethers.getContractFactory("Vault");
const [deployer] = await ethers.getSigners();

// Load the deployment addresses
const addresses = require('./deployments/localhost.json');
const vault = await Vault.attach(addresses.vault);

// Test a deposit (example)
const usdc = await ethers.getContractAt("MockUSDC", addresses.usdc);
await usdc.approve(vault.address, ethers.parseUnits("1000", 6));
await vault.deposit(ethers.parseUnits("1000", 6), deployer.address);

// Check the shares
const shares = await vault.balanceOf(deployer.address);
console.log("Shares:", ethers.formatUnits(shares, 6));
```

---

### 10. Final Validation (Checklist)

Before deploying or opening a PR, check:

```bash
# ✅ Compilation
npm run compile
# Must complete without errors

# ✅ Tests
npm test
# All must pass (73/73)

# ✅ Coverage
npm run coverage
# Should be > 90%

# ✅ Gas
npm run gas-report
# Main functions < 300k

# ✅ Size
npm run size
# Every contract < 24KB

# ✅ TypeScript linting
npx tsc --noEmit
# No type errors

# ✅ Audit
npm audit --audit-level=moderate
# No critical vulnerabilities
```

---

## 🐛 Troubleshooting

### Problem: "Cannot find module"

**Error:**
```
Error: Cannot find module '@openzeppelin/contracts'
```

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### Problem: "Compilation failed"

**Error:**
```
Error HH600: Compilation failed
```

**Fix 1 - clear the cache:**
```bash
npm run clean
npm run compile
```

**Fix 2 - reinstall solc:**
```bash
rm -rf ~/.cache/hardhat-nodejs
npm run compile
```

---

### Problem: "Test failed: insufficient funds"

**Error:**
```
Error: sender doesn't have enough funds
```

**Fix:**
```javascript
// In the test, make sure the user holds USDC
await usdc.mint(user1.address, ethers.parseUnits("1000000", 6));

// And approve before depositing
await usdc.connect(user1).approve(vaultAddress, amount);
```

---

### Problem: "Gas estimation failed"

**Error:**
```
Error: cannot estimate gas
```

**Fix:**
```javascript
// Provide gas explicitly
await vault.deposit(amount, user, { gasLimit: 200000 });

// Or check whether the function is reverting
await vault.deposit(amount, user).catch(console.log);
```

---

### Problem: "Nonce too high"

**Error:**
```
Error: nonce has already been used
```

**Fix:**
```bash
# Reset the local node
# Stop the node (Ctrl+C) and restart it
npm run node
```

---

## 📊 CI/CD Pipeline

The GitHub Actions workflows run automatically:

### On every push:
- ✅ Compilation
- ✅ Unit tests
- ✅ TypeScript analysis
- ✅ Basic security checks

### On pull requests:
- ✅ Code coverage
- ✅ Gas report (commented on the PR)
- ✅ Analysis of the changed files
- ✅ Contract sizes

### Scheduled (daily):
- ✅ Full security analysis
- ✅ Slither analysis
- ✅ Dependency audit

### Manual (workflow_dispatch):
- ✅ Deploy to testnet
- ✅ Etherscan verification

---

## 🎯 Next Steps

Once everything checks out locally:

1. **Open a Pull Request**
   - The automated workflows will run
   - Review the gas comments
   - Check coverage

2. **Deploy to Sepolia** (once approved)
   ```bash
   npm run deploy:sepolia
   npm run verify:sepolia
   ```

3. **Monitor the Contracts**
   - Etherscan for transactions
   - Events for auditing
   - Gas usage in production

4. **Frontend Integration**
   - Use the addresses from `deployments/`
   - Test with MetaMask
   - Validate the full flows

---

## 📞 Support

**If everything fails:**

1. Check the versions:
   ```bash
   node --version  # >= 18
   npm --version   # >= 9
   ```

2. Clean environment:
   ```bash
   rm -rf node_modules package-lock.json cache artifacts
   npm install
   npm run compile
   npm test
   ```

3. Check the logs:
   ```bash
   # Tests with a full stack trace
   npm test -- --verbose --bail

   # Compilation with debug output
   npx hardhat compile --verbose
   ```

4. Open a GitHub issue with:
   - The command you ran
   - The full error
   - Versions (node, npm, hardhat)
   - Operating system

---

**Good luck with the tests! 🚀**
