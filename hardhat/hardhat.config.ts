import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "dotenv/config";
import "@nomiclabs/hardhat-etherscan";
import "solidity-coverage";
import "hardhat-gas-reporter";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-chai-matchers";
import "hardhat-deploy";

const GOERLI_URL = process.env.GOERLI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
      saveDeployments: true,
      gasPrice: 8000000000,
    },
    localhost: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
      saveDeployments: true,
      gasPrice: 8000000000,
    },
    goerli: {
      url: GOERLI_URL,
      accounts: [`${PRIVATE_KEY}`],
      chainId: 5,
      allowUnlimitedContractSize: true,
    },
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    feeAccount: {
      default: 1,
    },
    user1: {
      default: 2,
    },
    user2: {
      default: 3,
    },
  },
};

export default config;
