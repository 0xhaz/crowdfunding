import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
// @ts-ignore
import { ethers, artifacts } from "hardhat";
import verify from "../utils/verify";
import fs from "fs";
import {
  developmentChains,
  networkConfig,
  feePercent,
} from "../helper-hardhat-config";
import { CrowdFund } from "../typechain-types";

type Contract = CrowdFund;

const contractName = "CrowdFund";

const deployCrowdFund: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer, feeAccount } = await getNamedAccounts();
  const chainId = network.config.chainId;

  ("Deploying CrowdFund Contract...");
  const crowdFundContract = await deploy("CrowdFund", {
    from: deployer,
    args: [feeAccount, feePercent],
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmation || 1,
  });

  saveFrontEndFiles(crowdFundContract, contractName);
  saveConfig(crowdFundContract, contractName);

  log(`CrowdFund deployed at ${crowdFundContract.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(crowdFundContract.address, []);
  }
};

function saveFrontEndFiles(contract: Contract, contractName: string) {
  const clientPath =
    "/Volumes/extreme/Projects/Solidity/Portfolio/CrowdFunding/source/client";
  const contractDir = clientPath + "/pages/contracts";

  if (!fs.existsSync(contractDir)) {
    fs.mkdirSync(contractDir, err => {
      if (err) {
        return console.error(err);
      }
      console.log("Directory created successfully!");
    });
  }

  fs.writeFileSync(
    contractDir + "/contract-address.json",
    JSON.stringify({ [contractName]: contract.address }, undefined, 2)
  );

  const Artifact = artifacts.readArtifactSync(contractName);

  fs.writeFileSync(
    contractDir + `/${contractName}.json`,
    JSON.stringify(Artifact, null, 2)
  );
}

function saveConfig(contract: Contract, contractName: string) {
  fs.writeFileSync(
    "./config.json",
    JSON.stringify({ [contractName]: contract.address }, undefined, 2)
  );
}

export default deployCrowdFund;
