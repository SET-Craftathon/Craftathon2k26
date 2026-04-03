const fs = require("fs");
const { uploadToIPFS, uploadJSONToIPFS } = require("../services/ipfsService");

exports.handleReport = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No evidence files provided" });
    }


    const uploadPromises = req.files.map((file) =>
      uploadToIPFS(file.path)
    );

    const results = await Promise.all(uploadPromises);

    const evidenceCID = results.map((r) => r.evidenceCID);
    const evidenceURL = results.map((r) => r.evidenceURL);


    req.files.forEach((file) => {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error("File delete error:", err);
      }
    });

    const reportJSON = {
      ...req.body,
      evidenceCID,
      status: "PENDING",
      evidenceCount: evidenceCID.length,
      createdAt: req.body.createdAt || new Date().toISOString(),
    };

    
    const { reportCID } = await uploadJSONToIPFS(reportJSON);

    
    const finalData = {
      ...reportJSON,
      evidenceURL,
      reportCID,
    };

    return res.json(finalData);

  } catch (error) {
    console.error("IPFS Upload Error:", error);
    return res.status(500).json({ error: "IPFS upload failed" });
  }
};