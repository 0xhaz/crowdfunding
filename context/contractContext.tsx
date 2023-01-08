import { ethers, providers } from "ethers";
import React, { createContext, useContext } from "react";
import contractAddress from "../pages/contracts/contract-address.json";
import ContractArtifact from "../pages/contracts/CrowdFund.json";

type Contract = Record<string, any> | null;

export type ContractContextValue = {
  contract: Contract;
  provider: providers.Provider | null;
};

export type ContractProviderProps = {
  children: React.ReactNode;
};

export const ContractContext = createContext<ContractContextValue>({
  contract: null,
  provider: null,
});

export const ContractProvider = ({ children }: ContractProviderProps) => {
  const provider = getProvider();
  const contract = new ethers.Contract(
    contractAddress.CrowdFund,
    ContractArtifact.abi,
    provider
  );

  const loadNetwork = async (provider: any) => {
    const { chainId } = await provider.getNetwork();
    console.log(chainId);
    return chainId;
  };

  return (
    <ContractContext.Provider value={{ contract, provider }}>
      {children}
    </ContractContext.Provider>
  );
};

export function useContract() {
  return useContext(ContractContext);
}

const getProvider = () => {
  let provider;

  if (process.env.NEXT_PUBLIC_ENVIRONMENT === "goerli") {
    provider = new ethers.providers.InfuraProvider(
      "goerli",
      process.env.NEXT_PUBLIC_INFURA_API_KEY
    );
  } else {
    provider = new ethers.providers.JsonRpcProvider();
  }
  return provider;
  console.log(provider);
};
