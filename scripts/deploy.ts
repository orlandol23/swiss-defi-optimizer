import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface DeploymentAddresses {
  network: string;
  usdc: string;
  vault: string;
  swissCompliance: string;
  chfUsdFeed: string;
  deployedAt: number;
  deployer: string;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;

  console.log("\n==============================================");
  console.log("Swiss DeFi Optimizer - Deployment Script");
  console.log("==============================================\n");
  console.log(`Network: ${networkName} (Chain ID: ${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

  // Network-specific addresses
  let usdcAddress: string;
  let chfUsdFeedAddress: string;

  if (networkName === "sepolia") {
    // Sepolia testnet addresses
    usdcAddress = process.env.USDC_ADDRESS_SEPOLIA || "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
    chfUsdFeedAddress = process.env.CHF_USD_FEED_SEPOLIA || "0xed0616BeF04D374969f302a34AE4A63882490A8C";
    console.log("Using Sepolia testnet addresses:");
    console.log(`USDC: ${usdcAddress}`);
    console.log(`CHF/USD Feed: ${chfUsdFeedAddress}\n`);
  } else {
    // Localhost/Hardhat - deploy mocks
    console.log("Deploying mock contracts for local testing...\n");

    // Deploy MockUSDC
    console.log("1️⃣  Deploying MockUSDC...");
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDCFactory.deploy();
    await usdc.waitForDeployment();
    usdcAddress = await usdc.getAddress();
    console.log(`   ✅ MockUSDC deployed to: ${usdcAddress}`);

    // For localhost, we'll use a mock address for the price feed
    // In production, this would be a real Chainlink feed
    chfUsdFeedAddress = "0x0000000000000000000000000000000000000000"; // Placeholder
    console.log(`   ⚠️  Using placeholder for CHF/USD feed on localhost`);
  }

  // Deploy Vault
  console.log("\n2️⃣  Deploying Vault...");
  const VaultFactory = await ethers.getContractFactory("Vault");
  const vault = await VaultFactory.deploy(
    usdcAddress,
    "Swiss DeFi Vault",
    "sdvUSDC"
  );
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log(`   ✅ Vault deployed to: ${vaultAddress}`);

  // Deploy SwissCompliance (only if we have a real price feed)
  let swissComplianceAddress = "";
  if (chfUsdFeedAddress !== "0x0000000000000000000000000000000000000000") {
    console.log("\n3️⃣  Deploying SwissCompliance...");
    const SwissComplianceFactory = await ethers.getContractFactory("SwissCompliance");
    const swissCompliance = await SwissComplianceFactory.deploy(chfUsdFeedAddress);
    await swissCompliance.waitForDeployment();
    swissComplianceAddress = await swissCompliance.getAddress();
    console.log(`   ✅ SwissCompliance deployed to: ${swissComplianceAddress}`);
  } else {
    console.log("\n3️⃣  Skipping SwissCompliance deployment (no price feed)");
  }

  // Save deployment addresses
  console.log("\n4️⃣  Saving deployment addresses...");
  const deploymentData: DeploymentAddresses = {
    network: networkName,
    usdc: usdcAddress,
    vault: vaultAddress,
    swissCompliance: swissComplianceAddress,
    chfUsdFeed: chfUsdFeedAddress,
    deployedAt: Date.now(),
    deployer: deployer.address,
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${networkName}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentData, null, 2));
  console.log(`   ✅ Deployment data saved to: ${filename}`);

  // Display summary
  console.log("\n==============================================");
  console.log("Deployment Summary");
  console.log("==============================================");
  console.log(`Network:          ${networkName}`);
  console.log(`USDC:             ${usdcAddress}`);
  console.log(`Vault:            ${vaultAddress}`);
  if (swissComplianceAddress) {
    console.log(`SwissCompliance:  ${swissComplianceAddress}`);
    console.log(`CHF/USD Feed:     ${chfUsdFeedAddress}`);
  }
  console.log("==============================================\n");

  // Verification instructions
  if (networkName === "sepolia") {
    console.log("📝 To verify contracts on Etherscan, run:");
    console.log(`   npx hardhat verify --network sepolia ${vaultAddress} "${usdcAddress}" "Swiss DeFi Vault" "sdvUSDC"`);
    if (swissComplianceAddress) {
      console.log(`   npx hardhat verify --network sepolia ${swissComplianceAddress} "${chfUsdFeedAddress}"`);
    }
    console.log("");
  }

  // Next steps
  console.log("✨ Next steps:");
  console.log("   1. Test the vault with small deposits");
  console.log("   2. Set up a yield strategy (if desired)");
  console.log("   3. Configure max deposit limits");
  console.log("   4. Set up frontend to interact with vault");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
