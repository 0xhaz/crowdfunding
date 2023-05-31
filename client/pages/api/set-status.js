import { ethers } from "ethers";
import contractAddress from "../contracts/contract-address.json";
import ContractArtifact from "../contracts/CrowdFund.json";

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
};

const provider = getProvider();

export default async function handler(req, res) {
  try {
    const contract = new ethers.Contract(
      contractAddress.CrowdFund,
      ContractArtifact.abi,
      provider
    );

    const signer = provider.getSigner();

    const campaignId = 3;

    const tx = await contract.connect(signer).setCampaignStatus(campaignId, 2);
    await tx.wait();
    console.log("tx:", tx);
    console.log(`Status change for campaign ID:${campaignId}`);

    res.status(200).json({ message: "Status changed successfully" });
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: "Something went wrong" });
  }
}
