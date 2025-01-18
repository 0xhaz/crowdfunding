// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.27;

import {Test, console2} from "forge-std/Test.sol";
import {CrowdFund} from "src/core/CrowdFund.sol";
import {MockProofVerifier} from "src/mocks/MockProofVerifier.sol";

contract CrowdFundTest is Test {
    CrowdFund public crowdFund;
    MockProofVerifier public proofVerifier;

    address feeAccount = makeAddr("FeeAccount");
    uint256 feePercent = 5;
    address priceFeed = makeAddr("PriceFeed");

    function setUp() public {
        proofVerifier = new MockProofVerifier();

        crowdFund = new CrowdFund(feeAccount, feePercent, priceFeed, address(proofVerifier));
    }
}
