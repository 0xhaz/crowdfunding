import React, { useEffect, useState } from "react";
import { Sidebar, Navbar } from "./";
import { useCrowdFundData, useAccount } from "../context";
import { CampaignStatus } from "../context/crowdfundContext";

interface LayoutProps {
  children?: React.ReactNode;
}

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

const Layout = ({ children }: LayoutProps) => {
  const { getCampaigns } = useCrowdFundData();
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { account } = useAccount();

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  const filterCampaigns = async () => {
    const allCampaigns = await getCampaigns();
    const filterCampaigns = await allCampaigns.filter((campaign: Campaign) =>
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCampaigns(filterCampaigns);
  };

  useEffect(() => {
    if (!account) return;
    filterCampaigns();
  }, [searchQuery, getCampaigns]);
  return (
    <div className="relative sm:-8 p-4 bg-[#111827] min-h-screen flex flex-row ">
      <div className="sm:flex hidden mr-10 relative">
        <Sidebar />
      </div>
      <div className="flex-1 max-sm:w-full max-w-[1280px] mx-auto sm:pr-5">
        <Navbar onSearchQueryChange={handleSearchQueryChange} />
        <main>
          {React.cloneElement(children as React.ReactElement, {
            filteredCampaigns: filteredCampaigns,
          })}
        </main>
      </div>
    </div>
  );
};

export default Layout;
