const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

// 📦 Upload File (unchanged)
async function uploadToIPFS(filePathOrBuffer, originalname = "evidence.jpg") {
  const data = new FormData();
  if (Buffer.isBuffer(filePathOrBuffer)) {
    data.append("file", filePathOrBuffer, { filename: originalname });
  } else {
    data.append("file", fs.createReadStream(filePathOrBuffer));
  }

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    data,
    {
      headers: {
        ...data.getHeaders(),
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    }
  );

  const cid = res.data.IpfsHash;

  return {
    evidenceCID: cid,
    evidenceURL: `https://ipfs.io/ipfs/${cid}`,
  };
}

// 🧠 NEW: Upload JSON (DO NOT REMOVE ABOVE FUNCTION)
async function uploadJSONToIPFS(jsonData) {
  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    jsonData,
    {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    }
  );

  const cid = res.data.IpfsHash;

  return {
    reportCID: cid,
  };
}


module.exports = {
  uploadToIPFS,
  uploadJSONToIPFS,
};