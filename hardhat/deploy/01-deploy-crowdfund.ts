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
import { CrowdFund__factory, CrowdFund } from "../typechain";

type Contract = CrowdFund;

const contractName = "CrowdFund";

const deployCrowdFund: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log, get } = deployments;
  const { deployer, feeAccount } = await getNamedAccounts();
  const chainId: number | undefined = network.config.chainId;
  let ethUsdPriceFeedAddress;
  let blockConfirmations;

  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
    blockConfirmations = 0;
  } else {
    const networkInfo = networkConfig[chainId];
    if (!networkInfo) {
      throw new Error(`Network configuration not found for chainId ${chainId}`);
    }
    ethUsdPriceFeedAddress = networkInfo.ethUsdPriceFeed;
    blockConfirmations = networkInfo.blockConfirmations;
    if (blockConfirmations === undefined) {
      throw new Error(
        `Block confirmations not specified for chainId ${chainId}`
      );
    }
  }

  const args = [feeAccount, feePercent, ethUsdPriceFeedAddress];

  log("Deploying CrowdFund Contract...");
  const crowdFundContract = await deploy("CrowdFund", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: blockConfirmations || 1,
  });

  saveFrontEndFiles(crowdFundContract, contractName);
  saveConfig(crowdFundContract, contractName);

  log(`CrowdFund deployed at ${crowdFundContract.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(crowdFundContract.address, args);
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

  // const addNewLine = () => {
  //   fs.open(contractDir, "a", (e, id) => {
  //     fs.writeFileSync(
  //       "/contract-address.json",
  //       JSON.stringify({ [contractName]: contract.address }, undefined, 2)
  //     );
  //   });
  // };

  // const file = fs.readFileSync(contractDir + "/contract-address.json");
  // const data = { contractName: contract.address };
  // if (file.length === 0) {
  //   fs.writeFileSync("contract-address.json", JSON.stringify([data]));
  // } else {
  //   const json = JSON.parse(file.toString());
  //   json.push(data);
  //   fs.writeFileSync("contract-address.json", JSON.stringify(data));
  // }

  // fs.writeFileSync(data, JSON.stringify(json));

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
