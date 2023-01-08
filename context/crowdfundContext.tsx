import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext,
  useMemo,
} from "react";
import { ethers } from "ethers";
import { useContract, useAccount } from "./index";

export type CrowdFundDataContextValue = {
  createCampaign: (arg0: any) => void;
  getCampaigns: () => void;
  getUserCampaigns: () => void;
  donate: (arg0: number, arg1: string) => void;
  getDonations: (arg0: number) => void;
};

type Campaign = {
  owner: string;
  title: string;
  description: string;
  target: ethers.BigNumber;
  deadline: ethers.BigNumber;
  amountCollected: ethers.BigNumber;
  image: string;
};

export const CrowdFundDataContext = createContext<CrowdFundDataContextValue>(
  {} as CrowdFundDataContextValue
);

export type CrowdFundDataProviderProps = {
  children: React.ReactNode;
};

export const CrowdFundDataProvider = ({
  children,
}: CrowdFundDataProviderProps): JSX.Element => {
  const { contract } = useContract();
  const { account, accountProvider } = useAccount();

  const createCampaign = useCallback(
    async (form: any) => {
      const signer = accountProvider?.getSigner();
      const contractWithSigner = contract?.connect(signer);
      try {
        await contractWithSigner?.createCampaign(
          account,
          form.title,
          form.description,
          form.target,
          new Date(form.deadline).getTime(),
          form.image
        );
      } catch (err) {
        console.log("contract call failed", err);
      }
    },
    [accountProvider, contract]
  );

  const getCampaigns = useCallback(async () => {
    const signer = accountProvider?.getSigner();
    const contractWithSigner = contract?.connect(signer);
    const campaigns = await contractWithSigner?.getCampaigns();
    const parsedCampaigns = campaigns.map((campaign: Campaign, i: number) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(
        campaign.amountCollected.toString()
      ),
      image: campaign.image,
      pId: i,
    }));

    return parsedCampaigns;
  }, [contract, accountProvider]);

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaign = allCampaigns.filter(
      (campaign: Campaign) => campaign.owner === account
    );

    return filteredCampaign;
  };

  const donate = useCallback(
    async (pId: number, amount: string) => {
      const signer = accountProvider?.getSigner();
      const contractWithSigner = contract?.connect(signer);
      const data = await contractWithSigner?.donateToCampaign(pId, {
        value: ethers.utils.parseEther(amount),
      });
      return data;
    },
    [accountProvider, contract]
  );

  const getDonations = useCallback(async (pId: number) => {
    const signer = accountProvider?.getSigner();
    const contractWithSigner = contract?.connect(signer);
    const donations = await contractWithSigner?.getDonators(pId);
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];
    for (let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString()),
      });
    }
    return parsedDonations;
  }, []);

  return (
    <CrowdFundDataContext.Provider
      value={{
        createCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
      }}
    >
      {children}
    </CrowdFundDataContext.Provider>
  );
};

export const useCrowdFundData = () => {
  return useContext(CrowdFundDataContext);
};
