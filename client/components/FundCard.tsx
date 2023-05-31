import React, { useEffect } from "react";
import Image from "next/image";
import { tagType, thirdweb, close } from "../public/assets";
import Identicon from "react-identicons";
import { daysLeft } from "../utils";
import { useState } from "react";
import { useCrowdFundData, useAccount } from "../context/index";
import { CampaignStatus } from "../context/crowdfundContext";

interface FundCardProps {
  category: string;
  title: string;
  owner: string;
  description: string;
  target: string;
  deadline: Date;
  amountCollected: string;
  image: string;
  status: CampaignStatus;
  refunded: boolean;
}

const FundCard = ({
  category,
  title,
  owner,
  description,
  target,
  deadline,
  amountCollected,
  image,
  status,
  refunded,
}: FundCardProps) => {
  const remainingDays = daysLeft(deadline);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const { getCampaigns } = useCrowdFundData();
  const [campaignOwner, setCampaignOwner] = useState("");
  const { account } = useAccount();

  const categoryMap: { [key: string]: string } = {
    0: "Charity",
    1: "Tech",
    2: "Web3",
    3: "Games",
    4: "Education",
  };

  const statusColorMap: { [key: number]: string } = {
    0: "text-[#4acd8d]",
    1: "text-[#10b981]",
    2: "text-[#d7d230]",
    3: "text-[#ef4444]",
    4: "text-[#8c6dfd]",
  };

  const statusMap: { [key: number]: string } = {
    0: "Open",
    1: "Approved",
    2: "Expired",
    3: "Canceled",
    4: "Closed",
  };

  const campaignCreator = async () => {
    const campaigns = await getCampaigns();
    const campaign = campaigns.find(
      (campaign: any) => campaign.owner === owner
    );

    setCampaignOwner(campaign.owner);
  };

  useEffect(() => {
    if (!account) return;
    if (remainingDays === 0 && status !== 4) {
      setCurrentStatus(2);
    }
    campaignCreator();
  }, [account, remainingDays]);

  return (
    <div className="sm:w-[288px] w-full rounded-[15px] bg-[#1f2937] cursor-pointer relative">
      <Image
        src={image}
        alt="fund"
        width="200"
        height="200"
        className="w-full h-[158px] object-cover rounded-[15px] "
      />

      <div className="flex flex-col p-4">
        <div className="flex flex-row items-center mb-[18px]">
          <Image
            src={tagType}
            alt="tag"
            className="w-[17px] h-[17px] object-contain"
          />
          <p className="ml-[10px] mt-[5px] font-epilogue font-medium text-[12px] text-[#e5e7eb]">
            {categoryMap[category]}
          </p>
        </div>

        <div className="block">
          <h3 className="font-epilogue font-semibold text-[16px] text-white text-left leading-[26px] truncate">
            {title}
          </h3>
          <p className="mt-[5px] font-epilogue font-normal text-[#808191] text-left leading-[18ppx] truncate">
            {description}
          </p>
        </div>

        <div className="flex justify-between flex-wrap mt-[15px] gap-2">
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#e5e7eb] leading-[22px]">
              {amountCollected}
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">
              Raised of {target}
            </p>
          </div>
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#e5e7eb] leading-[22px] text-center">
              {remainingDays}
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">
              Days left
            </p>
          </div>
        </div>

        <div className="flex items-center mt-[20px] gap-[12px]">
          <div className="w-[30px] h-[30px] rounded-full flex justify-center items-center bg-[#374151]">
            <Identicon
              size={15}
              string={campaignOwner || ""}
              className="w-1/2 h-1/2 object-contain"
            />
          </div>
          <p className="flex-1 font-epilogue font-normal text-[12px] text-[#808191] truncate">
            by{"  "}
            <span className="text-[#e5e7eb]">
              {campaignOwner?.slice(0, 6) +
                "..." +
                campaignOwner?.slice(38, 42)}
            </span>
          </p>
          <div className="flex  ">
            <p
              className={`font-epilogue font-semibold text-[12px]  text-[#e5e7eb] leading-[22px] ${
                statusColorMap[currentStatus] || ""
              }`}
            >
              {statusMap[currentStatus]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundCard;
