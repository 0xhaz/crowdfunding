import React, { useState, useEffect } from "react";
import { useAccount, useContract, useCrowdFundData } from "../context/index";

import DisplayCampaigns from "./campaigns/index";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const { account } = useAccount();
  const { contract } = useContract();
  const { getUserCampaigns } = useCrowdFundData();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    let data: any = await getUserCampaigns();
    setCampaigns(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (account) fetchCampaigns();
  }, [account, contract]);

  return (
    <DisplayCampaigns
      title="All Campaigns"
      isLoading={isLoading}
      campaigns={campaigns}
    />
  );
};

export default Profile;
