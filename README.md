# Decentralized Kickstarter Smart Contract

![Image Description](/client/public/assets/homepage-dapps.png)

This repository contains a Solidity smart contract for a crowdfunding platform. The contract allows users to create and manage crowdfunding campaigns, accept donations, and distribute funds.

## Table of Contents

- [Decentralized Kickstarter Smart Contract](#decentralized-kickstarter-smart-contract)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Getting Started](#getting-started)
  - [Contract Overview](#contract-overview)
  - [Functions](#functions)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [License](#license)

## Introduction

The Crowdfunding Smart Contract is a decentralized application (dApp) built on the Ethereum blockchain. It leverages the power of smart contract to facilitate crowdfunding campaigns in a transparent and secure manner

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

## Functions

constructor

- Initializes the contract by setting the fee account, fee percent, owner, and price feed address.

createCampaign

- Allows users to create a new campaign. It takes inputs such as category, title, description, target amount, deadline, and image. It creates a new campaign with the provided details and emits the CreatedCampaign event.

donateToCampaign

- Allows users to donate to a specific campaign. Users provide the campaign ID and send an amount of Ether with the transaction. The donated amount is added to the campaign's amountCollected, and the donator's address and donation amount are stored. If the campaign's target amount is reached, the campaign status is set to APPROVED. Otherwise, it remains OPEN. The function emits the DonatedCampaign event.

cancelCampaign

- Allows the campaign owner to cancel a campaign. It can only be called for campaigns with the status OPEN. The campaign's status is set to DELETED, and if there are any collected funds, a refund is triggered using the \_refund function. The function emits the CancelCampaign event.

withdrawCampaign

- Allows the campaign owner to withdraw the funds from a campaign. It can only be called for campaigns with the status APPROVED or REVERTED. The campaign's status is set to PAID, and the funds are transferred to the campaign owner using the \_payOut function. The function emits the WithdrawCampaign event.

refundCampaign

- Allows the campaign owner to refund the funds collected in a campaign. It can only be called before the campaign's deadline. The campaign's status is set to REVERTED, and a refund is triggered using the \_refund function. The function emits the RefundCampaign event.

updateCampaign

- Allows the campaign owner to update the target amount and deadline of a campaign. It can only be called for campaigns with the status REVERTED. The campaign's target amount and deadline are updated, and the status is set to OPEN. The function emits the UpdatedCampaign event.

setFee

- Allows the contract owner to set the fee percentage.

setAuthorizedExecutor

- Allows the contract owner to set an authorized executor.

withdrawFromContract

- Allows the contract owner to withdraw the contract's balance.

getDonators

- Retrieves the addresses and donation amounts of the donators for a specific campaign.

getCampaigns

- Retrieves an array of all campaigns.

getCampaign

- Retrieves the details of a specific campaign.

getFeeAccount

- Retrieves the fee account address.

getFeePercent

- Retrieves the fee percentage.

getPriceFeed

- Retrieves the price feed interface address.

getStatus

- Retrieves the status of a specific campaign.

getBalance

- Retrieves the balance of a campaign owner.

getContractBalance

- Retrieves the balance of the contract.

getRefundStatus

- Retrieves the refund status of a campaign.

getRemainingTime

- Retrieves the remaining time (in seconds) until the deadline of a campaign.

setCampaignStatus

- Allows the contract owner to set the status of a campaign.

checkUpkeep and performUpkeep

- Functions required by the Keeper Network to perform maintenance tasks and update campaign statuses.

Internal functions (\_refund, \_payTo, \_payOut, \_isUpdateCampaignStatusNeeded, \_updateCampaignStatus)

- These functions are used internally for refunding, transferring funds, updating campaign status, and checking if a campaign status update is needed.

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
