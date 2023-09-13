import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext,
  useMemo,
} from "react";
import { BigNumber, ethers } from "ethers";
import { useContract, useAccount } from "./index";
import { useRouter } from "next/router";

type Form = {
  category: number;
  title: string;
  description: string;
  target: ethers.BigNumber;
  deadline: string | number | Date;
  image: string;
};

type Campaign = {
  category: number;
  owner: string;
  title: string;
  description: string;
  target: ethers.BigNumber;
  deadline: ethers.BigNumber;
  amountCollected: ethers.BigNumber;
  image: string;
  pId: number;
  status: CampaignStatus;
  refunded: boolean;
};

type updateForm = {
  pId: number;
  target: ethers.BigNumber;
  deadline: string | number | Date;
};

export enum CampaignStatus {
  OPEN = 0,
  APPROVED = 1,
  REVERTED = 2,
  DELETED = 3,
  PAID = 4,
}

interface CrowdFundContextProps {
  createCampaign: (form: Form) => Promise<void>;
  getCampaigns: Function;
  getUserCampaigns: Function;
  getCampaignById: Function;
  removeCampaign: Function;
  donate: Function;
  getDonations: Function;
  withdrawCampaign: Function;
  updateCampaign: Function;
  refundCampaign: Function;
}

export const CrowdFundDataContext = createContext<CrowdFundContextProps>(
  {} as CrowdFundContextProps
);

export type CrowdFundDataProviderProps = {
  children: JSX.Element;
};

export const CrowdFundDataProvider = ({
  children,
}: CrowdFundDataProviderProps): JSX.Element => {
  const { contract } = useContract();
  const { account, accountProvider } = useAccount();
  const router = useRouter();

  const createCampaign = useCallback(
    async (form: Form) => {
      const signer = accountProvider?.getSigner();
      const contractWithSigner = contract?.connect(signer);
      try {
        await contractWithSigner?.createCampaign(
          form.category,
          form.title,
          form.description,
          form.target,
          new Date(form.deadline).getTime(),
          form.image
        );
      } catch (err) {
        console.log("contract createCampaign call failed", err);
      }
    },
    [accountProvider, contract]
  );

  const getCampaigns = useCallback(async () => {
    const signer = accountProvider?.getSigner();
    const contractWithSigner = contract?.connect(signer);
    const campaigns = await contractWithSigner?.getCampaigns();
    const parsedCampaigns = campaigns.map((campaign: Campaign, i: number) => {
      const target = ethers.utils.formatEther(campaign.target);
      const amountCollected = ethers.utils.formatEther(
        campaign.amountCollected
      );

      return {
        category: campaign.category,
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        target: parseFloat(target), // Convert to number
        deadline: campaign.deadline.toNumber(),
        amountCollected: parseFloat(amountCollected), // Convert to number
        image: campaign.image,
        pId: i,
        status: campaign.status,
        refunded: campaign.refunded,
      };
    });

    return parsedCampaigns;
  }, [contract, account]);

  const getUserCampaigns = useCallback(
    async (account: string) => {
      try {
        const allCampaigns = await getCampaigns();
        const filteredCampaign = allCampaigns?.filter((campaign: Campaign) => {
          return campaign?.owner === account;
        });

        return filteredCampaign;
      } catch (error) {
        console.error(error);
      }
    },

    [account, getCampaigns]
  );

  const getCampaignById = useCallback(
    async (pId: number) => {
      // return campaign details by id
      const allCampaigns = await getCampaigns();
      const campaign = allCampaigns[pId];
      return campaign;
    },
    [contract, account]
  );

  const removeCampaign = useCallback(
    async (pId: number) => {
      const signer = accountProvider?.getSigner();
      const contractWithSigner = contract?.connect(signer);

      try {
        const removeId = await contractWithSigner?.cancelCampaign(pId);
        return removeId;
      } catch (error) {
        console.error(error);
      }
    },
    [contract, accountProvider]
  );

  const donate = useCallback(
    async (pId: number, amount: string) => {
      try {
        const signer = accountProvider?.getSigner();
        const parsedAmount = ethers.utils.parseEther(amount);
        console.log(parsedAmount.toString());
        const transaction = await contract
          ?.connect(signer)
          .donateToCampaign(pId, {
            value: parsedAmount.toString(),
          });

        const transactionHash = transaction?.hash;
        if (transactionHash) {
          fetchTransactionDetails(transactionHash);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [accountProvider, contract]
  );

  const fetchTransactionDetails = useCallback(
    async (transactionHash: string) => {
      try {
        const provider = accountProvider?.getSigner().provider;
        const transaction = await provider?.getTransaction(transactionHash);
        console.log("Transaction: ", transaction);

        // extract campaignId from the url
        const { campaignId } = router.query;

        // navigate to the details page
        router.push({
          pathname: `/campaigns/${campaignId}`,
          query: { transactionHash },
        });
      } catch (error) {
        console.error(error);
      }
    },
    [accountProvider, router]
  );

  const getDonations = useCallback(
    async (pId: number) => {
      const signer = accountProvider?.getSigner();
      const donations = await contract?.connect(signer).getDonators(pId);

      const numberOfDonations = donations[0].length;

      const parsedDonations = [];
      for (let i = 0; i < numberOfDonations; i++) {
        parsedDonations.push({
          donator: donations[0][i],
          donation: ethers.utils.formatEther(donations[1][i].toString()),
        });
      }
      return parsedDonations;
    },
    [accountProvider, contract]
  );

  const withdrawCampaign = useCallback(
    async (pId: number) => {
      const signer = accountProvider?.getSigner();
      const contractWithSigner = contract?.connect(signer);

      try {
        const withdrawId = await contractWithSigner?.withdrawCampaign(pId);
        return withdrawId;
      } catch (error) {
        console.error(error);
      }
    },
    [contract, accountProvider]
  );

  const updateCampaign = useCallback(
    async (updateForm: updateForm) => {
      const signer = accountProvider?.getSigner();
      const contractWithSigner = contract?.connect(signer);

      try {
        await contractWithSigner?.updateCampaign(
          updateForm.pId,
          updateForm.target,
          new Date(updateForm.deadline).getTime()
        );
      } catch (error) {
        console.error(error);
      }
    },
    [contract, accountProvider]
  );

  const refundCampaign = useCallback(
    async (pId: number) => {
      const signer = accountProvider?.getSigner();
      const contractWithSigner = contract?.connect(signer);

      try {
        return await contractWithSigner?.refundCampaign(pId);
      } catch (error) {
        console.error(error);
      }
    },
    [contract, accountProvider]
  );

  return (
    <CrowdFundDataContext.Provider
      value={{
        createCampaign,
        getCampaigns,
        getUserCampaigns,
        getCampaignById,
        removeCampaign,
        donate,
        getDonations,
        withdrawCampaign,
        updateCampaign,
        refundCampaign,
      }}
    >
      {children}
    </CrowdFundDataContext.Provider>
  );
};

export const useCrowdFundData = () => {
  return useContext(CrowdFundDataContext);
};
