import React, { useState, useEffect } from "react";
import { useAccount, useContract, useCrowdFundData } from "../context/index";

import DisplayCampaigns from "./campaigns/page";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const { account } = useAccount();
  const { contract } = useContract();
  const { getCampaigns } = useCrowdFundData();

  const fetchUserCampaigns = async () => {
    setIsLoading(true);
    const profileCampaign = await getCampaigns();
    const filteredCampaign = profileCampaign.filter(
      (campaign: any) =>
        campaign.owner === account && campaign.status !== "DELETED"
    );
    setCampaigns(filteredCampaign);
    setIsLoading(false);
  };

  useEffect(() => {
    if (account) fetchUserCampaigns();
  }, [account, contract]);

  return (
    <DisplayCampaigns
      title="My Campaigns"
      isLoading={isLoading}
      campaigns={campaigns}
    />
  );
};

export default Profile;
