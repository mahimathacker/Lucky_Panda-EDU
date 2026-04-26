const hre = require("hardhat");

const VRF_COORDINATOR = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B";
const VRF_KEY_HASH =
  "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";
const VRF_SUBSCRIPTION_ID =
  "72544967497282408309874280965537828444150412992519385695430290523480694163851";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying LotteryEscrowParent with account:", deployer.address);

  const LotteryEscrowParent = await hre.ethers.getContractFactory(
    "LotteryEscrowParent"
  );
  const lotteryEscrowParent = await LotteryEscrowParent.deploy();
  await lotteryEscrowParent.waitForDeployment();

  const parentAddress = await lotteryEscrowParent.getAddress();
  console.log("LotteryEscrowParent address:", parentAddress);

  const setVRFConfigTx = await lotteryEscrowParent.setVRFConfig(
    VRF_COORDINATOR,
    VRF_KEY_HASH,
    VRF_SUBSCRIPTION_ID
  );
  await setVRFConfigTx.wait();

  console.log("VRF v2.5 config set");
  console.log("VRF coordinator:", VRF_COORDINATOR);
  console.log("VRF key hash:", VRF_KEY_HASH);
  console.log("VRF subscription ID:", VRF_SUBSCRIPTION_ID);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
