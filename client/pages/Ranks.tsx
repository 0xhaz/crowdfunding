import React, { useEffect, useState } from "react";
import { CustomButton, CampaignTableCard, Loader } from "../components";
import { useCrowdFundData, useAccount } from "../context";
import { CampaignStatus } from "../context/crowdfundContext";

type Props = {};

type Campaign = {
  pId: number;
  title: string;
  image: string;
  deadline: string;
  target: number;
  amountCollected: number;
  owner: string;
  description: string;
  status: CampaignStatus;
  refunded: boolean;
};

const Ranks = (props: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]); // State to store campaigns

  const { getCampaigns } = useCrowdFundData();
  const { account } = useAccount();
  const handleDays = (days: number | null) => {
    if (days === null) {
      setSelectedDays(null);
    } else {
      setSelectedDays(days);
    }
  };

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const allCampaigns = await getCampaigns();
    setCampaigns(allCampaigns);
    setIsLoading(false);
  };

  const filterAndSortCampaigns = (): Campaign[] => {
    let filteredCampaigns = [...campaigns];

    if (selectedDays === 7) {
      // Filter campaigns that have a deadline within the last 7 days
      const currentDate = new Date();
      filteredCampaigns = filteredCampaigns.filter(campaign => {
        const campaignDeadline = new Date(campaign.deadline);
        const timeDiff = currentDate.getTime() - campaignDeadline.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff <= 7;
      });
    } else if (selectedDays === 30) {
      // Filter campaigns that have a deadline within the last 30 days
      const currentDate = new Date();
      filteredCampaigns = filteredCampaigns.filter(campaign => {
        const campaignDeadline = new Date(campaign.deadline);
        const timeDiff = currentDate.getTime() - campaignDeadline.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff <= 30;
      });
    }

    return filteredCampaigns.sort(
      (a: Campaign, b: Campaign) => b.amountCollected - a.amountCollected
    );
  };

  useEffect(() => {
    if (!account) return;
    fetchCampaigns();
  }, [account]);

  const filteredAndSortedCampaigns = filterAndSortCampaigns();

  return (
    <div className="bg-[#1f2937] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
      <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white mb-5">
        Leaderboard
      </h1>
      <div className="flex justify-between w-[500px] mx-auto">
        <CustomButton
          btnType="button"
          title="7 Days"
          handleClick={() => handleDays(7)}
          styles={`bg-[#374151] border-[1px] border-[#ffffff] ${
            selectedDays === 7
              ? "bg-[#ffffff] text-[#374151]"
              : "hover:bg-[#ffffff] hover:text-[#374151]"
          }`}
        />
        <CustomButton
          btnType="button"
          title="30 Days"
          handleClick={() => handleDays(30)}
          styles={`bg-[#374151] border-[1px] border-[#ffffff] ${
            selectedDays === 30
              ? "bg-[#ffffff] text-[#374151]"
              : "hover:bg-[#ffffff] hover:text-[#374151]"
          }`}
        />
        <CustomButton
          btnType="button"
          title="All Time"
          handleClick={() => handleDays(null)}
          styles={`bg-[#374151] border-[1px] border-[#ffffff] ${
            selectedDays === null
              ? "bg-[#ffffff] text-[#374151]"
              : "hover:bg-[#ffffff] hover:text-[#374151]"
          }`}
        />
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <CampaignTableCard campaigns={filteredAndSortedCampaigns} />
      )}
    </div>
  );
};

export default Ranks;
