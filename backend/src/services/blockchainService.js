const { ethers } = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const ABI = [
  "function createReport(uint256,string,string,string,string[],string,string)"
];

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  ABI,
  wallet
);

async function storeReportOnChain(data) {
    const tx = await contract.createReport(
      Number(data.reportId),
      data.reportCID,
      data.severity,
      data.contentType,
      data.evidenceCID,
      data.referenceURL || "",
    data.aiConfidence ? data.aiConfidence.toString() : ""
  );

  const receipt = await tx.wait();

    return receipt.hash;
}


async function updateReportStatusOnChain(reportId, status) {
  const tx = await contract.updateStatus(
    Number(reportId),
    status
  );

  const receipt = await tx.wait();
  return receipt.hash;
}

module.exports = { storeReportOnChain, updateReportStatusOnChain};