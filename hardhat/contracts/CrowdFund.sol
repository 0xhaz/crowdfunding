// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "hardhat/console.sol";

error CrowdFund__Deadline();
error CrowdFund__NotOwner();
error CrowdFund__Claimed();
error CrowdFund__Ended();

contract CrowdFund {
    address public immutable i_feeAccount;
    uint256 public immutable i_feePercent;

    event CreatedCampaign(
        uint256 id,
        address indexed creator,
        uint256 target,
        uint256 deadline
    );

    event CancelCampaign(uint256 id);
    event Claim(uint256 id);

    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
        bool claimed;
    }

    mapping(uint256 => Campaign) public campaigns;

    constructor(address _feeAccount, uint256 _feePercent) {
        i_feeAccount = _feeAccount;
        i_feePercent = _feePercent;
    }

    uint256 public numberOfCampaigns = 0;

    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) external returns (uint256) {
        Campaign storage campaign = campaigns[numberOfCampaigns];
        if (
            campaign.deadline < block.timestamp &&
            campaign.deadline > block.timestamp + 90 days
        ) revert CrowdFund__Deadline();

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;

        numberOfCampaigns++;

        emit CreatedCampaign(numberOfCampaigns, _owner, _target, _deadline);

        return numberOfCampaigns - 1;
    }

    function cancelCampaign(uint256 _id, address _owner) external {
        Campaign memory campaign = campaigns[_id];
        if (_owner != msg.sender) revert CrowdFund__NotOwner();
        if (campaign.deadline > block.timestamp + 90 days)
            revert CrowdFund__Ended();

        delete campaigns[_id];

        emit CancelCampaign(_id);
    }

    function donateToCampaign(uint256 _id) external payable {
        uint256 amount = msg.value;
        uint256 _feeAmount = (amount * i_feePercent) / 100;
        uint256 totalAmount = amount - _feeAmount;

        Campaign storage campaign = campaigns[_id];

        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);

        (bool success, ) = payable(campaign.owner).call{value: totalAmount}("");
        if (success) {
            campaign.amountCollected = campaign.amountCollected + totalAmount;
        }
    }

    function withdraw(uint256 _id, address _owner) external payable {
        Campaign storage campaign = campaigns[_id];

        if (_owner != msg.sender) revert CrowdFund__NotOwner();
        if (block.timestamp < campaign.deadline) revert CrowdFund__Deadline();
        if (campaign.claimed == true) revert CrowdFund__Claimed();
        uint amount = address(this).balance;

        campaign.claimed = true;

        (bool success, ) = _owner.call{value: amount}("");
        require(success, "Failed to send Eth");

        emit Claim(_id);
    }

    function getDonators(
        uint256 _id
    ) public view returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() external view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for (uint i = 0; i < numberOfCampaigns; i++) {
            Campaign storage item = campaigns[i];

            allCampaigns[i] = item;
        }
        return allCampaigns;
    }
}
