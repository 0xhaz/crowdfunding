import React, { useEffect, useState } from "react";
import { usePriceContract, useContract, useAccount } from "../context";
import Link from "next/link";

type Campaign = {
  pId: number;
  owner: string;
  title: string;
  amountCollected: number;
};

interface CampaignTableProps {
  campaigns: Campaign[];
}

const CampaignTableCard = ({ campaigns }: CampaignTableProps) => {
  const { account } = useAccount();
  const { getUSDPrice } = usePriceContract();
  const [usdPrice, setUSDPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchUSDPrices = async () => {
      try {
        const price = await getUSDPrice?.();
        setUSDPrice(price ?? 0);
        return price ?? 0;
      } catch (err) {
        console.log("error: ", err);
      }
      return 0;
    };

    fetchUSDPrices();
  }, [campaigns, getUSDPrice]);

  return (
    <div className="w-3/4 m-auto flex flex-col justify-between">
      <h1 className="font-epilogue font-bold sm:text-[18px] mt-10 text-[14px] leading-[38px] text-white mb-5">
        Campaigns
      </h1>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="font-epilogue font-bold sm:text-[20px] mt-10 text-[14px] leading-[38px] text-white mb-5">
              #
            </th>
            <th className="font-epilogue font-bold sm:text-[20px] mt-10 text-[14px] leading-[38px] text-white mb-5">
              Campaign Owner
            </th>
            <th className="font-epilogue font-bold sm:text-[20px] mt-10 text-[14px] leading-[38px] text-white mb-5">
              Campaign Name
            </th>
            <th className="font-epilogue font-bold sm:text-[20px] mt-10 text-[14px] leading-[38px] text-white mb-5">
              Amount Collected
            </th>
            <th className="font-epilogue font-bold sm:text-[20px] mt-10 text-[14px] leading-[38px] text-white mb-5">
              Amount Collected (USD)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {campaigns.map((campaign: Campaign, index: number) => {
            const price = usdPrice
              ? (campaign.amountCollected * usdPrice).toFixed(2)
              : "Loading...";
            return (
              <tr
                key={index}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-800 dark:text-gray-200">
                  {campaign.owner?.slice(0, 6) +
                    "..." +
                    campaign.owner?.slice(38, 42)}
                </td>
                <Link
                  key={campaign.pId}
                  href={{
                    pathname: `/campaigns/${campaign.pId}`,
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 hover:text-[#f9f234]">
                    {campaign.title}
                  </td>
                </Link>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-800 dark:text-gray-200">
                  {campaign.amountCollected}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-800 dark:text-gray-200">
                  {price !== undefined ? price : "Loading..."}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignTableCard;
