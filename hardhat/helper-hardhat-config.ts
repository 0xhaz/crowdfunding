export interface networkConfigItem {
  blockConfirmation?: number;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const developmentChains = ["hardhat", "localhost"];

export const feePercent = 10;

export const networkConfig: networkConfigInfo = {
  localhost: {},
  hardhat: {},
  goerli: {
    blockConfirmation: 6,
  },
};
