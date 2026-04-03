const fs = require("fs");
const { uploadToIPFS } = require("../services/ipfsService");

exports.handleReport = async (req, res) => {
  try {
    // files check
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No evidence files provided" });
    }

    //parallely upload in ipfs 
    const uploadPromises = req.files.map((file) =>
      uploadToIPFS(file.path)
    );

    // all cid and url stored in the results 
    const results = await Promise.all(uploadPromises);


    //now we put each cid and url in to the list
    const evidenceCID = results.map((r) => r.evidenceCID);
    const evidenceURL = results.map((r) => r.evidenceURL);

    
    req.files.forEach((file) => {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error("File delete error:", err);
      }
    });

   
    const finalData = {
      ...req.body,
      evidenceCID,
      evidenceURL,
    };

    return res.json(finalData);

  } catch (error) {
    console.error("IPFS Upload Error:", error);
    return res.status(500).json({ error: "IPFS upload failed" });
  }
};