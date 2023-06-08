import { ethers, providers } from "ethers";
import React, { createContext, useCallback, useContext } from "react";
import contractAddress from "../pages/contracts/AggregatorV3Interface.json";
// import ContractArtifact from "../pages/contracts/MockV3Aggregator.json";
import AggregratorV3InterfaceABI from "../utils/AggregatorV3Interface";

type Contract = ethers.Contract | null;

export type PriceContextValue = {
  priceContract: Contract;
  provider: providers.Provider | null;
  getUSDPrice: () => Promise<number> | undefined;
};

export type PriceProviderProps = {
  children: React.ReactNode;
};

export const PriceContext = createContext<PriceContextValue>({
  priceContract: null,
  provider: null,
  getUSDPrice: async () => 0,
});

export const PriceProvider = ({
  children,
}: PriceProviderProps): JSX.Element => {
  const provider = getProvider();
  const priceContract = new ethers.Contract(
    contractAddress.AggregatorV3Interface,
    AggregratorV3InterfaceABI,
    provider
  );

  const getUSDPrice = useCallback(async (): Promise<number> => {
    const [roundData, decimals] = await Promise.all([
      priceContract.latestRoundData(),
      priceContract.decimals(),
    ]);
    const price = roundData.answer.div(10 ** parseInt(decimals));
    return price;
  }, [priceContract]);

  return (
    <PriceContext.Provider value={{ priceContract, provider, getUSDPrice }}>
      {children}
    </PriceContext.Provider>
  );
};

export function usePriceContract() {
  return useContext(PriceContext);
}

const getProvider = () => {
  let provider;

  provider = new ethers.providers.InfuraProvider(
    "goerli",
    process.env.NEXT_PUBLIC_INFURA_API_KEY
  );

  return provider;
};
