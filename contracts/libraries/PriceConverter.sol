// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/AggregatorV3Interface.sol";

/**
 * @title PriceConverter
 * @notice Library for price conversions using Chainlink Price Feeds
 * @dev Integrates with Chainlink oracles for USD/CHF and other conversions
 *
 * Chainlink Price Feeds (Sepolia):
 * - CHF/USD: 0xed0616BeF04D374969f302a34AE4A63882490A8C
 * - EUR/USD: 0x1a81afB8146aeFfCFc5E50e8479e826E7D55b910
 *
 * Security Notes:
 * - Always check for stale prices (heartbeat threshold)
 * - Handle different oracle decimals (typically 8)
 * - Implement circuit breaker for oracle failures
 */
library PriceConverter {
    /*//////////////////////////////////////////////////////////////
                            CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Maximum acceptable staleness (24 hours)
    uint256 public constant MAX_STALENESS = 24 hours;

    /// @notice Standard Chainlink decimals
    uint256 public constant CHAINLINK_DECIMALS = 8;

    /// @notice Standard token decimals
    uint256 public constant TOKEN_DECIMALS = 18;

    /*//////////////////////////////////////////////////////////////
                            ERRORS
    //////////////////////////////////////////////////////////////*/

    error StalePrice();
    error InvalidPrice();
    error InvalidFeedAddress();

    /*//////////////////////////////////////////////////////////////
                        PRICE FEED FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Get latest price from Chainlink feed
     * @param priceFeed Address of the Chainlink price feed
     * @return price Latest price with 8 decimals
     * @return decimals Number of decimals in the price
     */
    function getLatestPrice(address priceFeed)
        internal
        view
        returns (uint256 price, uint8 decimals)
    {
        if (priceFeed == address(0)) revert InvalidFeedAddress();

        AggregatorV3Interface feed = AggregatorV3Interface(priceFeed);

        // The unnamed round fields are deliberately unused; every field this
        // library relies on is bound and validated below.
        // slither-disable-next-line unused-return
        try feed.latestRoundData() returns (
            uint80 roundId,
            int256 answer,
            uint256 /* startedAt */,
            uint256 updatedAt,
            uint80 /* answeredInRound */
        ) {
            // Validate price data
            if (roundId == 0) revert InvalidPrice();
            if (answer <= 0) revert InvalidPrice();
            if (updatedAt == 0) revert StalePrice();

            // Check staleness
            if (block.timestamp - updatedAt > MAX_STALENESS) {
                revert StalePrice();
            }

            decimals = feed.decimals();
            price = uint256(answer);
        } catch {
            revert InvalidPrice();
        }
    }

    /**
     * @notice Convert USD amount to CHF
     * @param amountUsd Amount in USD (with 18 decimals)
     * @param chfUsdFeed Address of CHF/USD Chainlink feed
     * @return amountChf Amount in CHF (with 18 decimals)
     */
    function convertUsdToChf(uint256 amountUsd, address chfUsdFeed)
        internal
        view
        returns (uint256 amountChf)
    {
        (uint256 chfUsdPrice, uint8 decimals) = getLatestPrice(chfUsdFeed);

        // CHF/USD price is how many USD per CHF
        // To convert USD to CHF: USD / (CHF/USD)
        // Adjust for decimals: amountUsd * 10^decimals / chfUsdPrice
        amountChf = (amountUsd * (10 ** decimals)) / chfUsdPrice;
    }

    /**
     * @notice Convert CHF amount to USD
     * @param amountChf Amount in CHF (with 18 decimals)
     * @param chfUsdFeed Address of CHF/USD Chainlink feed
     * @return amountUsd Amount in USD (with 18 decimals)
     */
    function convertChfToUsd(uint256 amountChf, address chfUsdFeed)
        internal
        view
        returns (uint256 amountUsd)
    {
        (uint256 chfUsdPrice, uint8 decimals) = getLatestPrice(chfUsdFeed);

        // CHF/USD price is how many USD per CHF
        // To convert CHF to USD: CHF * (CHF/USD)
        // Adjust for decimals: amountChf * chfUsdPrice / 10^decimals
        amountUsd = (amountChf * chfUsdPrice) / (10 ** decimals);
    }

    /**
     * @notice Check if price feed is stale
     * @param priceFeed Address of the Chainlink price feed
     * @return isStale True if price is stale
     */
    function isPriceStale(address priceFeed) internal view returns (bool isStale) {
        if (priceFeed == address(0)) return true;

        AggregatorV3Interface feed = AggregatorV3Interface(priceFeed);

        // Only `updatedAt` matters for staleness; the other fields are ignored
        // on purpose.
        // slither-disable-next-line unused-return
        try feed.latestRoundData() returns (
            uint80, /* roundId */
            int256, /* answer */
            uint256, /* startedAt */
            uint256 updatedAt,
            uint80 /* answeredInRound */
        ) {
            return block.timestamp - updatedAt > MAX_STALENESS;
        } catch {
            return true;
        }
    }

    /**
     * @notice Get price feed description
     * @param priceFeed Address of the Chainlink price feed
     * @return description Feed description (e.g., "CHF / USD")
     */
    function getDescription(address priceFeed)
        internal
        view
        returns (string memory description)
    {
        if (priceFeed == address(0)) revert InvalidFeedAddress();

        AggregatorV3Interface feed = AggregatorV3Interface(priceFeed);

        try feed.description() returns (string memory desc) {
            description = desc;
        } catch {
            description = "Unknown Feed";
        }
    }

    /**
     * @notice Get complete price feed info
     * @param priceFeed Address of the Chainlink price feed
     * @return price Latest price
     * @return decimals Price decimals
     * @return updatedAt Last update timestamp
     * @return description Feed description
     */
    function getPriceFeedInfo(address priceFeed)
        internal
        view
        returns (
            uint256 price,
            uint8 decimals,
            uint256 updatedAt,
            string memory description
        )
    {
        if (priceFeed == address(0)) revert InvalidFeedAddress();

        AggregatorV3Interface feed = AggregatorV3Interface(priceFeed);

        // `startedAt` and `answeredInRound` are intentionally skipped; the three
        // fields this view reports are all bound and validated.
        // slither-disable-next-line unused-return
        (uint80 roundId, int256 answer, , uint256 timestamp, ) = feed
            .latestRoundData();

        if (roundId == 0) revert InvalidPrice();
        if (answer <= 0) revert InvalidPrice();
        if (timestamp == 0) revert StalePrice();

        price = uint256(answer);
        decimals = feed.decimals();
        updatedAt = timestamp;
        description = feed.description();
    }
}
