import CustomButton from "./CustomButton";
import { CampaignStatus } from "../context/crowdfundContext";

type Campaign = {
  target?: number;
  amountCollected?: number;
  owner?: string;
  status: CampaignStatus;
};

type ButtonSwitchProps = {
  campaignStatus: string;
  remainingDays: string | number;
  campaign: Campaign | null;
  account?: string | null;
  openModal: () => void;
  handleRemove: () => void;
  handleDonate: () => void;
  handleWithdraw: () => void;
  handleRefund: () => void;
};

const ButtonSwitch = ({
  campaignStatus,
  remainingDays,
  campaign,
  account,
  openModal,
  handleRemove,
  handleDonate,
  handleWithdraw,
  handleRefund,
}: ButtonSwitchProps) => {
  switch (true) {
    case campaign?.status === CampaignStatus.APPROVED:
      if (campaign?.owner === account) {
        return (
          <CustomButton
            btnType="button"
            title="Withdraw Campaign"
            styles="w-full bg-[#4acd8d]"
            handleClick={handleWithdraw}
          />
        );
      } else if (campaign?.owner !== account && remainingDays === 0) {
        return (
          <CustomButton
            btnType="button"
            title="Campaign Expired"
            styles="w-full bg-[#374151]"
            handleClick={() => {}}
            disabled={true}
          />
        );
      } else {
        return (
          <CustomButton
            btnType="button"
            title="Fund Campaign"
            styles="w-full bg-[#374151] hover:bg-[#4acd8d] transition-all ease-out duration-300"
            handleClick={handleWithdraw}
          />
        );
      }

    case campaign?.status === CampaignStatus.REVERTED:
      if (campaign?.owner === account) {
        return (
          <>
            <CustomButton
              btnType="button"
              title="Extend Campaign"
              styles="w-full bg-[#374151] hover:bg-[#4acd8d] transition-all ease-out duration-300 mb-2"
              handleClick={openModal}
            />
            <CustomButton
              btnType="button"
              title="Stop & Withdraw Campaign"
              styles="w-full bg-[#f15464]"
              handleClick={handleWithdraw}
            />
          </>
        );
      } else if (campaign?.owner !== account && remainingDays === 0) {
        return (
          <CustomButton
            btnType="button"
            title="Campaign Expired"
            styles="w-full bg-[#374151]"
            handleClick={() => {}}
            disabled={true}
          />
        );
      }

    case campaign?.status === CampaignStatus.DELETED:
      return (
        <CustomButton
          btnType="button"
          title="Campaign Canceled"
          styles="w-full bg-[#374151]"
          handleClick={() => {}}
          disabled={true}
        />
      );

    case campaign?.status === CampaignStatus.PAID:
      return (
        <CustomButton
          btnType="button"
          title="Campaign Ended"
          styles="w-full bg-[#374151]"
          handleClick={() => {}}
          disabled={true}
        />
      );

    default:
      if (campaign?.owner === account) {
        return (
          <CustomButton
            btnType="button"
            title="Cancel Campaign"
            styles="w-full bg-[#f15464]"
            handleClick={handleRemove}
          />
        );
      } else {
        return (
          <CustomButton
            btnType="button"
            title="Fund Campaign"
            styles="w-full bg-[#374151] hover:bg-[#4acd8d] transition-all ease-out duration-300"
            handleClick={handleDonate}
          />
        );
      }
      break;
  }
};

export default ButtonSwitch;
