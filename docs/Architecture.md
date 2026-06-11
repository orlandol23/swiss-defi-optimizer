# Swiss DeFi Optimizer - Architecture Documentation

## System Overview

The Swiss DeFi Yield Optimizer is a modular DeFi vault system built on Ethereum, implementing the ERC-4626 tokenized vault standard with Swiss regulatory compliance features.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          User Layer                                  │
│                                                                       │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐           │
│  │   MetaMask   │   │ WalletConnect│   │  Coinbase    │           │
│  │   Wallet     │   │              │   │  Wallet      │           │
│  └──────────────┘   └──────────────┘   └──────────────┘           │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Frontend Layer (Next.js 13+)                   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Components                                                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │   │
│  │  │ WalletConnect│  │ VaultDashboard│  │  TaxReport   │     │   │
│  │  │   Component  │  │   Component   │  │  Component   │     │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Custom Hooks (Web3)                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │   │
│  │  │ useWallet    │  │useYieldOptimizer│ │usePriceFeeds │     │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Web3 Libraries                                               │   │
│  │  ethers.js v6  │  wagmi  │  viem                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ JSON-RPC / WebSocket
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Blockchain Layer (Ethereum)                     │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Core Contracts                                               │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │ Vault.sol (ERC-4626)                                  │  │   │
│  │  │ ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │   │
│  │  │ │ deposit()    │  │ withdraw()   │  │ totalAssets│  │  │   │
│  │  │ │ mint()       │  │ redeem()     │  │ ()         │  │  │   │
│  │  │ └──────────────┘  └──────────────┘  └────────────┘  │  │   │
│  │  │                                                       │  │   │
│  │  │ Extends: ERC4626, Ownable, ReentrancyGuard          │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Compliance Module                                            │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │ SwissCompliance.sol                                   │  │   │
│  │  │ ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │   │
│  │  │ │ isCompliant()│  │getTaxReport()│  │calculateWe-│  │  │   │
│  │  │ │              │  │              │  │althTax()   │  │  │   │
│  │  │ └──────────────┘  └──────────────┘  └────────────┘  │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Libraries                                                    │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │ PriceConverter.sol                                    │  │   │
│  │  │ ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │   │
│  │  │ │getLatestPrice│  │convertUsdToC-│  │isPriceStale│  │  │   │
│  │  │ │()            │  │hf()          │  │()          │  │  │   │
│  │  │ └──────────────┘  └──────────────┘  └────────────┘  │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Strategy Layer (Future)                                      │   │
│  │                                                               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │   │
│  │  │ AaveStrategy │  │CompoundStrat-│  │ CurveStrategy│     │   │
│  │  │              │  │egy           │  │              │     │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       External Services                              │
│                                                                       │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐           │
│  │  Chainlink   │   │    Aave      │   │   Compound   │           │
│  │  Oracles     │   │   Protocol   │   │   Protocol   │           │
│  │  (CHF/USD)   │   │              │   │              │           │
│  └──────────────┘   └──────────────┘   └──────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

## Contract Architecture

### 1. Vault.sol (Core Contract)

**Purpose**: Main ERC-4626 compliant vault for accepting deposits and managing assets.

**Key Features**:
- ERC-4626 standard implementation
- Reentrancy protection
- Owner-controlled strategy management
- Emergency shutdown capability
- Gas-optimized storage

**State Variables**:
```solidity
address public strategy;           // Active yield strategy
uint256 public maxDeposit;        // Maximum deposit limit
uint256 public totalAllocated;    // Assets in strategy
uint256 public lastHarvest;       // Last harvest timestamp
bool public emergencyShutdown;    // Emergency flag
```

