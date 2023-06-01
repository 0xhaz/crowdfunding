import { deployments, ethers, network } from "hardhat";
import { expect } from "chai";
import {
  CrowdFund,
  MockV3Aggregator,
  CrowdFund__factory,
  MockV3Aggregator__factory,
} from "../../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DECIMALS, INITIAL_ANSWER } from "../../helper-hardhat-config";
import { formatBytes32String } from "ethers/lib/utils";

const token = (n: number) => {
  return ethers.utils.parseEther(n.toString());
};

const dateToUNIX = (date: Date | string) => {
  return Math.round(new Date(date).getTime() / 1000).toString();
};

const Status = {
  OPEN: 0,
  APPROVED: 1,
  REVERTED: 2,
  DELETED: 3,
  PAID: 4,
};

const Category = {
  CHARITY: 0,
  TECH: 1,
  WEB3: 2,
  GAMES: 3,
  EDUCATION: 4,
};

describe("CrowdFund", () => {
  let cf: CrowdFund;
  let mockV3Aggregator: MockV3Aggregator;

  let user1: any,
    user2: any,
    user3: any,
    deployer: SignerWithAddress,
    feeAccount: SignerWithAddress,
    account: SignerWithAddress[];

  const feePercent = 10;

  beforeEach(async () => {
    await deployments.fixture(["all"]);
    account = await ethers.getSigners();
    deployer = account[0];
    user1 = account[1];
    user2 = account[2];
    feeAccount = account[0];

    const cfFactory = (await ethers.getContractFactory(
      "CrowdFund"
    )) as CrowdFund__factory;

    const MockV3AggregatorFactory = (await ethers.getContractFactory(
      "MockV3Aggregator"
    )) as MockV3Aggregator__factory;

    mockV3Aggregator = await MockV3AggregatorFactory.deploy(
      DECIMALS,
      INITIAL_ANSWER
    );

    cf = await cfFactory.deploy(
      feeAccount.address,
      feePercent,
      mockV3Aggregator.address
    );
  });

  describe("Deployment", () => {
    it("tracks the fee account", async () => {
      expect(await cf.getFeeAccount()).to.equal(feeAccount.address);
    });
    it("tracks the fee percent", async () => {
      expect(await cf.getFeePercent()).to.equal(feePercent);
    });
    it("sets the aggregator addresses correctly", async () => {
      expect(await cf.getPriceFeed()).to.equal(mockV3Aggregator.address);
    });
  });

  describe("Create Campaign", () => {
    let create: any, result: any, deadline: any;
    describe("Success", () => {
      beforeEach(async () => {
        deadline = dateToUNIX(new Date(Date.now() + 86400000));
        create = await cf
          .connect(user1)
          .createCampaign(
            Category.EDUCATION,
            "Test Title",
            "Test Description",
            token(1),
            deadline,
            "Image1.jpeg"
          );
        result = await create.wait(1);
      });

      it("create a new campaign", async () => {
        const campaignId = await cf.s_numberOfCampaigns();
        expect(campaignId).to.equal(1);
      });

      it("emits a create campaign event", () => {
        const event = result.events[0];
        expect(event.event).to.equal("CreatedCampaign");
        const args = event.args;

        // Convert the deadline to UNIX timestamp
        // const expectedStartTime = dateToUNIX(new Date(Date.now()));
        // const expectedDuration = dateToUNIX(new Date(Date.now() + 86400000));

        // expect(startTime).to.eq(startTime);
        // expect(duration).to.eq(deadline);
      });
    });

    describe("Failure", () => {
      beforeEach(async () => {
        deadline = dateToUNIX("2023-01-04");
        create = cf
          .connect(user1)
          .createCampaign(Category.EDUCATION, "", "", token(0), deadline, "");
        // result = await create.wait(1);
      });

      it("should revert if the title, description & image is empty", async () => {
        expect(create).to.be.revertedWithCustomError(cf, "CrowdFund__Required");
      });

      it("should revert if target campaign is less than 0", async () => {
        expect(create).to.be.revertedWithCustomError(cf, "CrowdFund__Required");
      });

      it("should revert if the deadline is backdated", async () => {
        expect(create).to.be.revertedWithCustomError(cf, "CrowdFund__Deadline");
      });
    });
  });

  describe("Donate to Campaign", () => {
    let deadline: any, remove: any, result: any, campaign: any;
    const hundredDays = 100 * 24 * 60 * 60;
    const increasetime = async () => {
      await network.provider.send("evm_increaseTime", [hundredDays]);
      await network.provider.send("evm_mine");
    };

    describe("Success", () => {
      const fullAmount = token(2);
      const halfAmount = token(0.5);

      beforeEach(async () => {
        deadline = dateToUNIX(new Date(Date.now() + 86400000)); // Set the deadline to tomorrow
        campaign = await cf
          .connect(user1)
          .createCampaign(
            Category.EDUCATION,
            "Test Title",
            "Test Description",
            token(1),
            deadline,
            "Image1.jpeg"
          );
        result = await campaign.wait();
        campaign = await cf
          .connect(user2)
          .donateToCampaign(0, { value: halfAmount });
        result = await campaign.wait();
      });

      it("contract should receive the donation amount", async () => {
        expect(await cf.provider.getBalance(cf.address)).to.equal(token(0.5));
      });

      it("status should remain OPEN until target is met", async () => {
        expect(await cf.getStatus(0)).to.equal(Status.OPEN);
      });

      // it("should add the donator and the amount of donation", async () => {
      //   expect(await cf.getDonators(0)).to.equal([
      //     [user2.address],
      //     [{ uint256: token(0.5) }],
      //   ]);
      // });

      it("should change the status to APPROVED if target is met", async () => {
        await cf.connect(user2).donateToCampaign(0, { value: fullAmount });
        expect(await cf.getStatus(0)).to.equal(Status.APPROVED);
      });

      it("emits a DonatedCampaign event", () => {
        const event = result.events[0];
        expect(event.event).to.equal("DonatedCampaign");

        const args = event.args;
        expect(args.id).to.equal(0);
        expect(args.donator).to.equal(user2.address);
        expect(args.value).to.equal(halfAmount);
        expect(args.timestamp).to.at.least(1);
      });
    });

    describe("Failure", () => {
      const fullAmount = token(2);
      beforeEach(async () => {
        deadline = dateToUNIX(new Date(Date.now() + 86400000)); // Set the deadline to tomorrow
        campaign = await cf
          .connect(user1)
          .createCampaign(
            Category.EDUCATION,
            "Test Title",
            "Test Description",
            token(1),
            deadline,
            "Image1.jpeg"
          );
        result = await campaign.wait();
      });

      it("should revert if the donation amount is less than zero", async () => {
        campaign = await cf.connect(user2).donateToCampaign(0, { value: 0 });

        expect(campaign).to.be.revertedWithCustomError(
          cf,
          "CrowdFund__Required"
        );
      });

      it("should revert if the campaign ID does not exist", async () => {
        expect(await cf.s_campaignExist(1)).to.equal(false);
      });

      it("should revert if the status is not OPEN", async () => {
        await cf.connect(user1).cancelCampaign(0);
        campaign = cf.connect(user2).donateToCampaign(0, { value: fullAmount });

        expect(campaign).to.be.revertedWithCustomError(
          cf,
          "CrowdFund__Required"
        );
      });
    });
  });

  describe("Cancel Campaign", () => {
    let deadline: any, remove: any, result: any, campaign: any;
    describe("Success", () => {
      const fullAmount = token(2);
      const halfAmount = token(0.5);

      beforeEach(async () => {
        deadline = dateToUNIX(new Date(Date.now() + 86400000)); // Set the deadline to tomorrow
        campaign = await cf
          .connect(user1)
          .createCampaign(
            Category.EDUCATION,
            "Test Title",
            "Test Description",
            token(1),
            deadline,
            "Image1.jpeg"
          );
        result = await campaign.wait();
      });

      it("cancel the campaign without any donations", async () => {
        await cf.connect(user1).cancelCampaign(0);

        expect(await cf.getStatus(0)).to.equal(Status.DELETED);
      });

      it("cancel the campaign and refund the donations", async () => {
        campaign = await cf
          .connect(user2)
          .donateToCampaign(0, { value: halfAmount });
        result = await campaign.wait();

        campaign = await cf.connect(user1).cancelCampaign(0);
        result = await campaign.wait();

        expect(await cf.provider.getBalance(cf.address)).to.equal(0);
        // expect(await ethers.provider.getBalance(user2.address)).to.equal(
        //   halfAmount
        // );
      });

      it("should change the status to DELETED", async () => {
        campaign = await cf
          .connect(user2)
          .donateToCampaign(0, { value: halfAmount });
        result = await campaign.wait();

        campaign = await cf.connect(user1).cancelCampaign(0);

        expect(await cf.getStatus(0)).to.equal(Status.DELETED);
      });

      it("emits a CancelCampaign event", async () => {
        campaign = await cf.connect(user1).cancelCampaign(0);
        result = await campaign.wait();

        const event = result.events[0];
        expect(event.event).to.equal("CancelCampaign");

        const args = event.args;
        expect(args.id).to.equal(0);
        expect(args.creator).to.equal(user1.address);
        expect(args.timestamp).to.at.least(1);
      });
    });

    describe("Failure", () => {
      let deadline: any, remove: any, result: any;

      beforeEach(async () => {
        deadline = dateToUNIX(new Date(Date.now() + 86400000)); // Set the deadline to tomorrow
        campaign = await cf
          .connect(user1)
          .createCampaign(
            Category.EDUCATION,
            "Test Title",
            "Test Description",
            token(1),
            deadline,
            "Image1.jpeg"
          );
        result = await campaign.wait();
      });

      it("should revert if the owner is not msg.sender", async () => {
        // const campaign = await

        expect(
          cf.connect(user2).cancelCampaign(0)
        ).to.be.revertedWithCustomError(cf, "CrowdFund__NotOwner");
      });

      it("should revert if the campaign status is not OPEN", async () => {
        await cf.connect(user1).cancelCampaign(0);

        // campaign = await cf.connect(user2).donateToCampaign(0);
        expect(
          cf.connect(user2).donateToCampaign(0)
        ).to.be.revertedWithCustomError(cf, "CrowdFund__Ended");
      });
    });
  });

  describe("Withdraw Campaign", () => {
    let deadline: any, remove: any, result: any, campaign: any;
    describe("Success", () => {
      const fullAmount = token(1);

      beforeEach(async () => {
        deadline = Math.floor(Date.now() / 1000) + 86400;

        campaign = await cf
          .connect(user1)
          .createCampaign(
            Category.EDUCATION,
            "Test Title",
            "Test Description",
            token(1),
            deadline,
            "Image1.jpeg"
          );
        result = await campaign.wait();

        campaign = await cf
          .connect(user2)
          .donateToCampaign(0, { value: fullAmount });
        result = await campaign.wait();

        // timekeeper.travel(deadline.getTime() + 1); // Move the after the deadline

        await network.provider.send("evm_increaseTime", [86400 * 2]); // Advance the block timestamp by 48 hours
        await network.provider.send("evm_mine"); // Mine a new block with the updated timestamp

        campaign = await cf.connect(user1).withdrawCampaign(0);
        result = await campaign.wait();
      });

      it("should withdraw from contract balance", async () => {
        expect(await cf.provider.getBalance(cf.address)).to.equal(0);
      });

      it("should set the campaign status to PAID", async () => {
        expect(await cf.getStatus(0)).to.equal(Status.PAID);
      });

      it("should transfer the fee amount to feeAccount", async () => {
        const expectedBalance = token(10000.1);
        const actualBalance = await cf.getContractBalance();
        const tolerance = token(0.1);
        expect(actualBalance).to.be.closeTo(expectedBalance, tolerance);
      });

      it("emits a WithdrawCampaign event", async () => {
        const event = result.events[0];
        expect(event.event).to.equal("PaidOutCampaign");

        const args = event.args;
        expect(args.id).to.equal(0);
        expect(args.creator).to.equal(user1.address);
      });
    });

    describe("Failure", () => {
      let deadline: any, remove: any, result: any;

      beforeEach(async () => {
        deadline = dateToUNIX(new Date(Date.now() + 86400000)); // Set the deadline to tomorrow
        campaign = await cf
          .connect(user1)
          .createCampaign(
            Category.EDUCATION,
            "Test Title",
            "Test Description",
            token(1),
            deadline,
            "Image1.jpeg"
          );
        result = await campaign.wait();
      });

      it("should revert if the owner is not msg.sender", async () => {
        expect(
          cf.connect(user2).cancelCampaign(0)
        ).to.be.revertedWithCustomError(cf, "CrowdFund__NotOwner");
      });

      it("should revert if the campaign status is not APPROVED", async () => {
        const halfAmount = token(0.5);
        campaign = await cf
          .connect(user2)
          .donateToCampaign(0, { value: halfAmount });
        result = await campaign.wait();

        expect(
          cf.connect(user1).withdrawCampaign(0)
        ).to.be.revertedWithCustomError(cf, "CrowdFund__Required");
      });
    });
  });

  describe("Refund Campaign", () => {
    let deadline: any, remove: any, result: any, campaign: any;
    const hundredDays = 100 * 24 * 60 * 60;
    const increasetime = async () => {
      await network.provider.send("evm_increaseTime", [hundredDays]);
      await network.provider.send("evm_mine");
    };
    describe("Success", () => {
      const fullAmount = token(1);
      const halfAmount = token(0.5);

      beforeEach(async () => {
        deadline = dateToUNIX(new Date(Date.now() + 86400000)); // Set the deadline to tomorrow
        campaign = await cf
          .connect(user1)
          .createCampaign(
            Category.EDUCATION,
            "Test Title",
            "Test Description",
            token(1),
            deadline,
            "Image1.jpeg"
          );
        result = await campaign.wait();

        campaign = await cf
          .connect(user2)
          .donateToCampaign(0, { value: halfAmount });
        result = await campaign.wait();

        campaign = await cf.connect(user1).refundCampaign(0);
        result = await campaign.wait();
      });

      it("should refund from contract balance", async () => {
        expect(await cf.provider.getBalance(cf.address)).to.equal(0);
      });

      it("should set the campaign status to REVERTED", async () => {
        expect(await cf.getStatus(0)).to.equal(Status.REVERTED);
      });

      it("should change the campaign status to REVERTED when it expires", async () => {
        increasetime();

        expect(await cf.getStatus(0)).to.equal(Status.REVERTED);
      });

      it("should set to true for each refunded campaign", async () => {
        expect(await cf.getRefundStatus(0)).to.equal(true);
      });

      it("emits a RefundCampaign event", async () => {
        const event = result.events[0];
        expect(event.event).to.equal("RefundCampaign");

        const args = event.args;
        expect(args.id).to.equal(0);
        expect(args.creator).to.equal(user1.address);
      });
    });

    describe("Failure", () => {
      let deadline: any, remove: any, result: any;

      beforeEach(async () => {
        deadline = dateToUNIX(new Date(Date.now() + 86400000)); // Set the deadline to tomorrow
        campaign = await cf
          .connect(user1)
          .createCampaign(
            Category.EDUCATION,
            "Test Title",
            "Test Description",
            token(1),
            deadline,
            "Image1.jpeg"
          );
        result = await campaign.wait();
      });

      it("should revert if the campaign status is REVERTED", async () => {
        expect(
          cf.connect(user1).refundCampaign(0)
        ).to.be.revertedWithCustomError(cf, "CrowdFund__Ended");
      });
    });
  });

  describe("Update Campaign", () => {
    let deadline: any;
    let campaign, result: any;
    const fullAmount = token(1);
    const halfAmount = token(0.5);
    const newDeadline = Math.floor(Date.now() / 1000) + 86400 * 2; // Set the deadline to 48 hours from now
    const newTarget = token(2);
    const sevenDays = 7 * 24 * 60 * 60;

    describe("Success", () => {
      beforeEach(async () => {
        deadline = dateToUNIX(new Date(Date.now())) + sevenDays; // Set the deadline to tomorrow
        campaign = await cf
          .connect(user1)
          .createCampaign(
            Category.EDUCATION,
            "Test Title",
            "Test Description",
            token(1),
            deadline,
            "Image1.jpeg"
          );
        result = await campaign.wait();

        await ethers.provider.send("evm_increaseTime", [sevenDays]);
        await ethers.provider.send("evm_mine", []);

        campaign = await cf.performUpkeep([]);
        result = await campaign.wait();
        const receipt = await cf.provider.getTransactionReceipt(
          result.transactionHash
        );
      });

      it("should update the campaign status", async () => {
        const campaignStatus = await cf.getStatus(0);

        expect(campaignStatus).to.equal(Status.REVERTED);
      });

      it("should update the campaign deadline", async () => {
        campaign = await cf
          .connect(user1)
          .updateCampaign(0, newTarget, newDeadline);
        result = await campaign.wait();

        const updatedCampaign = await cf.getCampaign(0);
        expect(updatedCampaign.deadline).to.equal(newDeadline);
        expect(updatedCampaign.target).to.equal(newTarget);
      });

      it("emits an UpdatedCampaign event", async () => {
        campaign = await cf
          .connect(user1)
          .updateCampaign(0, newTarget, newDeadline);
        result = await campaign.wait();
        const campaignId = 0;
        const event = result.events[0];
        expect(event.event).to.equal("UpdatedCampaign");

        const updatedCampaign = await cf.getCampaign(campaignId);
        expect(updatedCampaign.deadline).to.equal(newDeadline);
        expect(updatedCampaign.target).to.equal(newTarget);
      });

      it("should change the campaign status to OPEN when it is updated", async () => {
        campaign = await cf
          .connect(user1)
          .updateCampaign(0, newTarget, newDeadline);
        result = await campaign.wait();
        expect(await cf.getStatus(0)).to.equal(Status.OPEN);
      });
    });

    describe("Failure", () => {
      beforeEach(async () => {
        deadline = dateToUNIX(new Date(Date.now() + 86400000 * 2)); // Set the deadline to tomorrow
        campaign = await cf
          .connect(user1)
          .createCampaign(
            Category.EDUCATION,
            "Test Title",
            "Test Description",
            token(1),
            deadline,
            "Image1.jpeg"
          );
        result = await campaign.wait();
        // console.log(result.events[0].args);
      });

      it("should revert if not called by the campaign owner", async () => {
        await network.provider.send("evm_increaseTime", [86400 * 2]); // Advance the block timestamp by 48 hours
        await network.provider.send("evm_mine"); // Mine a new block with the updated timestamp

        expect(
          cf.connect(user2).updateCampaign(0, newTarget, newDeadline)
        ).to.be.revertedWithCustomError(cf, "CrowdFund__NotOwner");
      });

      it("should revert if the campaign status is not REVERTED", async () => {
        // Try to update the campaign, it should revert
        await expect(
          cf.connect(user1).updateCampaign(0, newTarget, newDeadline)
        ).to.be.revertedWithCustomError(cf, "CrowdFund__Required");
      });
    });
  });

  describe("Update Campaign Status", () => {
    let deadline: any;
    let campaign, result: any;
    const fullAmount = token(1);
    const halfAmount = token(0.5);
    const newDeadline = Math.floor(Date.now() / 1000) + 86400 * 2; // Set the deadline to 48 hours from now
    const newTarget = token(2);

    describe("Success", () => {
      beforeEach(async () => {
        deadline = dateToUNIX(new Date(Date.now() + 86400000)); // Set the deadline to tomorrow
        campaign = await cf
          .connect(user1)
          .createCampaign(
            Category.EDUCATION,
            "Test Title",
            "Test Description",
            token(1),
            deadline,
            "Image1.jpeg"
          );
        result = await campaign.wait();

        campaign = await cf
          .connect(user2)
          .donateToCampaign(0, { value: halfAmount });
        result = await campaign.wait();

        await network.provider.send("evm_increaseTime", [86400 * 2]); // Advance the block timestamp by 48 hours
        await network.provider.send("evm_mine"); // Mine a new block with the updated timestamp

        campaign = await cf.performUpkeep([]);
        result = await campaign.wait();
        const receipt = await cf.provider.getTransactionReceipt(
          result.transactionHash
        );
      });

      it("should change the campaign status to REVERTED when it is expired", async () => {
        expect(await cf.getStatus(0)).to.equal(Status.REVERTED);
      });
    });

    describe("Failure", () => {
      beforeEach(async () => {
        deadline = dateToUNIX(new Date(Date.now() + 86400000)); // Set the deadline to tomorrow
        campaign = await cf
          .connect(user1)
          .createCampaign(
            Category.EDUCATION,
            "Test Title",
            "Test Description",
            token(1),
            deadline,
            "Image1.jpeg"
          );
        result = await campaign.wait();
      });

      it("should revert if not called by the campaign owner", async () => {
        await network.provider.send("evm_increaseTime", [86400 * 2]); // Advance the block timestamp by 48 hours
        await network.provider.send("evm_mine"); // Mine a new block with the updated timestamp

        expect(
          cf.connect(user2).updateCampaign(0, newTarget, newDeadline)
        ).to.be.revertedWithCustomError(cf, "CrowdFund__NotOwner");
      });

      it("should revert if the campaign status is not REVERTED", async () => {
        // Try to update the campaign, it should revert
        await expect(
          cf.connect(user1).updateCampaign(0, newTarget, newDeadline)
        ).to.be.revertedWithCustomError(cf, "CrowdFund__Required");
      });
    });
  });
});
