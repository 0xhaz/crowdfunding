import type { NextPage } from "next";
import React, { useState, useEffect } from "react";
import { useAccount, useCrowdFundData } from "../context/index";
import { CampaignStatus } from "../context/crowdfundContext";
import DisplayCampaigns from "./campaigns/page";

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

type IndexProps = {
  filteredCampaigns: Campaign[];
};

const Index: NextPage<IndexProps> = ({ filteredCampaigns }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState(filteredCampaigns || []);
  const { account } = useAccount();
  const { getCampaigns } = useCrowdFundData();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getCampaigns();
    setCampaigns(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (account) {
      if (filteredCampaigns.length > 0) {
        setCampaigns(filteredCampaigns);
      } else {
        fetchCampaigns();
      }
    }
  }, [account, filteredCampaigns]);

  return (
    <DisplayCampaigns
      title="All Campaigns"
      isLoading={isLoading}
      campaigns={campaigns}
    />
  );
};

export default Index;
