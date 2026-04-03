const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

async function uploadToIPFS(filePath) {
  const data = new FormData();
  data.append("file", fs.createReadStream(filePath));

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

module.exports = { uploadToIPFS };