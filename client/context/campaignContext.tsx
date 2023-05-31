import { createContext, useContext, useState, useCallback } from "react";

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

type CampaignContextType = {
  campaignData: Campaign | null;
  setCampaignData: (campaign: Campaign | null) => void;
};

const CampaignContext = createContext<CampaignContextType>({
  campaignData: null,
  setCampaignData: () => {},
});

export const CampaignProvider: React.FC = ({ children }: any) => {
  const [campaignData, setCampaignData] = useState<Campaign | null>(null);

  return (
    <CampaignContext.Provider value={{ campaignData, setCampaignData }}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaignData = () => useContext(CampaignContext);
