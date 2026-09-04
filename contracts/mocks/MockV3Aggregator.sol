// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/AggregatorV3Interface.sol";

/**
 * @title MockV3Aggregator
 * @notice Mock Chainlink price feed for testing
 * @dev Every field of the round is settable, so tests can reproduce the
 *      failure modes PriceConverter guards against: a zero round id, a
 *      non-positive answer, an unset `updatedAt`, and a timestamp old enough
 *      to be stale.
 */
contract MockV3Aggregator is AggregatorV3Interface {
    uint8 private immutable FEED_DECIMALS;

    string private feedDescription;
    uint80 private roundId;
    int256 private answer;
    uint256 private startedAt;
    uint256 private updatedAt;

    constructor(uint8 decimals_, int256 answer_) {
        FEED_DECIMALS = decimals_;
        feedDescription = "CHF / USD";
        roundId = 1;
        answer = answer_;
        startedAt = block.timestamp;
        updatedAt = block.timestamp;
    }

    /**
     * @notice Overwrite the round the feed reports
     * @param roundId_ Round id (0 is rejected by PriceConverter)
     * @param answer_ Price answer (<= 0 is rejected by PriceConverter)
     * @param updatedAt_ Round timestamp (0, or older than MAX_STALENESS, is stale)
     */
    function setRound(uint80 roundId_, int256 answer_, uint256 updatedAt_) external {
        roundId = roundId_;
        answer = answer_;
        startedAt = updatedAt_;
        updatedAt = updatedAt_;
    }

    /// @notice Overwrite the feed description
    function setDescription(string calldata description_) external {
        feedDescription = description_;
    }

    function decimals() external view override returns (uint8) {
        return FEED_DECIMALS;
    }

    function description() external view override returns (string memory) {
        return feedDescription;
    }

    function version() external pure override returns (uint256) {
        return 3;
    }

    function getRoundData(
        uint80
    ) external view override returns (uint80, int256, uint256, uint256, uint80) {
        return (roundId, answer, startedAt, updatedAt, roundId);
    }

    function latestRoundData()
        external
        view
        override
        returns (uint80, int256, uint256, uint256, uint80)
    {
        return (roundId, answer, startedAt, updatedAt, roundId);
    }
}
