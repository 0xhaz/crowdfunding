import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  useCrowdFundData,
  useAccount,
  useContract,
  usePriceContract,
} from "../../context";
import Image from "next/image";
import Identicon from "react-identicons";
import { calculateBarPercentage, daysLeft } from "../../utils";
import { CountBox, CustomButton, Loader, ButtonSwitch } from "../../components";
import ExtendCampaignModal from "../../modal/ExtendCampaignModal";
import { CampaignStatus } from "../../context/crowdfundContext";
import check from "../../public/assets/check.svg";
import Link from "next/link";

type Campaign = {
  pId: number;
  title: string;
  image: string;
  deadline: string;
  target: number;
  amountCollected: number;
  owner: string;
  description: string;
  status: CampaignStatus;
  refunded: boolean;
};

type fetchUSDPriceProps = () => Promise<number> | undefined;

const CampaignDetails = () => {
  const router = useRouter();
  const state = router.query.campaignId;
  const { campaignId, transactionHash } = router.query;
  console.log(transactionHash);

  const { account, connect } = useAccount();
  const { contract } = useContract();
  const { getUSDPrice } = usePriceContract();
  const {
    getDonations,
    donate,
    removeCampaign,
    getCampaignById,
    getUserCampaigns,
    withdrawCampaign,
    refundCampaign,
  } = useCrowdFundData();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [donators, setDonators] = useState<
    { donator: string; donation: number; transactionHash: string }[]
  >([]);
  const [totalCampaign, setTotalCampaign] = useState(0);
  const [amount, setAmount] = useState("");
  const [usdPrice, setUsdPrice] = useState<number | null>(null);
  const [campaignStatus, setCampaignStatus] = useState<string>("");
  const [modalOpen, setmodalOpen] = useState(false);
  const remainingDays = daysLeft(
    new Date(parseInt(campaign?.deadline as string) || "")
  );

  const statusMap: { [key: number]: string } = {
    0: "Open",
    1: "Approved",
    2: "Expired",
    3: "Canceled",
    4: "Closed",
  };

  const fetchCampaign = async () => {
    const campaignId = await getCampaignById(state);
    setCampaign(campaignId);
    console.log("campaign: ", campaign);
    setCampaignStatus(statusMap[campaignId?.status as number]);
  };

  const fetchTotalCampaigns = async () => {
    const userCampaign = await getUserCampaigns(campaign?.owner);
    if (userCampaign) {
      setTotalCampaign(userCampaign.length);
    }
  };

  const fetchDonators = async () => {
    const data = await getDonations(state);
    setDonators(data);
  };

  const fetchUSDPrice: fetchUSDPriceProps = async (): Promise<number> => {
    try {
      const price = await getUSDPrice?.();
      setUsdPrice(price ?? 0);
      return price ?? 0;
    } catch (err) {
      console.log("error: ", err);
    }
    return 0;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ethAmount = parseFloat(e.target.value);
    const usdAmount = ethAmount * (usdPrice || 0);
    // console.log(`Approx. price in USD: ${usdAmount?.toFixed(2)}`);
    setAmount(e.target.value);
    setUsdPrice(usdAmount || 0);
  };

  const handleDonate = async () => {
    if (remainingDays === 0) return true;
    setIsLoading(true);
    const ethAmount = parseFloat(amount);
    const usdAmount = ethAmount * (usdPrice || 0);
    // console.log(`Approx. price in USD: ${usdAmount?.toFixed(2)}`);
    await donate(state, amount);
    router.push("/");
    setIsLoading(false);
  };

  const handleWithdraw = async () => {
    setIsLoading(true);
    await withdrawCampaign(state);

    router.push("/");
    setIsLoading(false);
  };

  const handleRefund = async () => {
    setIsLoading(true);
    await refundCampaign(state);
    router.push("/");
    setIsLoading(false);
  };

  const handleRemove = async () => {
    setIsLoading(true);
    await removeCampaign(state);
    router.push("/");
    setIsLoading(false);
  };

  const openModal = () => {
    setmodalOpen(true);
  };

  const closeModal = () => {
    setmodalOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!account) return;
        fetchCampaign();
        fetchDonators();
        fetchUSDPrice();
        fetchTotalCampaigns();
      } catch (err) {
        console.log("error: ", err);
      }
    };
    fetchData();
  }, [account, contract, campaign?.owner, getUSDPrice]);

  return (
    <div>
      {isLoading && <Loader />}
      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        {/* Content Area */}
        <div className="flex-1 flex-col relative">
          {account ? (
            <>
              <Image
                src={campaign?.image || ""}
                alt={campaign?.title || ""}
                width={500}
                height={500}
                className="w-full h-[410px] object-cover rounded-xl"
              />
              <h2 className="absolute inset-0 flex items-center justify-center p-4 text-[#e5e7eb] font-epilogue text-[30px] font-bold bg-[rgba(0,0,0,0.3)]">
                {campaign?.title}
              </h2>
            </>
          ) : (
            <div className="w-full h-[410px] bg-[#3a3a43]  rounded-xl flex flex-col items-center justify-center ">
              <p className="mb-10 font-epilogue font-semibold text-[18px] text-white ">
                Please connect to your wallet to view the campaign
              </p>
              <CustomButton
                btnType="button"
                title="Connect Wallet"
                styles="w-[200px] bg-[#4b5563]  hover:bg-[#8c6dfd] transition-all ease-out duration-300 "
                handleClick={connect}
              />
            </div>
          )}

          {/* Right Area */}
          <div className="relative w-full h-[5px] bg-[#3a3a43] mt-2">
            <div
              className="absolute h-full bg-[#e5e7eb]"
              style={{
                width: `${calculateBarPercentage(
                  campaign?.target as number,
                  campaign?.amountCollected as number
                )}%`,
                maxWidth: "100%",
              }}
            ></div>
          </div>
        </div>

        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <CountBox title="Days Left" value={remainingDays} />
          <CountBox
            title={`Raised of ${campaign?.target} ETH`}
            value={campaign?.amountCollected || 0}
          />
          <CountBox title="Total Backers" value={donators.length} />
        </div>
      </div>

      {/* Creator */}
      <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
        <div className="flex-[2] flex flex-col gap-[40px]">
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              Creator
            </h4>
            <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#374151] cursor-pointer">
                <Identicon
                  size={15}
                  string={campaign?.owner || ""}
                  className="w-[60%] object-contain"
                />
              </div>
              <div>
                <h4 className="font-epilogue font-semibold text-[14px] text-white break-all">
                  {campaign?.owner}
                </h4>
                <p className="mt-[14px] font-epilogue font-normal text-[12px] text-[#e5e7eb]">
                  {totalCampaign}{" "}
                  {totalCampaign > 1 ? " Campaigns" : "Campaign"}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              Story
            </h4>
            <div className="mt-[20px]">
              <p className="font-epilogue font-normal text-[16px] text-[#e5e7eb] leading-[26px] text-justify">
                {campaign?.description}
              </p>
            </div>
          </div>

          {/* Donators */}
          <div>
            <div className="flex flex-row justify-end lg:flex-row lg:justify-between ">
              <div className="w-full lg:w-3/4">
                <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
                  Donators
                </h4>
              </div>

              <div className="w-full lg:w-1/4 lg:ml-16 mt-0 lg:mt-0">
                {campaignStatus == "Canceled" && (
                  <h4 className="font-epilogue font-semibold text-[18px] m-auto text-white uppercase ">
                    Refunded
                  </h4>
                )}
              </div>
            </div>
            <div className="mt-[20px] flex flex-col gap-4">
              {donators.length > 0 ? (
                donators.map((item, i) => (
                  <div
                    key={`${item.donator}-${i}`}
                    className="flex justify-left  items-center gap-20"
                  >
                    <p className="font-epilogue font-normal text-[16px] text-[#e5e7eb] leading-[26px] break-all">
                      {i + 1}.{" "}
                      <Link
                        href={`https://goerli.etherscan.io/tx/${item.transactionHash}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="hover:underline"
                      >
                        {item.donator}
                      </Link>
                    </p>

                    <p className="font-epilogue font-normal text-[14px] lg:text-[16px] text-[#e5e7eb] leading-[26px] break-all">
                      Ξ {item.donation}
                    </p>

                    <div className="font-epilogue font-normal text-[16px] m-auto lg:pr-16 text-[#e5e7eb] leading-[26px] break-all ">
                      {campaign?.refunded ? (
                        <Image
                          src={check}
                          width={20}
                          height={20}
                          alt="refunded"
                          className="mx-auto"
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="font-epilogue font-normal text-[16px] text-[#e5e7eb] leading-[26px] text-justify">
                  No donators yet. Be the first one!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        {modalOpen && (
          <ExtendCampaignModal
            pId={campaign?.pId || 0}
            target={campaign?.target || 0}
            deadline={campaign?.deadline || ""}
            closeModal={closeModal}
          />
        )}

        <div className="flex-1">
          <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
            Fund
          </h4>
          <div className="mt-[20px] flex flex-col p-4 bg-[#1f2937] rounded-[10px]">
            <p className="font-epilogue font-medium text-[24px] leading-[30px] text-center text-[#e5e7eb]">
              Fund the Campaign
            </p>
            <div className="mt-[30px]">
              <input
                type="number"
                placeholder="Ξ 0.1"
                step="0.01"
                className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#e5e7eb] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#9ca3af] rounded-[10px]"
                value={amount}
                min="0"
                onChange={handleAmountChange}
              />
              <p className="font-epilogue font-medium text-[16px] ml-2 mt-3 text-[#9ca3af]">
                Approx. price in USD: $
                {amount && !isNaN(parseFloat(amount))
                  ? (parseFloat(amount) * (usdPrice || 0)).toFixed(2)
                  : ""}
              </p>
              <div className="my-[20px] p-4 bg-[#4b5563] rounded-[10px]">
                <h4 className="font-epilogue font-semibold text-[18px] leading-[22px] text-[#e5e7eb]">
                  Back it because you believe in it
                </h4>
                <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[#e5e7eb]">
                  Support the project for no reward, just because it speaks to
                  you
                </p>
              </div>
              <ButtonSwitch
                campaignStatus={campaignStatus}
                remainingDays={remainingDays}
                campaign={campaign}
                account={account}
                openModal={openModal}
                handleRemove={handleRemove}
                handleDonate={handleDonate}
                handleWithdraw={handleWithdraw}
                handleRefund={handleRefund}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
