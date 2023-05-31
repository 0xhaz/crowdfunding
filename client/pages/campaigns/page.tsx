import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { loader } from "../../public/assets";
import { FundCard } from "../../components/index";
import { useCrowdFundData } from "../../context";
import { CampaignStatus } from "../../context/crowdfundContext";

type Campaign = {
  category: string;
  owner: string;
  title: string;
  description: string;
  image: string;
  deadline: Date;
  pId: number;
  target: string;
  amountCollected: string;
  status: CampaignStatus;
  refunded: boolean;
};

interface DisplayCampaignsProps {
  title: string;
  isLoading: boolean;
  campaigns: Campaign[];
}

const DisplayCampaigns = ({
  title,
  isLoading,
  campaigns,
}: DisplayCampaignsProps) => {
  const router = useRouter();

  return (
    <div>
      <h1 className="font-epilogue font-semibold text-[18px] text-white text-left">
        {title} ({campaigns.length})
      </h1>
      <div className="flex flex-wrap mt-[20px] gap-[26px]">
        {isLoading && (
          <Image
            src={loader}
            alt="loader"
            className="w-[100px] h-[100px] object-contain"
          />
        )}

        {!isLoading && campaigns.length === 0 && (
          <p className="font-epilogue font-semibold text-[14px] leading-[30px] text-[#818183]">
            You have not created any campaigns yet
          </p>
        )}

        {!isLoading &&
          campaigns.length > 0 &&
          campaigns.map((campaign: Campaign) => (
            <Link
              key={campaign.pId}
              href={{
                pathname: `/campaigns/${campaign.pId}`,
              }}
            >
              <FundCard {...campaign} />
            </Link>
          ))}
      </div>
    </div>
  );
};

export default DisplayCampaigns;
