const { network, artifacts } = require("hardhat");
const {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { MockV3Aggregator__factory, MockV3Aggregator } from "../typechain";
import fs from "fs";

type Contract = MockV3Aggregator;

const contractName = "MockV3Aggregator";

const deployMockV3Aggregator: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks....");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    });
    log("Mocks Deployed");
    log("---------------------------------------------");

    const mockV3AggregatorContract = await get<MockV3Aggregator>(contractName);

    log("Mocks Deployed");
    log("---------------------------------------------");

    saveFrontEndFiles(mockV3AggregatorContract, contractName);
    saveConfig(mockV3AggregatorContract, contractName);
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
    contractDir + "/priceFeed-address.json",
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

export default deployMockV3Aggregator;
