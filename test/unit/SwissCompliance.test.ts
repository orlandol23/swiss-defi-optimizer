import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("SwissCompliance", function () {
  // A Chainlink feed address is required by the constructor. The allowlist and
  // access-control tests never read it, so a non-zero placeholder is enough for
  // them; the price-feed tests further down deploy a real mock instead.
  const FEED = "0xed0616BeF04D374969f302a34AE4A63882490A8C";

  async function deployComplianceFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("SwissCompliance");
    const compliance = await Factory.deploy(FEED);
    await compliance.waitForDeployment();

    return { compliance, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set the owner and the price feed", async function () {
      const { compliance, owner } = await loadFixture(deployComplianceFixture);

      expect(await compliance.owner()).to.equal(owner.address);
      expect(await compliance.chfUsdFeed()).to.equal(FEED);
    });

    it("Should revert if the price feed address is zero", async function () {
      const Factory = await ethers.getContractFactory("SwissCompliance");

      await expect(
        Factory.deploy(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(Factory, "ZeroAddress");
    });
  });

  // isCompliant used to be `pure` and returned `user != address(0)` — it said
  // yes to every address that was not the zero address and never consulted the
  // allowlist the contract maintains right next to it. These tests pin the
  // allowlist as the actual source of truth.
  describe("isCompliant reads the allowlist", function () {
    it("Should reject an address that was never allowlisted", async function () {
      const { compliance, user1 } = await loadFixture(deployComplianceFixture);

      expect(await compliance.isCompliant(user1.address)).to.equal(false);
    });

    it("Should accept an address after it is allowlisted", async function () {
      const { compliance, owner, user1 } = await loadFixture(
        deployComplianceFixture
      );

      await compliance.connect(owner).setAllowlist(user1.address, true);

      expect(await compliance.isCompliant(user1.address)).to.equal(true);
    });

    it("Should reject again once the address is removed", async function () {
      const { compliance, owner, user1 } = await loadFixture(
        deployComplianceFixture
      );

      await compliance.connect(owner).setAllowlist(user1.address, true);
      expect(await compliance.isCompliant(user1.address)).to.equal(true);

      await compliance.connect(owner).setAllowlist(user1.address, false);
      expect(await compliance.isCompliant(user1.address)).to.equal(false);
    });

    it("Should never treat the zero address as compliant", async function () {
      const { compliance } = await loadFixture(deployComplianceFixture);

      // setAllowlist refuses the zero address, so it cannot be flipped true —
      // but isCompliant guards it independently rather than relying on that.
      expect(await compliance.isCompliant(ethers.ZeroAddress)).to.equal(false);
    });

    it("Should keep allowlist entries independent per address", async function () {
      const { compliance, owner, user1, user2 } = await loadFixture(
        deployComplianceFixture
      );

      await compliance.connect(owner).setAllowlist(user1.address, true);

      expect(await compliance.isCompliant(user1.address)).to.equal(true);
      expect(await compliance.isCompliant(user2.address)).to.equal(false);
    });

    it("Should agree with the public isAllowlisted mapping", async function () {
      const { compliance, owner, user1 } = await loadFixture(
        deployComplianceFixture
      );

      await compliance.connect(owner).setAllowlist(user1.address, true);

      expect(await compliance.isCompliant(user1.address)).to.equal(
        await compliance.isAllowlisted(user1.address)
      );
    });
  });

  describe("setAllowlist access control", function () {
    it("Should emit UserAllowlisted with the new status", async function () {
      const { compliance, owner, user1 } = await loadFixture(
        deployComplianceFixture
      );

      await expect(compliance.connect(owner).setAllowlist(user1.address, true))
        .to.emit(compliance, "UserAllowlisted")
        .withArgs(user1.address, true);

      await expect(compliance.connect(owner).setAllowlist(user1.address, false))
        .to.emit(compliance, "UserAllowlisted")
        .withArgs(user1.address, false);
    });

    it("Should revert when a non-owner tries to allowlist", async function () {
      const { compliance, user1, user2 } = await loadFixture(
        deployComplianceFixture
      );

      await expect(
        compliance.connect(user1).setAllowlist(user2.address, true)
      ).to.be.revertedWithCustomError(compliance, "OwnableUnauthorizedAccount");
    });

    it("Should revert when allowlisting the zero address", async function () {
      const { compliance, owner } = await loadFixture(deployComplianceFixture);

      await expect(
        compliance.connect(owner).setAllowlist(ethers.ZeroAddress, true)
      ).to.be.revertedWithCustomError(compliance, "ZeroAddress");
    });

    it("Should be idempotent when setting the same status twice", async function () {
      const { compliance, owner, user1 } = await loadFixture(
        deployComplianceFixture
      );

      await compliance.connect(owner).setAllowlist(user1.address, true);
      await compliance.connect(owner).setAllowlist(user1.address, true);

      expect(await compliance.isCompliant(user1.address)).to.equal(true);
    });
  });

  describe("isCompliant is a view, not a state change", function () {
    it("Should be callable statically without a transaction", async function () {
      const { compliance, owner, user1 } = await loadFixture(
        deployComplianceFixture
      );

      await compliance.connect(owner).setAllowlist(user1.address, true);

      // staticCall would revert if the function were non-view; it also proves
      // the ABI still exposes it as a read, which integrators depend on.
      expect(await compliance.isCompliant.staticCall(user1.address)).to.equal(
        true
      );
    });
  });

  // PriceConverter is entirely `internal`, and SwissCompliance only ever
  // reaches convertUsdToChf. PriceConverterHarness (contracts/mocks/) forwards
  // the other read paths so they can be tested at all.
  //
  // The bug these pin: getLatestPrice validated the round and checked
  // staleness, getPriceFeedInfo did neither beyond a couple of field checks,
  // and isPriceStale called a feed that had never published (updatedAt == 0)
  // fresh. Three read paths, three different ideas of a usable price.
  describe("PriceConverter read paths", function () {
    const FEED_DECIMALS = 8;
    const CHF_USD_PRICE = 110_000_000n; // 1.10 USD per CHF, 8 decimals
    const MAX_STALENESS = 24 * 60 * 60;

    async function deployPriceFeedFixture() {
      const [owner, user1] = await ethers.getSigners();

      const Aggregator = await ethers.getContractFactory("MockV3Aggregator");
      const feed = await Aggregator.deploy(FEED_DECIMALS, CHF_USD_PRICE);
      await feed.waitForDeployment();

      const Harness = await ethers.getContractFactory("PriceConverterHarness");
      const harness = await Harness.deploy();
      await harness.waitForDeployment();

      const Compliance = await ethers.getContractFactory("SwissCompliance");
      const compliance = await Compliance.deploy(await feed.getAddress());
      await compliance.waitForDeployment();

      return { feed, harness, compliance, owner, user1 };
    }

    /** Rewrite the feed's round with a timestamp `age` seconds in the past. */
    async function ageFeed(
      feed: Awaited<ReturnType<typeof deployPriceFeedFixture>>["feed"],
      age: number
    ) {
      await feed.setRound(1, CHF_USD_PRICE, (await time.latest()) - age);
    }

    describe("getPriceFeedInfo validates what getLatestPrice validates", function () {
      it("Should report price, decimals, timestamp and description for a fresh feed", async function () {
        const { feed, harness } = await loadFixture(deployPriceFeedFixture);

        const [price, decimals, updatedAt, description] =
          await harness.getPriceFeedInfo(await feed.getAddress());

        expect(price).to.equal(CHF_USD_PRICE);
        expect(decimals).to.equal(FEED_DECIMALS);
        expect(updatedAt).to.be.greaterThan(0n);
        expect(description).to.equal("CHF / USD");
      });

      it("Should revert StalePrice on a feed older than MAX_STALENESS", async function () {
        const { feed, harness } = await loadFixture(deployPriceFeedFixture);

        await ageFeed(feed, MAX_STALENESS + 60);

        // This is the regression: the old getPriceFeedInfo had no staleness
        // check at all and returned the day-old price as if it were current.
        await expect(
          harness.getPriceFeedInfo(await feed.getAddress())
        ).to.be.revertedWithCustomError(harness, "StalePrice");
      });

      it("Should revert StalePrice when updatedAt is zero", async function () {
        const { feed, harness } = await loadFixture(deployPriceFeedFixture);

        await feed.setRound(1, CHF_USD_PRICE, 0);

        await expect(
          harness.getPriceFeedInfo(await feed.getAddress())
        ).to.be.revertedWithCustomError(harness, "StalePrice");
      });

      it("Should revert InvalidPrice on a zero round id", async function () {
        const { feed, harness } = await loadFixture(deployPriceFeedFixture);

        await feed.setRound(0, CHF_USD_PRICE, await time.latest());

        await expect(
          harness.getPriceFeedInfo(await feed.getAddress())
        ).to.be.revertedWithCustomError(harness, "InvalidPrice");
      });

      it("Should revert InvalidPrice on a non-positive answer", async function () {
        const { feed, harness } = await loadFixture(deployPriceFeedFixture);

        await feed.setRound(1, 0, await time.latest());

        await expect(
          harness.getPriceFeedInfo(await feed.getAddress())
        ).to.be.revertedWithCustomError(harness, "InvalidPrice");
      });

      it("Should revert InvalidFeedAddress on the zero address", async function () {
        const { harness } = await loadFixture(deployPriceFeedFixture);

        await expect(
          harness.getPriceFeedInfo(ethers.ZeroAddress)
        ).to.be.revertedWithCustomError(harness, "InvalidFeedAddress");
      });

      it("Should accept exactly what getLatestPrice accepts, and report the same numbers", async function () {
        const { feed, harness } = await loadFixture(deployPriceFeedFixture);
        const feedAddress = await feed.getAddress();

        const [infoPrice, infoDecimals] =
          await harness.getPriceFeedInfo(feedAddress);
        const [price, decimals] = await harness.getLatestPrice(feedAddress);

        expect(infoPrice).to.equal(price);
        expect(infoDecimals).to.equal(decimals);

        // And they refuse the same round: neither path is the lenient one.
        await ageFeed(feed, MAX_STALENESS + 60);

        await expect(
          harness.getLatestPrice(feedAddress)
        ).to.be.revertedWithCustomError(harness, "StalePrice");
        await expect(
          harness.getPriceFeedInfo(feedAddress)
        ).to.be.revertedWithCustomError(harness, "StalePrice");
      });
    });

    describe("isPriceStale agrees with the reverting read paths", function () {
      it("Should report a fresh feed as fresh", async function () {
        const { feed, harness } = await loadFixture(deployPriceFeedFixture);

        expect(await harness.isPriceStale(await feed.getAddress())).to.equal(
          false
        );
      });

      it("Should report a feed older than MAX_STALENESS as stale", async function () {
        const { feed, harness } = await loadFixture(deployPriceFeedFixture);

        await ageFeed(feed, MAX_STALENESS + 60);

        expect(await harness.isPriceStale(await feed.getAddress())).to.equal(
          true
        );
      });

      it("Should report updatedAt == 0 as stale", async function () {
        const { feed, harness } = await loadFixture(deployPriceFeedFixture);

        await feed.setRound(1, CHF_USD_PRICE, 0);

        // A feed that never published a round is not a fresh feed. This used
        // to return false, because `block.timestamp - 0` is not greater than
        // MAX_STALENESS only if you forget that 0 means "never".
        expect(await harness.isPriceStale(await feed.getAddress())).to.equal(
          true
        );
      });

      it("Should never disagree with getLatestPrice about a round", async function () {
        const { feed, harness } = await loadFixture(deployPriceFeedFixture);
        const feedAddress = await feed.getAddress();

        for (const updatedAt of [0, (await time.latest()) - MAX_STALENESS * 2]) {
          await feed.setRound(1, CHF_USD_PRICE, updatedAt);

          expect(await harness.isPriceStale(feedAddress)).to.equal(true);
          await expect(
            harness.getLatestPrice(feedAddress)
          ).to.be.revertedWithCustomError(harness, "StalePrice");
        }
      });

      it("Should report the zero address as stale rather than revert", async function () {
        const { harness } = await loadFixture(deployPriceFeedFixture);

        expect(await harness.isPriceStale(ethers.ZeroAddress)).to.equal(true);
      });
    });

    describe("SwissCompliance inherits the same rule", function () {
      it("Should convert to CHF while the feed is fresh", async function () {
        const { compliance, owner, user1 } = await loadFixture(
          deployPriceFeedFixture
        );

        const deposits = 1_000_000_000n; // 1,000 USDC, 6 decimals
        await compliance
          .connect(owner)
          .updateTaxData(user1.address, deposits, 0, 0);

        const [, , , depositsChf] = await compliance.getUserTaxData(
          user1.address
        );

        // USDC (6dp) is scaled to 18dp, then divided by the CHF/USD price.
        expect(depositsChf).to.equal(
          (deposits * 10n ** 12n * 10n ** BigInt(FEED_DECIMALS)) / CHF_USD_PRICE
        );
      });

      it("Should refuse to report tax data off a stale feed", async function () {
        const { compliance, feed, owner, user1 } = await loadFixture(
          deployPriceFeedFixture
        );

        await compliance
          .connect(owner)
          .updateTaxData(user1.address, 1_000_000_000n, 0, 0);

        await ageFeed(feed, MAX_STALENESS + 60);

        await expect(
          compliance.getUserTaxData(user1.address)
        ).to.be.revertedWithCustomError(compliance, "StalePrice");
      });
    });
  });
});
