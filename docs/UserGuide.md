# Swiss DeFi Optimizer - User Guide

> **⚠️ Scope note (2026-08):** this guide describes the **planned** product.
> Today the repository contains smart contracts and tests only — there is no
> web interface, no deployment, and no yield strategy integration, and the
> vault does not call SwissCompliance. Every "Via Web Interface" flow below
> is design intent; the only way to interact with the contracts today is
> directly (Hardhat console / Etherscan on a deployment you make yourself).
> See `README.md` for the honest current scope.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Depositing Funds](#depositing-funds)
4. [Withdrawing Funds](#withdrawing-funds)
5. [Viewing Your Position](#viewing-your-position)
6. [Tax Reporting](#tax-reporting)
7. [Understanding Risks](#understanding-risks)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

## Introduction

Welcome to the Swiss DeFi Yield Optimizer! This guide will help you understand how to use the platform safely and effectively.

### What is the Swiss DeFi Optimizer?

The Swiss DeFi Optimizer is an **ERC-4626 tokenized vault** that accepts USDC deposits and manages them to generate yield through various DeFi strategies, with built-in Swiss tax compliance features.

### Key Features

- ✅ **Secure Vault**: ERC-4626 standard with battle-tested security
- ✅ **Transparent**: All transactions on-chain and verifiable
- ✅ **Tax-Friendly**: Built-in Swiss tax reporting in CHF
- ✅ **Flexible**: Deposit and withdraw anytime
- ✅ **Non-Custodial**: You always control your funds

## Getting Started

### Prerequisites

Before you start, make sure you have:

1. **A Web3 Wallet**
   - MetaMask (recommended)
   - WalletConnect compatible wallet
   - Coinbase Wallet

2. **USDC on Sepolia Testnet**
   - For testing purposes
   - Get testnet ETH from a faucet
   - Swap for testnet USDC

3. **Testnet ETH for Gas**
   - Minimum: ~0.01 ETH
   - Get from Sepolia faucet

### Connecting Your Wallet

**Using the Web Interface (Future)**:

1. Visit the application URL
2. Click "Connect Wallet"
3. Select your wallet provider
4. Approve the connection
5. Ensure you're on Sepolia network

**Using Direct Contract Interaction**:

1. Add Vault contract to your wallet
2. Contract Address: [see deployments/sepolia.json]
3. Add USDC token: 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8

## Depositing Funds

### Step 1: Approve USDC

Before depositing, you must approve the vault to spend your USDC.

**Via Web Interface**:
```
1. Enter deposit amount
2. Click "Approve USDC"
3. Confirm transaction in wallet
4. Wait for confirmation
```

**Via Contract**:
```javascript
// Approve vault to spend USDC
const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, signer);
await usdcContract.approve(vaultAddress, amount);
```

### Step 2: Deposit

**Via Web Interface**:
```
1. Enter amount to deposit (in USDC)
2. Click "Deposit"
3. Review transaction details
4. Confirm in your wallet
5. Wait for confirmation
6. Receive vault shares (sdvUSDC)
```

**Via Contract**:
```javascript
// Deposit USDC, receive vault shares
const vaultContract = new ethers.Contract(vaultAddress, vaultAbi, signer);
const amount = ethers.parseUnits("1000", 6); // 1000 USDC
await vaultContract.deposit(amount, userAddress);
```

### Understanding Vault Shares

When you deposit, you receive **vault shares (sdvUSDC)**:

- **1:1 Ratio**: Initially, 1 sdvUSDC = 1 USDC
- **Value Grows**: As vault earns yield, share value increases
- **Redeemable**: Burn shares to withdraw USDC
- **Transferable**: Shares are ERC-20 tokens

**Example**:
```
Deposit:  1,000 USDC
Receive:  1,000 sdvUSDC (initial)

After yield accrual:
1,000 sdvUSDC = 1,050 USDC (5% gain)
```

## Withdrawing Funds

### Step 1: Choose Withdrawal Method

You have two options:

**Option A: Withdraw Specific USDC Amount**
- Specify exact USDC amount to withdraw
- Vault calculates shares to burn
- Useful when you need a specific amount

**Option B: Redeem All Shares**
- Burn all your vault shares
- Receive all underlying USDC
- Simplest option

### Step 2: Execute Withdrawal

**Via Web Interface**:
```
Option A (Withdraw):
1. Enter USDC amount to withdraw
2. Click "Withdraw"
3. Confirm transaction
4. Receive USDC

Option B (Redeem):
1. Click "Redeem All"
2. Confirm transaction
3. Receive all USDC
```

**Via Contract**:
```javascript
// Option A: Withdraw specific amount
const assets = ethers.parseUnits("500", 6); // 500 USDC
await vaultContract.withdraw(assets, userAddress, userAddress);

// Option B: Redeem all shares
const shares = await vaultContract.balanceOf(userAddress);
await vaultContract.redeem(shares, userAddress, userAddress);
```

### Withdrawal Timing

- **Instant**: No lock-up periods
- **Available**: 24/7/365
- **Emergency**: Works even during emergency shutdown

## Viewing Your Position

### Dashboard Metrics

**Total Balance**:
- Your vault shares (sdvUSDC)
- Current USDC value
- CHF equivalent

**Performance**:
- Total deposited (USD & CHF)
- Current value (USD & CHF)
- Profit/Loss
- APY/APR

**Transaction History**:
- Recent deposits
- Recent withdrawals
- Timestamps
- Transaction hashes

### Checking On-Chain

**Using Etherscan**:
```
1. Go to Etherscan Sepolia
2. Enter vault contract address
3. Click "Read Contract"
4. Use balanceOf(yourAddress) to see shares
5. Use totalAssets() to see total vault value
```

**Calculating Your Position**:
```javascript
// Your shares
const shares = await vaultContract.balanceOf(yourAddress);

// Convert to USDC value
const assets = await vaultContract.convertToAssets(shares);

// CHF-side figures come from the compliance contract's own reports —
// USD→CHF conversion happens internally (Chainlink CHF/USD feed); there is
// no public convertUsdToChf function:
const report = await complianceContract.getTaxReport(yourAddress);
```

## Tax Reporting

### Generating Tax Report

The Swiss DeFi Optimizer includes built-in tax reporting for Swiss residents.

**Via Web Interface**:
```
1. Navigate to "Tax Reports"
2. Select tax year
3. Click "Generate Report"
4. Review data:
   - Total deposits (USD & CHF)
   - Total withdrawals (USD & CHF)
   - Yield earned (taxable income)
   - Wealth tax calculation
5. Export as PDF or CSV
```

**Via Contract**:
```javascript
// Get tax data
const compliance = new ethers.Contract(
  complianceAddress,
  complianceAbi,
  provider
);

const [deposits, withdrawals, yield, depositsChf, withdrawalsChf, yieldChf] =
  await compliance.getUserTaxData(userAddress);
```

### Understanding Tax Obligations

**⚠️ IMPORTANT DISCLAIMER**: This is simplified information. Consult a Swiss tax professional for actual compliance.

#### 1. Income Tax (DeFi Yield)

**What's Taxed**:
- Yield/interest earned from vault
- Taxed as ordinary income
- Must be declared annually

**Tax Rate**:
- Federal: ~8.5%
- Cantonal/Municipal: Varies (total 0-40%)
- Progressive based on total income

**When to Declare**:
- Annual tax return
- Deadline: March 31 (following year)

#### 2. Wealth Tax

**What's Taxed**:
- Total crypto holdings on December 31
- Includes USDC value in vault
- Part of overall wealth calculation

**Tax Rate**:
- 0.1% - 1.0% (canton dependent)
- Calculated on net wealth
- Annual assessment

#### 3. Capital Gains

**Tax Treatment**:
- **Private Investors**: Tax-free
- **Professional Traders**: Taxable as business income

**Definition (Private Investor)**:
- Holding period > 6 months
- Not frequent trading
- No leverage used
- Not primary income source

### Sample Tax Report

```
═══════════════════════════════════════════════════════
SWISS DEFI TAX REPORT - 2024
═══════════════════════════════════════════════════════

User: 0x1234...5678
Generated: 2024-12-31

DEPOSITS
────────────────────────────────────────────────────────
Total Deposited:    5,000.00 USDC  (CHF 4,450.00)

WITHDRAWALS
────────────────────────────────────────────────────────
Total Withdrawn:    1,000.00 USDC  (CHF 890.00)

INCOME (TAXABLE)
────────────────────────────────────────────────────────
Yield Earned:         250.00 USDC  (CHF 222.50)

Tax Category:       Ordinary Income
Suggested Rate:     15-30% (depends on total income)
Estimated Tax:      CHF 33.38 - 66.75

WEALTH (DEC 31)
────────────────────────────────────────────────────────
Current Holdings:   4,250.00 USDC  (CHF 3,782.50)

Wealth Tax Rate:    0.5% (example)
Estimated Tax:      CHF 18.91

═══════════════════════════════════════════════════════

DISCLAIMER: This is an automated estimate. Actual tax
obligations depend on your total income, canton of
residence, and other factors. Consult a tax professional.

Declaration Deadline: March 31, 2025
═══════════════════════════════════════════════════════
```

## Understanding Risks

### Smart Contract Risks

**✅ Mitigated**:
- Audited OpenZeppelin contracts
- Reentrancy protection
- Access control
- Extensive testing

**⚠️ Remaining**:
- No professional audit (portfolio project)
- Potential undiscovered bugs
- Upgradeability risks (if implemented)

**User Actions**:
- Start with small amounts
- Understand contract functions
- Review transaction details before confirming

### Economic Risks

**Yield Volatility**:
- DeFi yields fluctuate
- Not guaranteed returns
- Strategies may underperform

**Impermanent Loss** (Future):
- If strategies use LP tokens
- Price divergence risk
- Managed by strategy allocation

**Market Risk**:
- USDC depeg risk
- Smart contract failures in DeFi protocols
- Oracle manipulation

### Operational Risks

**Emergency Shutdown**:
- Owner can halt new deposits
- Withdrawals always allowed
- **One-way**: `triggerEmergencyShutdown` has no resume function — once
  triggered, the vault stays in withdrawal-only mode permanently

**Strategy Changes**:
- Owner can change strategies
- Funds may be temporarily locked
- Transparent on-chain

**Oracle Failures**:
- Chainlink price feeds may fail
- Stale price detection implemented
- May affect tax reporting accuracy

## Troubleshooting

### Common Issues

#### "Transaction Failed: Insufficient Allowance"

**Problem**: Vault not approved to spend USDC

**Solution**:
```javascript
// Approve sufficient USDC
await usdcContract.approve(vaultAddress, ethers.MaxUint256);
```

#### "Emergency Shutdown Active"

**Problem**: Deposits halted due to emergency

**Solution**:
- Withdrawals still work
- Wait for owner to resolve issue
- Monitor official channels

#### "Exceeds Deposit Cap"

**Problem**: Deposit amount > the vault's current deposit limit

**Solution**:
```javascript
// Check current limit via the ERC-4626 entry point.
// Returns 0 while emergency shutdown is active.
const maxDep = await vaultContract.maxDeposit(userAddress);

// Deposit within limit
await vaultContract.deposit(maxDep, userAddress);
```

#### "Stale Price"

**Problem**: Chainlink oracle hasn't updated in 24h

**Solution**:
- Wait for oracle update
- Try again later
- Contact support if persistent

#### "Insufficient Balance"

**Problem**: Not enough USDC in wallet

**Solution**:
- Check USDC balance: `usdcContract.balanceOf(yourAddress)`
- Ensure sufficient balance
- Account for 6 decimals

### Gas Issues

#### Transaction Too Expensive

**Solutions**:
1. Wait for lower gas prices
2. Use gas price tracker
3. Set custom gas limit

#### Transaction Timeout

**Solutions**:
1. Increase gas price
2. Use "Fast" gas option
3. Retry transaction

### Getting Help

**Resources**:
- Documentation: [docs/](../docs/)
- GitHub Issues: [Create issue]
- Etherscan: Verify transactions
- Discord/Telegram: Community support

## FAQ

### General Questions

**Q: Is this audited?**
A: No, this is a portfolio/demonstration project. Do NOT use with significant funds.

**Q: What returns can I expect?**
A: Returns depend on active strategies. Currently in development phase with no guaranteed APY.

**Q: Can I lose money?**
A: Yes. Smart contract risks, strategy underperformance, and market risks exist.

**Q: Is my USDC insured?**
A: No. This is DeFi - funds are not FDIC insured or guaranteed.

### Technical Questions

**Q: What's the contract address?**
A: See `deployments/sepolia.json` after deployment.

**Q: Which network?**
A: Sepolia testnet for testing. Mainnet deployment requires audit.

**Q: Can I transfer my vault shares?**
A: Yes, sdvUSDC shares are ERC-20 tokens and transferable.

**Q: How is share price calculated?**
A: `sharePrice = totalAssets / totalSupply`

### Tax Questions

**Q: Do I need to pay Swiss taxes?**
A: If you're a Swiss resident, yes. Consult a tax professional.

**Q: When are taxes due?**
A: Annual declaration by March 31 of following year.

**Q: What if I'm not Swiss?**
A: Tax obligations depend on your jurisdiction. Consult local tax advisor.

**Q: Is the tax report official?**
A: No, it's an automated estimate. Professional review required.

### Strategy Questions

**Q: Which strategies are active?**
A: Currently none (development phase). Future: Aave, Compound, Curve.

**Q: Can I choose strategies?**
A: No, strategy allocation is managed by vault owner.

**Q: How often is yield harvested?**
A: Minimum 1 hour between harvests. Owner discretion.

**Q: Can I exit during strategy allocation?**
A: Yes, vault will withdraw from strategy if needed for your withdrawal.

## Best Practices

### Security

1. ✅ **Verify Contract Addresses**
   - Always check Etherscan
   - Use official documentation
   - Beware of phishing

2. ✅ **Use Hardware Wallets**
   - For significant amounts
   - Ledger or Trezor recommended
   - Secure your seed phrase

3. ✅ **Start Small**
   - Test with small amounts first
   - Understand all functions
   - Gradually increase exposure

4. ✅ **Monitor Regularly**
   - Check positions weekly
   - Review transaction history
   - Stay informed on updates

### Financial

1. ✅ **Diversify**
   - Don't put all funds in one vault
   - Use multiple protocols
   - Balance risk/reward

2. ✅ **Understand Fees**
   - Gas costs for transactions
   - Potential performance fees (future)
   - Tax implications

3. ✅ **Keep Records**
   - Save transaction hashes
   - Export tax reports annually
   - Document all activity

4. ✅ **Plan for Taxes**
   - Set aside funds for tax payments
   - Generate reports regularly
   - Consult professionals

### Tax Compliance

1. ✅ **Annual Reports**
   - Generate before year-end
   - Review for accuracy
   - Save multiple copies

2. ✅ **Professional Consultation**
   - Hire Swiss tax advisor
   - Provide generated reports
   - Follow professional advice

3. ✅ **Documentation**
   - Keep all transaction records
   - Save Etherscan links
   - Maintain CHF conversion records

## Conclusion

The Swiss DeFi Optimizer provides a secure, transparent way to earn yield on USDC with built-in Swiss tax compliance. By following this guide and best practices, you can use the platform safely and effectively.

### Remember

- ⚠️ This is a demonstration/portfolio project
- ⚠️ Not audited - use with caution
- ⚠️ Consult professionals for tax/legal advice
- ⚠️ Start small and understand all risks

### Support

For questions, issues, or feedback:
- GitHub: [Create issue]
- Documentation: [docs/](../docs/)
- Email: [Contact]

---

**Disclaimer**: This guide is for educational purposes only and does not constitute financial, legal, or tax advice.