**Main Functions**:
- `deposit(assets, receiver)`: Deposit USDC, receive vault shares
- `withdraw(assets, receiver, owner)`: Burn shares, receive USDC
- `mint(shares, receiver)`: Mint specific amount of shares
- `redeem(shares, receiver, owner)`: Redeem shares for assets
- `setStrategy(address)`: Set active strategy (owner only)
- `allocateToStrategy(amount)`: Allocate funds to strategy
- `triggerEmergencyShutdown()`: Halt deposits in emergency

**Security Features**:
- `nonReentrant` modifier on all state-changing functions
- `onlyOwner` for admin functions
- Input validation on all public functions
- SafeERC20 for token transfers

### 2. SwissCompliance.sol

**Purpose**: Simulated compliance module for Swiss FINMA regulations.

**Key Features**:
- Tax data tracking per user
- CHF/USD conversion via Chainlink
- Wealth tax calculation (0.5% default)
- Tax report generation
- KYC/AML allowlist (simulated)

**State Variables**:
```solidity
address public chfUsdFeed;                    // Chainlink price feed
mapping(address => bool) public isAllowlisted; // KYC allowlist
mapping(address => TaxData) public userTaxData; // Tax records
uint256 public constant DEFAULT_WEALTH_TAX_RATE = 50; // 0.5%
```

**Tax Data Structure**:
```solidity
struct TaxData {
    uint256 totalDeposits;      // Total USDC deposited
    uint256 totalWithdrawals;   // Total USDC withdrawn
    uint256 yieldEarned;        // Total yield earned
    uint256 lastUpdated;        // Last update timestamp
    bool exists;                // Data exists flag
}
```

**Main Functions**:
- `isCompliant(user)`: Check user compliance (mock)
- `updateTaxData(user, deposits, withdrawals, yield)`: Update tax records
- `calculateWealthTax(holdings)`: Calculate wealth tax
- `getTaxReport(user)`: Generate formatted tax report
- `getUserTaxData(user)`: Get structured tax data

### 3. PriceConverter.sol (Library)

**Purpose**: Chainlink price feed integration for multi-currency support.

**Key Features**:
- Chainlink oracle integration
- Stale price detection
- USD ↔ CHF conversion
- Error handling for oracle failures

**Main Functions**:
```solidity
getLatestPrice(priceFeed) returns (price, decimals)
convertUsdToChf(amountUsd, chfUsdFeed) returns (amountChf)
convertChfToUsd(amountChf, chfUsdFeed) returns (amountUsd)
isPriceStale(priceFeed) returns (bool)
getPriceFeedInfo(priceFeed) returns (price, decimals, updatedAt, description)
```

**Safety Mechanisms**:
- MAX_STALENESS = 24 hours
- Validates oracle responses
- Handles decimal conversions (8 → 18)
- Reverts on invalid/stale prices

## Data Flow

### Deposit Flow

```
1. User approves USDC to Vault
   └─> user.approve(vaultAddress, amount)

2. User calls deposit
   └─> vault.deposit(1000 USDC, userAddress)

3. Vault validates
   ├─> Check: not emergency shutdown
   ├─> Check: amount > 0
   ├─> Check: amount <= maxDeposit
   └─> Check: receiver != zero address

4. Vault calculates shares
   └─> shares = convertToShares(assets)

5. Vault transfers USDC from user
   └─> USDC.transferFrom(user, vault, amount)

6. Vault mints shares to user
   └─> _mint(receiver, shares)

7. Event emitted
   └─> emit Deposit(caller, receiver, assets, shares)
```

### Withdrawal Flow

```
1. User calls withdraw
   └─> vault.withdraw(500 USDC, userAddress, userAddress)

2. Vault validates
   ├─> Check: amount > 0
   └─> Check: receiver != zero address

3. Vault calculates shares to burn
   └─> shares = previewWithdraw(assets)

4. Check allowance (if caller != owner)
   └─> spendAllowance(owner, caller, shares)

5. Check available assets
   ├─> availableAssets = USDC.balanceOf(vault)
   └─> If insufficient, withdraw from strategy

6. Vault burns shares
   └─> _burn(owner, shares)

7. Vault transfers USDC to receiver
   └─> USDC.transfer(receiver, assets)

8. Event emitted
   └─> emit Withdraw(caller, receiver, owner, assets, shares)
```

