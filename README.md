# Decentralized Kickstarter Smart Contract

This repository contains a Solidity smart contract for a crowdfunding platform. The contract allows users to create and manage crowdfunding campaigns, accept donations, and distribute funds.

## Table of Contents

- [Decentralized Kickstarter Smart Contract](#decentralized-kickstarter-smart-contract)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Getting Started](#getting-started)
  - [Contract Overview](#contract-overview)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [License](#license)

## Introduction

The Crowdfunding Smart Contract is a decentralized application (dApp) built on the Ethereum blockchain. It leverages the power of smart contract to facilitate crowdfunding campaigns in a transparent and secure manner.

## Getting Started

To get started with the Crowdfunding Smart Contract, follow these steps:

1. Clone the repository: `git clone <repository-url>`
2. Install the necessary dependencies: `npm install`
3. Compile the smart contract: `npx hardhat compile`
4. Deploy the contract to a local development network or a testnet
5. Integrate the contract into your dApp or interact with it using a wallet or a blockchain explorer

## Contract Overview

![Image Description](/client/public/assets/process-flow-chart.png)

The Crowdfunding Smart Contract is structured as follows:

- The contract defines a struct `Campaign` to represent a crowdfunding campaign. It stores essential information such as the campaign ID, owner, title, description, target amount, deadline, amount collected, image URL, donators, donations, status, category, and refund status.
- The contract includes various modifiers to restrict access to specific functions based on the user's role or campaign status.
- It emits events to notify external applications about important contract actions, such as campaign creation, donations, cancellations, payouts, and refunds.
- The contract implements a Keeper-compatible interface to perform regular upkeep tasks, such as updating the status of expired campaigns.
- It utilizes the Chainlink library for price feed functionality, allowing campaigns to accept donations in different currencies.

## Usage

To use the Crowdfunding Smart Contract, follow these guidelines:

1. Create a new campaign by calling the `createCampaign` function and providing the required parameters, such as the category, title, description, target amount, deadline, and image URL.
2. Users can donate to a campaign using the `donateToCampaign` function and specifying the campaign ID.
3. The campaign owner can cancel a campaign before the deadline using the `cancelCampaign` function.
4. Once a campaign reaches its target amount or the deadline expires, the campaign owner can withdraw the funds using the `withdrawCampaign` function.
5. In case a campaign needs to be refunded, the owner can initiate a refund using the `refundCampaign` function.
6. The contract owner can update the campaign status manually using the `setCampaignStatus` function, or rely on the Keeper-compatible interface to automatically update the status of expired campaigns.
7. Retrieve campaign information, such as the list of donators and their donations, using the appropriate getter functions.

## Contributing

Contributions to the Crowdfunding Smart Contract are welcome! If you encounter any issues, have suggestions for improvements, or would like to add new features, please submit a pull request.

## License

The Crowdfunding Smart Contract is released under the MIT License. See the [LICENSE](LICENSE) file for more details.
