// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.27;

import {Test, console2} from "forge-std/Test.sol";
import {CrowdFund} from "src/core/CrowdFund.sol";
import {MockProofVerifier} from "src/mocks/MockProofVerifier.sol";
import {Helper} from "test/Helper.sol";

contract CrowdFundTest is Test {
    CrowdFund public crowdFund;
    MockProofVerifier public proofVerifier;
    Helper public helper;

    event CreatedCampaign(
        uint256 id, address indexed creator, CrowdFund.Category category, uint256 target, uint256 deadline
    );

    event CancelCampaign(uint256 id, address indexed creator, uint256 timestamp);

    event DonatedCampaign(uint256 id, address indexed donator, uint256 value, uint256 timestamp);

    event PaidOutCampaign(uint256 id, address indexed creator, uint256 donations, uint256 timestamp);

    event WithdrawCampaign(uint256 id, address indexed creator);

    event RefundCampaign(uint256 id, address indexed creator);

    event UpdatedCampaign(uint256 id, uint256 newTarget, uint256 newDeadline);

    string title = "Test Campaign";
    string description = "This is a test campaign";
    uint256 target = 1 ether;
    uint256 deadline = block.timestamp + 7 days;
    string image = "https://dummyimage.com/600x400/000/fff";
    CrowdFund.Category public categoryType = CrowdFund.Category.CHARITY;

    address feeAccount = makeAddr("FeeAccount");
    uint256 feePercent = 5;
    address priceFeed = makeAddr("PriceFeed");
    address CAMPAIGN_OWNER = makeAddr("CampaignOwner");
    address DONATOR = makeAddr("Donator");

    function setUp() public {
        proofVerifier = new MockProofVerifier();

        helper = new Helper();

        crowdFund = new CrowdFund(feeAccount, feePercent, priceFeed, address(proofVerifier));

        vm.deal(CAMPAIGN_OWNER, 100 ether);
        vm.deal(DONATOR, 100 ether);
    }

    modifier createdCampaign() {
        vm.prank(CAMPAIGN_OWNER);
        uint256 campaignId = crowdFund.createCampaign(categoryType, title, description, target, deadline, image);
        _;
    }

    function test_CreateCampaign() public {
        vm.prank(CAMPAIGN_OWNER);
        uint256 campaignId;

        vm.expectEmit(true, true, false, false);
        emit CreatedCampaign(campaignId, CAMPAIGN_OWNER, categoryType, target, deadline);

        campaignId = crowdFund.createCampaign(categoryType, title, description, target, deadline, image);

        CrowdFund.CampaignView memory campaign = crowdFund.getCampaign(campaignId);

        assertEq(campaignId, 0);
        assertEq(campaign.owner, CAMPAIGN_OWNER);
        assertEq(campaign.title, title);
        assertEq(campaign.description, description);
        assertEq(campaign.target, target);
        assertEq(campaign.deadline, deadline);
        assertEq(campaign.amountCollected, 0);
        assertEq(campaign.image, image);
        assertEq(campaign.refunded, false);
        assertEq(campaign.isCompleted, false);
    }

    function test_DonateToCampaign() public createdCampaign {
        bytes memory fakeProof = hex"1234";
        uint256 donation = 1 ether;
        bytes32 fakePublicInput = bytes32(donation);

        vm.prank(DONATOR);
        vm.expectEmit(true, true, false, false);
        emit DonatedCampaign(0, DONATOR, donation, block.timestamp);

        crowdFund.donateToCampaign{value: donation}(0, fakeProof, fakePublicInput);

        CrowdFund.CampaignView memory campaign = crowdFund.getCampaign(0);

        assertEq(campaign.amountCollected, donation);
    }

    /// @dev Retrieve the data for fakeAggregatorProof and publicInputHash by running the circuit
    /// python3 src/scripts/batch_contribute.py
    function test_BatchContribute_WithRealData() public createdCampaign {
        bytes memory fakeAggregatorProof = hex"0ebc6b163d7235b0bf3272d709dcf6e7c4ae8ffebe917e709513f9d2f7ce9eda";
        bytes32 publicInputHash = 0x00000000000000000000000000000000000000000000000014d1120d7b160000;
        uint256 donation = 1.5 ether;

        vm.prank(DONATOR);
        crowdFund.batchContribute(0, fakeAggregatorProof, publicInputHash);

        CrowdFund.CampaignView memory campaign = crowdFund.getCampaign(0);

        assertEq(campaign.amountCollected, donation);
    }
}
