// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../libraries/PriceConverter.sol";

/**
 * @title SwissCompliance
 * @notice Simulated compliance module for Swiss FINMA regulations
 * @dev This is a MOCK implementation for demonstration purposes
 *
 * Swiss DeFi Taxation Framework (Simplified):
 * ============================================
 *
 * 1. INCOME TAX on DeFi Yield:
 *    - DeFi yield/rewards are taxable as ordinary income
 *    - Federal tax: ~8.5% + Cantonal/Municipal: varies (total 0-40%)
 *    - Declaration required by March 31st of following year
 *
 * 2. WEALTH TAX on Holdings:
 *    - Crypto assets included in wealth calculation
 *    - Rate: 0.1% - 1.0% depending on canton
 *    - Calculated on December 31st value each year
 *
 * 3. CAPITAL GAINS (Private Investors):
 *    - Generally TAX-FREE for private investors
 *    - Professional trading = taxable business income
 *
 * 4. KYC/AML Requirements:
 *    - FINMA requires KYC for custodial services
 *    - Non-custodial (our vault) = lower requirements
 *    - Still recommended for compliance
 *
 * DISCLAIMER: This is a simplified mock. Consult a Swiss tax professional
 * for actual compliance. Regulations vary by canton.
 */
contract SwissCompliance is Ownable {
    using PriceConverter for address;

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice Chainlink CHF/USD price feed address
    address public chfUsdFeed;

    /// @notice Allowlisted addresses (simulated KYC)
    mapping(address => bool) public isAllowlisted;

    /// @notice User tax data
    mapping(address => TaxData) public userTaxData;

    /// @notice Default wealth tax rate (0.5% = 50 basis points)
    uint256 public constant DEFAULT_WEALTH_TAX_RATE = 50; // 0.5%

    /// @notice Basis points denominator
    uint256 public constant BASIS_POINTS = 10000;

    /*//////////////////////////////////////////////////////////////
                            STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct TaxData {
        uint256 totalDeposits;      // Total USDC deposited (6 decimals)
        uint256 totalWithdrawals;   // Total USDC withdrawn (6 decimals)
        uint256 yieldEarned;        // Total yield earned (6 decimals)
        uint256 lastUpdated;        // Last update timestamp
        bool exists;                // Flag to check if user has data
    }

    /*//////////////////////////////////////////////////////////////
                            EVENTS
    //////////////////////////////////////////////////////////////*/

    event UserAllowlisted(address indexed user, bool status);
    event TaxDataUpdated(address indexed user, uint256 deposits, uint256 withdrawals, uint256 yield);
    event PriceFeedUpdated(address indexed oldFeed, address indexed newFeed);

    /*//////////////////////////////////////////////////////////////
                            ERRORS
    //////////////////////////////////////////////////////////////*/

    error NotAllowlisted();
    error ZeroAddress();

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address chfUsdFeed_) Ownable(msg.sender) {
        if (chfUsdFeed_ == address(0)) revert ZeroAddress();
        chfUsdFeed = chfUsdFeed_;
    }

    /*//////////////////////////////////////////////////////////////
                        COMPLIANCE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Check if user is compliant (mock implementation)
     * @param user Address to check
     * @return compliant True if user is compliant
     * @dev In production, this would check:
     *      - KYC/AML verification
     *      - Sanctions lists
     *      - Jurisdiction restrictions
     *      - Transaction limits
     */
    function isCompliant(address user) external view returns (bool compliant) {
        // Mock: For demo, we accept all addresses
        // In production, would check KYC status, sanctions lists, etc.
        return user != address(0);
    }

    /**
     * @notice Add user to allowlist (simulated KYC approval)
     * @param user Address to allowlist
     * @param status True to allow, false to remove
     */
    function setAllowlist(address user, bool status) external onlyOwner {
        if (user == address(0)) revert ZeroAddress();

        isAllowlisted[user] = status;
        emit UserAllowlisted(user, status);
    }

    /**
     * @notice Update user tax data
     * @param user Address of user
     * @param deposits Total deposits
     * @param withdrawals Total withdrawals
     * @param yield Total yield earned
     */
    function updateTaxData(
        address user,
        uint256 deposits,
        uint256 withdrawals,
        uint256 yield
    ) external onlyOwner {
        if (user == address(0)) revert ZeroAddress();

        userTaxData[user] = TaxData({
            totalDeposits: deposits,
            totalWithdrawals: withdrawals,
            yieldEarned: yield,
            lastUpdated: block.timestamp,
            exists: true
        });

        emit TaxDataUpdated(user, deposits, withdrawals, yield);
    }

    /*//////////////////////////////////////////////////////////////
                        TAX CALCULATION FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Calculate wealth tax on current holdings
     * @param holdings Current USDC holdings (6 decimals)
     * @return taxAmount Wealth tax amount in USDC (6 decimals)
     * @dev Default rate: 0.5% (50 basis points)
     *      Actual rate varies by canton (0.1% - 1.0%)
     */
    function calculateWealthTax(uint256 holdings)
        external
        pure
        returns (uint256 taxAmount)
    {
        // Wealth tax = holdings * rate / BASIS_POINTS
        taxAmount = (holdings * DEFAULT_WEALTH_TAX_RATE) / BASIS_POINTS;
    }

    /**
     * @notice Get tax report for user
     * @param user Address of user
     * @return report JSON-formatted tax report string
     */
    function getTaxReport(address user)
        external
        view
        returns (string memory report)
    {
        TaxData memory data = userTaxData[user];

        if (!data.exists) {
            return "No tax data available for this address";
        }

        // Convert to CHF for Swiss tax reporting
        uint256 depositsChf = _convertUsdToChf(data.totalDeposits);
        uint256 withdrawalsChf = _convertUsdToChf(data.totalWithdrawals);
        uint256 yieldChf = _convertUsdToChf(data.yieldEarned);

        // Current holdings
        uint256 holdings = data.totalDeposits > data.totalWithdrawals
            ? data.totalDeposits - data.totalWithdrawals
            : 0;
        uint256 holdingsChf = _convertUsdToChf(holdings);

        // Calculate taxes
        uint256 wealthTax = (holdings * DEFAULT_WEALTH_TAX_RATE) / BASIS_POINTS;
        uint256 wealthTaxChf = _convertUsdToChf(wealthTax);

        // Format report (simplified - in production would use proper JSON library)
        report = string(
            abi.encodePacked(
                "Swiss DeFi Tax Report\n",
                "=====================\n",
                "Total Deposits: ",
                _formatAmount(data.totalDeposits),
                " USDC (CHF ",
                _formatAmount(depositsChf),
                ")\n",
                "Total Withdrawals: ",
                _formatAmount(data.totalWithdrawals),
                " USDC (CHF ",
                _formatAmount(withdrawalsChf),
                ")\n",
                "Yield Earned (Taxable Income): ",
                _formatAmount(data.yieldEarned),
                " USDC (CHF ",
                _formatAmount(yieldChf),
                ")\n",
                "Current Holdings: ",
                _formatAmount(holdings),
                " USDC (CHF ",
                _formatAmount(holdingsChf),
                ")\n",
                "Wealth Tax (0.5%): CHF ",
                _formatAmount(wealthTaxChf),
                "\n\n",
                "DISCLAIMER: Consult a tax professional for exact values.\n",
                "Tax rates vary by canton. Declaration deadline: March 31."
            )
        );
    }

    /**
     * @notice Get user tax data in structured format
     * @param user Address of user
     * @return deposits Total deposits in USDC (6 decimals)
     * @return withdrawals Total withdrawals in USDC (6 decimals)
     * @return yieldEarned Total yield in USDC (6 decimals)
     * @return depositsChf Total deposits in CHF (18 decimals)
     * @return withdrawalsChf Total withdrawals in CHF (18 decimals)
     * @return yieldChf Total yield in CHF (18 decimals)
     */
    function getUserTaxData(address user)
        external
        view
        returns (
            uint256 deposits,
            uint256 withdrawals,
            uint256 yieldEarned,
            uint256 depositsChf,
            uint256 withdrawalsChf,
            uint256 yieldChf
        )
    {
        TaxData memory data = userTaxData[user];

        deposits = data.totalDeposits;
        withdrawals = data.totalWithdrawals;
        yieldEarned = data.yieldEarned;

        depositsChf = _convertUsdToChf(deposits);
        withdrawalsChf = _convertUsdToChf(withdrawals);
        yieldChf = _convertUsdToChf(yieldEarned);
    }

    /*//////////////////////////////////////////////////////////////
                        ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Update CHF/USD price feed address
     * @param newFeed New Chainlink price feed address
     */
    function updatePriceFeed(address newFeed) external onlyOwner {
        if (newFeed == address(0)) revert ZeroAddress();

        address oldFeed = chfUsdFeed;
        chfUsdFeed = newFeed;

        emit PriceFeedUpdated(oldFeed, newFeed);
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Convert USD to CHF using Chainlink
     * @param amountUsd Amount in USDC (6 decimals)
     * @return amountChf Amount in CHF (18 decimals)
     */
    function _convertUsdToChf(uint256 amountUsd)
        internal
        view
        returns (uint256 amountChf)
    {
        // Convert USDC (6 decimals) to 18 decimals first
        uint256 amountUsd18 = amountUsd * 1e12;

        // Convert using Chainlink
        amountChf = chfUsdFeed.convertUsdToChf(amountUsd18);
    }

    /**
     * @notice Format amount to string (helper for report)
     * @param amount Amount to format
     * @return Formatted string
     */
    function _formatAmount(uint256 amount)
        internal
        pure
        returns (string memory)
    {
        // Simple conversion to string
        // In production, would use proper number formatting
        if (amount == 0) return "0";

        bytes memory buffer = new bytes(78);
        uint256 i = 77;

        while (amount != 0) {
            buffer[i--] = bytes1(uint8(48 + (amount % 10)));
            amount /= 10;
        }

        bytes memory result = new bytes(77 - i);
        for (uint256 j = 0; j < result.length; j++) {
            result[j] = buffer[i + 1 + j];
        }

        return string(result);
    }
}
