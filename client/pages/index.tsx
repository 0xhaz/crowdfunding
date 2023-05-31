import type { NextPage } from "next";
import React, { useState, useEffect } from "react";
import { useAccount, useContract, useCrowdFundData } from "../context/index";

import DisplayCampaigns from "./campaigns/page";

const Index: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const { account } = useAccount();
  const { getCampaigns } = useCrowdFundData();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getCampaigns();
    setCampaigns(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (account) fetchCampaigns();
  }, [account]);

  return (
    <DisplayCampaigns
      title="All Campaigns"
      isLoading={isLoading}
      campaigns={campaigns}
    />
  );
};

export default Index;
