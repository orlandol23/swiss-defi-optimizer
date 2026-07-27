import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("SwissCompliance", function () {
  // A Chainlink feed address is required by the constructor but is not read by
  // any path exercised here, so a non-zero placeholder is enough.
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
});
