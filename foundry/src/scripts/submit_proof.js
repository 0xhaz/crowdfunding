const fs = require("fs");
const ethers = require("ethers");

const contractABI = require("./CrowdFund.json");
const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const signer = provider.getSigner();
const contract = new ethers.Contract(
  "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  contractABI.abi,
  signer
);

const proofData = JSON.parse(fs.readFileSync("../rust/proof.json"));
const proofHash = ethers.utils.keccak256(proofData.proof);

async function submitProof(campaignId) {
  const tx = await contract.donateWithProof(campaignId, proofHash, proofHash, {
    value: ethers.utils.parseEther("0.01"),
  });
  await tx.wait();
  console.log("Donation successful");
}

submitProof(0);
