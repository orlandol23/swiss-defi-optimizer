// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/PriceConverter.sol";

/**
 * @title PriceConverterHarness
 * @notice Test-only wrapper that makes PriceConverter callable
 * @dev Every function in PriceConverter is `internal`, and SwissCompliance
 *      only ever reaches {PriceConverter-convertUsdToChf}. Without this
 *      wrapper the other read paths — the ones whose validation this repo
 *      cares about — have no caller and therefore no test. Each function here
 *      forwards, and does nothing else, so a test failure is the library's.
 *
 *      Deployed in tests only; it is not part of the vault or the compliance
 *      module.
 */
contract PriceConverterHarness {
    function getLatestPrice(
        address priceFeed
    ) external view returns (uint256 price, uint8 decimals) {
        return PriceConverter.getLatestPrice(priceFeed);
    }

    function getPriceFeedInfo(
        address priceFeed
    )
        external
        view
        returns (
            uint256 price,
            uint8 decimals,
            uint256 updatedAt,
            string memory description
        )
    {
        return PriceConverter.getPriceFeedInfo(priceFeed);
    }

    function isPriceStale(address priceFeed) external view returns (bool) {
        return PriceConverter.isPriceStale(priceFeed);
    }

    function getDescription(
        address priceFeed
    ) external view returns (string memory) {
        return PriceConverter.getDescription(priceFeed);
    }

    function convertUsdToChf(
        uint256 amountUsd,
        address chfUsdFeed
    ) external view returns (uint256) {
        return PriceConverter.convertUsdToChf(amountUsd, chfUsdFeed);
    }

    function convertChfToUsd(
        uint256 amountChf,
        address chfUsdFeed
    ) external view returns (uint256) {
        return PriceConverter.convertChfToUsd(amountChf, chfUsdFeed);
    }
}