### Tax Report Generation Flow

```
1. Frontend calls getUserTaxData
   └─> compliance.getUserTaxData(userAddress)

2. SwissCompliance retrieves stored data
   └─> data = userTaxData[user]

3. Convert amounts to CHF
   ├─> depositsChf = PriceConverter.convertUsdToChf(deposits)
   ├─> withdrawalsChf = PriceConverter.convertUsdToChf(withdrawals)
   └─> yieldChf = PriceConverter.convertUsdToChf(yield)

4. Chainlink provides exchange rate
   └─> chfUsdPrice = AggregatorV3Interface.latestRoundData()

5. Calculate taxes
   ├─> holdings = deposits - withdrawals
   ├─> wealthTax = holdings * 0.5% / 100
   └─> incomeTax = yield * userRate (variable)

6. Return structured data to frontend
   └─> {deposits, withdrawals, yield, CHF equivalents}

7. Frontend formats and displays report
```

## Security Architecture

### Defense in Depth

**Layer 1: Smart Contract Security**
- ReentrancyGuard on all state-changing functions
- AccessControl (Ownable) for admin functions
- SafeERC20 for token transfers
- Input validation on all public functions
- Custom errors for gas efficiency

**Layer 2: Economic Security**
- maxDeposit limits
- Emergency shutdown capability
- Strategy allocation controls
- Time-locked harvests (MIN_HARVEST_DELAY)

**Layer 3: Oracle Security**
- Stale price detection (24h threshold)
- Multiple validation checks
- Graceful error handling
- Fallback mechanisms

**Layer 4: Frontend Security**
- Input sanitization
- Transaction simulation before sending
- Clear user confirmations
- Loading states and error handling

### Attack Surface Analysis

**Reentrancy**: ✅ Mitigated
- `nonReentrant` modifier on all vulnerable functions
- Checks-Effects-Interactions pattern

**Access Control**: ✅ Mitigated
- `onlyOwner` on admin functions
- No proxy upgrade patterns (immutable)

**Oracle Manipulation**: ✅ Mitigated
- Stale price detection
- Validation of oracle responses
- Multiple data points checked

**Flash Loan Attacks**: ⚠️ Partially Mitigated
- Share price manipulation limited by max deposit
- Future: Time-weighted average pricing

**Front-Running**: ⚠️ Limited Mitigation
- Public mempool visibility
- Future: Flashbots integration

## Gas Optimization Strategies

### Storage Optimization

**1. Variable Packing**
```solidity
// ❌ Bad (3 storage slots)
uint256 public lastHarvest;
bool public emergencyShutdown;
address public strategy;

// ✅ Good (2 storage slots)
address public strategy;          // 20 bytes
bool public emergencyShutdown;    // 1 byte
                                  // 11 bytes unused
uint256 public lastHarvest;      // 32 bytes
```

**2. Immutable/Constant**
```solidity
// Constants don't use storage
uint256 public constant MIN_HARVEST_DELAY = 1 hours;
uint256 public constant BASIS_POINTS = 10000;

// Immutable set once in constructor
IERC20 public immutable asset; // Future optimization
```

### Function Optimization

**1. External vs Public**
```solidity
// External saves gas (calldata vs memory)
function allocateToStrategy(uint256 amount) external onlyOwner
```

**2. Short-Circuit Evaluation**
```solidity
// Check cheapest conditions first
if (amount == 0) revert InvalidAmount();
if (emergencyShutdown) revert EmergencyShutdownActive();
```

**3. Unchecked Arithmetic**
```solidity
// When overflow impossible
unchecked {
    totalAllocated -= amount;
}
```

### Event Optimization

