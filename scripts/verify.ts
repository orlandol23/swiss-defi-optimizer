import { run } from "hardhat";
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
  console.log("\n==============================================");
  console.log("Swiss DeFi Optimizer - Verification Script");
  console.log("==============================================\n");

  // Load deployment addresses
  const network = process.env.HARDHAT_NETWORK || "sepolia";
  const deploymentFile = path.join(__dirname, "../deployments", `${network}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found: ${deploymentFile}`);
    console.error(`   Please run deployment script first.`);
    process.exit(1);
  }

  const deploymentData: DeploymentAddresses = JSON.parse(
    fs.readFileSync(deploymentFile, "utf-8")
  );

  console.log(`Network: ${deploymentData.network}`);
  console.log(`Vault: ${deploymentData.vault}`);
  console.log(`SwissCompliance: ${deploymentData.swissCompliance}\n`);

  // Verify Vault
  console.log("1️⃣  Verifying Vault contract...");
  try {
    await run("verify:verify", {
      address: deploymentData.vault,
      constructorArguments: [
        deploymentData.usdc,
        "Swiss DeFi Vault",
        "sdvUSDC",
      ],
    });
    console.log("   ✅ Vault verified successfully\n");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("   ✅ Vault already verified\n");
    } else {
      console.error("   ❌ Vault verification failed:");
      console.error(error.message);
    }
  }

  // Verify SwissCompliance
  if (deploymentData.swissCompliance && deploymentData.swissCompliance !== "") {
    console.log("2️⃣  Verifying SwissCompliance contract...");
    try {
      await run("verify:verify", {
        address: deploymentData.swissCompliance,
        constructorArguments: [deploymentData.chfUsdFeed],
      });
      console.log("   ✅ SwissCompliance verified successfully\n");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("   ✅ SwissCompliance already verified\n");
      } else {
        console.error("   ❌ SwissCompliance verification failed:");
        console.error(error.message);
      }
    }
  }

  console.log("==============================================");
  console.log("Verification Complete");
  console.log("==============================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Verification failed:");
    console.error(error);
    process.exit(1);
  });
