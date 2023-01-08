import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { loader } from "../../public/assets";
import { FundCard } from "../../components/index";
import { useCrowdFundData } from "../../context";

type Campaign = {
  owner: string;
  title: string;
  description: string;
  image: string;
  deadline: Date;
  pId: number;
  target: string;
  amountCollected: string;
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
          campaigns.map((campaign: any) => (
            <Link
              href={{
                pathname: `/campaigns/${campaign.title}`,
                query: { ...campaign },
              }}
            >
              <FundCard key={campaign.id} {...campaign} />
            </Link>
          ))}
      </div>
    </div>
  );
};

export default DisplayCampaigns;