```solidity
// Indexed parameters for filtering (max 3)
event Deposit(
    address indexed caller,
    address indexed receiver,
    uint256 assets,
    uint256 shares
);
```

## Scalability Considerations

### Current Limitations

1. **Single Strategy**: Only one active strategy at a time
2. **Manual Rebalancing**: Owner must manually allocate/withdraw
3. **No Auto-Compounding**: Harvests require manual trigger
4. **Limited Price Feeds**: CHF/USD only

### Future Enhancements

1. **Multi-Strategy Support**
   - Weighted allocation across strategies
   - Automatic rebalancing based on APY
   - Risk-adjusted capital allocation

2. **Automated Keeper System**
   - Chainlink Keepers for auto-harvesting
   - Automatic rebalancing triggers
   - Gas-optimized batch operations

3. **Advanced Oracle Integration**
   - Multiple price feed sources
   - TWAP (Time-Weighted Average Price)
   - Circuit breakers for extreme volatility

4. **Layer 2 Deployment**
   - Arbitrum/Optimism for lower gas
   - Polygon for accessibility
   - Cross-chain vault aggregation

## Testing Strategy

### Test Coverage Targets

- **Unit Tests**: 100% function coverage
- **Integration Tests**: All user flows
- **Security Tests**: Known attack vectors
- **Gas Tests**: Benchmark against targets

### Test Pyramid

```
           ┌─────────┐
          ╱  E2E     ╲
         ╱  Tests     ╲
        └─────────────┘  5%
       ┌───────────────┐
      ╱  Integration   ╲
     ╱     Tests        ╲
    └───────────────────┘  20%
   ┌─────────────────────┐
  ╱     Unit Tests       ╲
 ╱                        ╲
└─────────────────────────┘  75%
```

## Deployment Strategy

### Deployment Checklist

1. ✅ **Pre-Deployment**
   - [ ] All tests passing
   - [ ] Gas optimization complete
   - [ ] Security audit (if production)
   - [ ] Documentation complete

2. ✅ **Deployment**
   - [ ] Deploy to testnet (Sepolia)
   - [ ] Verify contracts on Etherscan
   - [ ] Test all functions manually
   - [ ] Deploy to mainnet (if approved)

3. ✅ **Post-Deployment**
   - [ ] Monitor transactions
   - [ ] Set up alerts
   - [ ] Update frontend with addresses
   - [ ] Announce to users

### Upgrade Strategy

**Current**: Immutable contracts (no proxy)

**Future**:
- Transparent Proxy pattern
- Timelock on upgrades (48-72 hours)
- Multisig for upgrade authority

## Monitoring & Maintenance

### Key Metrics to Monitor

1. **Vault Metrics**
   - Total Value Locked (TVL)
   - Number of depositors
   - Share price stability
   - Utilization rate (assets in strategies)

2. **Performance Metrics**
   - APY/APR
   - Gas costs per transaction
   - Strategy performance
   - Harvest profitability

3. **Security Metrics**
   - Failed transactions
   - Emergency shutdown triggers
   - Oracle price deviations
   - Unusual deposit/withdrawal patterns

4. **Compliance Metrics**
   - Users with tax data
   - Tax reports generated
   - KYC/AML status

### Maintenance Tasks

**Daily**:
- Monitor oracle prices
- Check for failed transactions
- Review gas prices

**Weekly**:
- Harvest yields (if profitable)
- Rebalance strategies
- Review security logs

**Monthly**:
- Update documentation
- Review and update gas optimizations
- Security review

## Conclusion

The Swiss DeFi Optimizer architecture prioritizes:

1. **Security**: Multiple layers of protection
2. **Compliance**: Swiss regulatory awareness
3. **Efficiency**: Gas-optimized operations
4. **Modularity**: Easy to extend and maintain
5. **Transparency**: Clear data flows and operations

This architecture provides a solid foundation for a production-ready DeFi vault while maintaining flexibility for future enhancements.
