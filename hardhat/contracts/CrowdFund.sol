// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "../library/PriceConverter.sol";
import "hardhat/console.sol";

error CrowdFund__Deadline();
error CrowdFund__NotOwner();
error CrowdFund__Claimed();
error CrowdFund__Ended();
error CrowdFund__Required();

contract CrowdFund {
    address private immutable i_feeAccount;
    uint256 private i_feePercent;
    address private i_owner;

    AggregatorV3Interface private s_priceFeed;

    uint256 public s_numberOfCampaigns = 0;

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
        uint256[] donations;
        CampaignStatus status;
        Category category;
        bool refunded;
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert CrowdFund__Required();
        _;
    }

    modifier requiredCampaign(
        string memory _title,
        string memory _description,
        string memory _image
    ) {
        if (bytes(_title).length < 0) revert CrowdFund__Required();
        if (bytes(_description).length < 0) revert CrowdFund__Required();
        if (bytes(_image).length < 0) revert CrowdFund__Required();

        _;
    }

    event CreatedCampaign(
        uint256 id,
        address indexed creator,
        Category category,
        uint256 target,
        uint256 deadline
    );

    event CancelCampaign(uint256 id, address indexed creator, uint timestamp);

    event DonatedCampaign(
        uint256 id,
        address indexed donator,
        uint value,
        uint timestamp
    );

    event PaidOutCampaign(
        uint256 id,
        address indexed creator,
        uint256 donations,
        uint256 timestamp
    );

    event WithdrawCampaign(uint id, address indexed creator);

    event RefundCampaign(uint id, address indexed creator);

    event UpdatedCampaign(uint256 id, uint256 newTarget, uint256 newDeadline);

    mapping(uint256 => Campaign) private s_campaigns;
    mapping(uint256 => bool) public s_campaignExist;

    constructor(
        address _feeAccount,
        uint256 _feePercent,
        address priceFeeAddress
    ) {
        i_feeAccount = _feeAccount;
        i_feePercent = _feePercent;
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeeAddress);
    }

    function createCampaign(
        Category _category,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    )
        external
        requiredCampaign(_title, _description, _image)
        returns (uint256)
    {
        if (_target < 0 ether) revert CrowdFund__Required();

        Campaign storage campaign = s_campaigns[s_numberOfCampaigns];

        campaign.id = s_numberOfCampaigns;
        campaign.owner = msg.sender;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;
        campaign.donators = new address[](0);
        campaign.donations = new uint256[](0);
        campaign.category = _category;

        if (
            _deadline <= block.timestamp && campaign.amountCollected < _target
        ) {
            campaign.status = CampaignStatus.REVERTED;
        } else {
            campaign.status = CampaignStatus.OPEN;
        }

        s_campaignExist[campaign.id] = true;

        s_numberOfCampaigns++;

        emit CreatedCampaign(
            s_numberOfCampaigns,
            msg.sender,
            _category,
            _target,
            _deadline
        );

        return s_numberOfCampaigns - 1;
    }

    function donateToCampaign(uint256 _id) external payable {
        Campaign storage campaign = s_campaigns[_id];
        uint amount = msg.value;

        if (amount < 0 ether) revert CrowdFund__Required();
        if (!s_campaignExist[_id]) revert CrowdFund__Required();
        if (
            campaign.status != CampaignStatus.OPEN &&
            campaign.status != CampaignStatus.APPROVED
        ) revert CrowdFund__Ended();

        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);
        campaign.amountCollected += amount;

        emit DonatedCampaign(_id, msg.sender, amount, block.timestamp);

        if (campaign.amountCollected >= campaign.target) {
            campaign.status = CampaignStatus.APPROVED;
        } else {
            campaign.status = CampaignStatus.OPEN;
        }
    }

    function cancelCampaign(uint256 _id) external {
        Campaign storage campaign = s_campaigns[_id];

        if (campaign.owner != msg.sender) revert CrowdFund__NotOwner();
        if (campaign.status != CampaignStatus.OPEN)
            revert CrowdFund__Required();

        campaign.status = CampaignStatus.DELETED;

        if (campaign.amountCollected > 0) {
            _refund(_id);
        }

        emit CancelCampaign(_id, msg.sender, block.timestamp);
    }

    function withdrawCampaign(uint256 _id) external payable {
        Campaign storage campaign = s_campaigns[_id];

        if (campaign.status != CampaignStatus.APPROVED)
            revert CrowdFund__Required();
        if (msg.sender != campaign.owner) revert CrowdFund__NotOwner();

        campaign.status = CampaignStatus.PAID;

        _payOut(_id);

        emit WithdrawCampaign(_id, msg.sender);
    }

    function refundCampaign(uint _id) external {
        Campaign storage campaign = s_campaigns[_id];

        if (
            campaign.status == CampaignStatus.REVERTED ||
            campaign.status == CampaignStatus.DELETED ||
            campaign.status == CampaignStatus.PAID
        ) revert CrowdFund__Ended();

        if (block.timestamp >= campaign.deadline) revert CrowdFund__Deadline();

        campaign.status = CampaignStatus.REVERTED;

        _refund(_id);

        emit RefundCampaign(_id, campaign.owner);
    }

    function updateCampaign(
        uint _id,
        uint _newTarget,
        uint _newDeadline
    ) external {
        Campaign storage campaign = s_campaigns[_id];

        if (campaign.owner != msg.sender) revert CrowdFund__NotOwner();
        if (campaign.status != CampaignStatus.REVERTED)
            revert CrowdFund__Required();
        if (block.timestamp <= campaign.deadline) revert CrowdFund__Deadline();

        campaign.target = _newTarget;
        campaign.deadline = _newDeadline;

        if (
            campaign.amountCollected < _newTarget &&
            _newDeadline <= block.timestamp
        ) {
            campaign.status = CampaignStatus.REVERTED;
        } else {
            campaign.status = CampaignStatus.OPEN;
        }

        emit UpdatedCampaign(_id, _newTarget, _newDeadline);
    }

    function setFee(uint _fee) external onlyOwner {
        i_feePercent = _fee;
    }

    function getDonators(
        uint256 _id
    ) external view returns (address[] memory, uint256[] memory) {
        return (s_campaigns[_id].donators, s_campaigns[_id].donations);
    }

    function getCampaigns() external view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](s_numberOfCampaigns);

        for (uint i = 0; i < s_numberOfCampaigns; i++) {
            Campaign storage item = s_campaigns[i];

            allCampaigns[i] = item;
        }
        return allCampaigns;
    }

    function getFeeAccount() external view returns (address) {
        return i_feeAccount;
    }

    function getFeePercent() external view returns (uint) {
        return i_feePercent;
    }

    function getPriceFeed() external view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getStatus(
        uint _id
    ) external view returns (CampaignStatus _status) {
        return _status = s_campaigns[_id].status;
    }

    function getBalance(uint _id) external view returns (uint) {
        return s_campaigns[_id].owner.balance;
    }

    function getContractBalance() external view returns (uint) {
        return i_feeAccount.balance;
    }

    function getRefundStatus(uint _id) external view returns (bool) {
        Campaign memory campaign = s_campaigns[_id];

        return campaign.refunded;
    }

    function _refund(uint _id) internal {
        Campaign storage campaign = s_campaigns[_id];

        if (
            campaign.status != CampaignStatus.DELETED &&
            campaign.status != CampaignStatus.REVERTED
        ) revert CrowdFund__Required();

        address[] memory donator = new address[](campaign.donators.length);
        uint[] memory donation = new uint[](campaign.donations.length);

        for (uint i = 0; i < campaign.donators.length; i++) {
            donator[i] = campaign.donators[i];
            donation[i] = campaign.donations[i];

            _payTo(donator[i], donation[i]);
        }

        campaign.refunded = true;
    }

    function _payTo(address _to, uint _amount) internal {
        (bool success, ) = payable(_to).call{value: _amount}("");
        require(success);
    }

    function _payOut(uint _id) internal {
        Campaign storage campaign = s_campaigns[_id];

        if (campaign.status != CampaignStatus.PAID)
            revert CrowdFund__Required();

        uint totalAmount = campaign.amountCollected;
        uint fee = (totalAmount * i_feePercent) / 100;
        uint netAmount = totalAmount - fee;

        _payTo(campaign.owner, netAmount);
        _payTo(i_feeAccount, fee);

        emit PaidOutCampaign(_id, msg.sender, netAmount, block.timestamp);
    }
}
