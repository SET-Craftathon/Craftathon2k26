const fs = require("fs");
const { uploadToIPFS, uploadJSONToIPFS } = require("../services/ipfsService");
const { storeReportOnChain } = require("../services/blockchainService");

exports.handleReport = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No evidence files provided" });
        }

        // 🔥 Upload files
        const uploadPromises = req.files.map((file) =>
            uploadToIPFS(file.path)
        );

        const results = await Promise.all(uploadPromises);

        const evidenceCID = results.map((r) => r.evidenceCID);
        const evidenceURL = results.map((r) => r.evidenceURL);

        // 🧹 Cleanup
        req.files.forEach((file) => {
            try {
                fs.unlinkSync(file.path);
            } catch (err) {
                console.error("File delete error:", err);
            }
        });

        // 🧠 Create JSON
        const reportJSON = {
            ...req.body,
            reportId: Number(req.body.reportId),
            evidenceCID,
            status: "PENDING",
            evidenceCount: evidenceCID.length,
            createdAt: req.body.createdAt || new Date().toISOString(),
        };

        // 🔥 Upload JSON
        const { reportCID } = await uploadJSONToIPFS(reportJSON);

        const finalData = {
            ...reportJSON,
            evidenceURL,
            reportCID,
        };

        // 🔗 Blockchain (safe)
        let txHash = null;
        try {
            txHash = await storeReportOnChain(finalData);
        } catch (err) {
            console.error("Blockchain Error:", err);
        }

        const finalResponse = {
            ...finalData,
            txHash,
        };

        return res.json(finalResponse);

    } catch (error) {
        console.error("Full Flow Error:", error);
        return res.status(500).json({ error: "Report processing failed" });
    }
};