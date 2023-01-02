import { deployments, ethers, network } from "hardhat";
import { expect } from "chai";
import { CrowdFund, CrowdFund__factory } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

interface TestUser {
  user1: string;
  user2: string;
  deployer: string;
  feeAccount: string;
}

const token = (n: number) => {
  return ethers.utils.parseEther(n.toString());
};

describe("CrowdFund", () => {
  let cf: CrowdFund;
  // @ts-ignore
  let user1,
    user2,
    deployer,
    feeAccount: SignerWithAddress,
    account: SignerWithAddress[];

  const feePercent = 10;

  beforeEach(async () => {
    await deployments.fixture(["all"]);
    account = await ethers.getSigners();
    deployer = account[0];
    user1 = account[1];
    user2 = account[2];
    feeAccount = account[3];

    const cfFactory = (await ethers.getContractFactory(
      "CrowdFund"
    )) as CrowdFund__factory;

    cf = await cfFactory.deploy(feeAccount.address, feePercent);
  });

  describe("Deployment", () => {
    it("tracks the fee account", async () => {
      expect(await cf.i_feeAccount()).to.equal(feeAccount.address);
    });
    it("tracks the fee percent", async () => {
      expect(await cf.i_feePercent()).to.equal(feePercent);
    });
  });

  describe("Create Campaign", () => {
    let create: any, result: any, deadline: any;
    describe("Success", () => {
      beforeEach(async () => {
        deadline = await time.latest();
        create = await cf
          .connect(user1)
          .createCampaign(
            user1.address,
            "Test Title",
            "Test Description",
            token(1),
            deadline,
            "Image1.jpeg"
          );
        result = await create.wait();
      });

      it("create a new campaign", async () => {
        const campaignId = await cf.numberOfCampaigns();
        expect(campaignId).to.equal(1);
      });

      it("emits a create campaign event", () => {
        const event = result.events[0];
        expect(event.event).to.equal("CreatedCampaign");

        const args = event.args;
        expect(args.id).to.equal(1);
        expect(args.creator).to.equal(user1.address);
        expect(args.target).to.equal(token(1));
        expect(args.deadline).to.at.least(1);
      });
    });

    describe("Failure", () => {
      const hundredDays = 100 * 24 * 60 * 60;
      const increasetime = async () => {
        await network.provider.send("evm_increaseTime", [hundredDays]);
        await network.provider.send("evm_mine");
      };

      beforeEach(async () => {});

      it("should revert if the campaign deadline is backdated", async () => {
        deadline = await network.provider.send("evm_increaseTime", [
          hundredDays,
        ]);
        await network.provider.send("evm_mine");
        expect(
          await cf
            .connect(user1)
            .createCampaign(
              user1.address,
              "Test Title",
              "Test Description",
              token(1),
              deadline,
              "Image1.jpeg"
            )
        ).to.be.revertedWithCustomError;
      });

      it("should revert if the deadline is more than 90 days", async () => {
        await increasetime();
        deadline = await time.latest();
        expect(
          await cf
            .connect(user1)
            .createCampaign(
              user1.address,
              "Test Title",
              "Test Description",
              token(1),
              deadline,
              "Image1.jpeg"
            )
        ).to.be.revertedWithCustomError;
      });
    });
  });

  describe("Cancel Campaign", () => {
    describe("Success", () => {
      let deadline: any, remove: any, result: any;
      const hundredDays = 100 * 24 * 60 * 60;
      const increasetime = async () => {
        await network.provider.send("evm_increaseTime", [hundredDays]);
        await network.provider.send("evm_mine");
      };
      beforeEach(async () => {
        await increasetime();
        deadline = await time.latest();
        await cf
          .connect(user1)
          .createCampaign(
            user1.address,
            "Test Title",
            "Test Description",
            token(1),
            deadline,
            "Image1.jpeg"
          );
        remove = await cf.connect(user1).cancelCampaign(1, user1.address);
        result = await remove.wait();
      });

      // it("should delete the campaign id", async () => {
      //   expect(await cf.connect(user1).getCampaigns()).to.equal({
      //     owner: "0x0000000000000000000000000000000000000000",
      //     title: "",
      //     description: " ",
      //     target: 0,
      //     deadline: 0,
      //     amountCollected: 0,
      //     image: " ",
      //   });
      // });

      it("should emit a Cancel event", async () => {
        const event = result.events[0];
        expect(event.event).to.equal("CancelCampaign");

        const args = event.args;
        expect(args.id).to.equal(1);
      });
    });

    describe("Failure", () => {
      let deadline: any, remove: any, result: any;
      const hundredDays = 100 * 24 * 60 * 60;
      const increasetime = async () => {
        await network.provider.send("evm_increaseTime", [hundredDays]);
        await network.provider.send("evm_mine");
      };
      beforeEach(async () => {
        await increasetime();
        deadline = await time.latest();
        await cf
          .connect(user1)
          .createCampaign(
            user1.address,
            "Test Title",
            "Test Description",
            token(1),
            deadline,
            "Image1.jpeg"
          );
      });

      it("should revert if the owner is not msg.sender", async () => {
        result = await cf.connect(user2).cancelCampaign(1, user2.address);
        expect(result).to.be.revertedWithCustomError;
      });

      it("should revert if the campaign is already exceeded more than 90 days", async () => {
        await increasetime();
        deadline = await time.latest();
        expect(
          await cf
            .connect(user1)
            .createCampaign(
              user1.address,
              "Test Title",
              "Test Description",
              token(1),
              deadline,
              "Image1.jpeg"
            )
        ).to.be.revertedWithCustomError;
      });
    });
  });

  describe("Donate to Campaign", () => {
    describe("Success", () => {
      let deadline: any, remove: any, result: any;
      const hundredDays = 100 * 24 * 60 * 60;
      const increasetime = async () => {
        await network.provider.send("evm_increaseTime", [hundredDays]);
        await network.provider.send("evm_mine");
      };
      beforeEach(async () => {
        await increasetime();
        deadline = await time.latest();
        await cf
          .connect(user1)
          .createCampaign(
            user1.address,
            "Test Title",
            "Test Description",
            token(1),
            deadline,
            "Image1.jpeg"
          );
      });
      it("should send the payment to msg.sender", async () => {});
      it("should deduct the payment based on Fee Amount", async () => {});
    });
  });
});
