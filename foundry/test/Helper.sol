// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.27;

import {Test, console2} from "forge-std/Test.sol";
import {CrowdFund} from "src/core/CrowdFund.sol";

contract Helper is Test {
    enum CampaignStatus {
        OPEN,
        APPROVED,
        REVERTED,
        DELETED,
        PAID
    }

    enum Category {
        CHARITY,
        TECH,
        WEB3,
        GAMES,
        EDUCATION
    }

    struct Campaign {
        uint256 id;
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        // mapping(address => uint256) donations;
        uint256 donationCount;
        CampaignStatus status;
        Category category;
        bool refunded;
        bool isCompleted;
    }

    address public CAMPAIGN_OWNER = makeAddr("CampaignOwner");

    function dummyCampaign() public view returns (Campaign memory campaign) {
        campaign.id = 0;
        campaign.owner = CAMPAIGN_OWNER;
        campaign.title = "Dummy Campaign";
        campaign.description = "This is a dummy campaign";
        campaign.target = 1000;
        campaign.deadline = 1000000000;
        campaign.amountCollected = 0;
        campaign.image = "https://dummyimage.com/600x400/000/fff";
        campaign.donators = new address[](0);
        campaign.donationCount = 0;
        campaign.status = CampaignStatus.OPEN;
        campaign.category = Category.CHARITY;
        campaign.refunded = false;
        campaign.isCompleted = false;
    }
}
