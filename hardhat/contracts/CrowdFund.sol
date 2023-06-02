// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "../library/PriceConverter.sol";
// import "hardhat/console.sol";

error CrowdFund__Deadline();
error CrowdFund__NotOwner();
error CrowdFund__Claimed();
error CrowdFund__Ended();
error CrowdFund__Required();

contract CrowdFund is KeeperCompatibleInterface {
    address private immutable i_feeAccount;
    uint256 private i_feePercent;
    address private i_owner;
    CampaignStatus private campaignStatus;

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
        if (msg.sender != i_owner) revert CrowdFund__NotOwner();
        _;
    }

    modifier onlyCampaignOwner(uint256 _id) {
        Campaign storage campaign = s_campaigns[_id];
        if (campaign.owner != msg.sender) revert CrowdFund__NotOwner();
        _;
    }

    modifier onlyOpenCampaign(uint _id) {
        Campaign storage campaign = s_campaigns[_id];
        if (campaign.status != CampaignStatus.OPEN)
            revert CrowdFund__Required();
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
    ) external returns (uint256) {
        if (_target < 0 ether) revert CrowdFund__Required();
        if (_deadline <= block.timestamp) revert CrowdFund__Required();

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

        campaign.status = CampaignStatus.OPEN;

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

    function donateToCampaign(
        uint256 _id
    ) external payable onlyOpenCampaign(_id) {
        Campaign storage campaign = s_campaigns[_id];
        uint amount = msg.value;

        if (!s_campaignExist[_id]) revert CrowdFund__Required();

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

    function cancelCampaign(
        uint256 _id
    ) external onlyCampaignOwner(_id) onlyOpenCampaign(_id) {
        Campaign storage campaign = s_campaigns[_id];

        if (campaign.owner != msg.sender) revert CrowdFund__NotOwner();

        campaign.status = CampaignStatus.DELETED;

        if (campaign.amountCollected > 0) {
            _refund(_id);
        }

        emit CancelCampaign(_id, msg.sender, block.timestamp);
    }

    function withdrawCampaign(
        uint256 _id
    ) external payable onlyCampaignOwner(_id) {
        Campaign storage campaign = s_campaigns[_id];

        if (
            campaign.status != CampaignStatus.APPROVED &&
            campaign.status != CampaignStatus.REVERTED
        ) revert CrowdFund__Required();

        if (msg.sender != campaign.owner) revert CrowdFund__NotOwner();

        campaign.status = CampaignStatus.PAID;

        _payOut(_id);

        emit WithdrawCampaign(_id, msg.sender);
    }

    function refundCampaign(uint _id) external onlyCampaignOwner(_id) {
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
    ) external onlyCampaignOwner(_id) {
        Campaign storage campaign = s_campaigns[_id];

        if (campaign.status != CampaignStatus.REVERTED)
            revert CrowdFund__Required();

        campaign.target = _newTarget;
        campaign.deadline = _newDeadline;
        campaign.status = CampaignStatus.OPEN;

        emit UpdatedCampaign(_id, _newTarget, _newDeadline);
    }

    function setFee(uint _fee) external onlyOwner {
        i_feePercent = _fee;
    }

    function withdrawFromContract() external onlyOwner {
        payable(i_owner).transfer(address(this).balance);
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

    function getCampaign(uint _id) external view returns (Campaign memory) {
        return s_campaigns[_id];
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

    function getRemainingTime(uint256 _id) external view returns (uint) {
        Campaign storage campaign = s_campaigns[_id];
        if (!s_campaignExist[_id]) revert CrowdFund__Required();

        uint remainingTime = 0;

        if (block.timestamp < campaign.deadline) {
            remainingTime = campaign.deadline - block.timestamp;
        } else {
            remainingTime = 0;
        }
        return remainingTime;
    }

    // for contract owner only to set the campaign status
    function setCampaignStatus(
        uint256 _id,
        CampaignStatus _status
    ) external onlyOwner {
        Campaign storage campaign = s_campaigns[_id];

        if (!s_campaignExist[_id]) revert CrowdFund__Required();

        campaign.status = _status;
    }

    function checkUpkeep(
        bytes calldata
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        upkeepNeeded = _isUpdateCampaignStatusNeeded();
        performData = "";
    }

    function performUpkeep(bytes memory performData) external override {
        _updateCampaignStatus();
    }

    function _isUpdateCampaignStatusNeeded() internal view returns (bool) {
        Campaign storage campaign = s_campaigns[s_numberOfCampaigns];
        if (block.timestamp >= campaign.deadline) {
            return true;
        }
        return false;
    }

    function _updateCampaignStatus() internal onlyOwner {
        for (uint i = 0; i < s_numberOfCampaigns; i++) {
            Campaign storage campaign = s_campaigns[i];
            if (campaign.status == CampaignStatus.OPEN) {
                campaign.status = CampaignStatus.REVERTED;
                emit UpdatedCampaign(i, campaign.target, campaign.deadline);
            }
        }
    }

    function _refund(uint _id) internal {
        Campaign storage campaign = s_campaigns[_id];

        if (
            campaign.status != CampaignStatus.DELETED &&
            campaign.status != CampaignStatus.REVERTED
        ) revert CrowdFund__Required();

        // Calculate total amount to refund
        for (uint i = 0; i < campaign.donations.length; i++) {
            _payTo(campaign.donators[i], campaign.donations[i]);
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
