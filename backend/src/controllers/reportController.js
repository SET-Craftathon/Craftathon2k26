const fs = require("fs");
const { uploadToIPFS, uploadJSONToIPFS } = require("../services/ipfsService");
const { storeReportOnChain } = require("../services/blockchainService");
const Report = require("../models/reportModel");

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



        // 🧠 Create JSON
        const reportJSON = {
            ...req.body,
            reportId: req.body.reportId,
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

        // 💾 Save to MongoDB
        const savedReport = await Report.create({
            reportId: String(finalResponse.reportId),
            severity: finalResponse.severity,
            referenceURL: finalResponse.referenceURL || "",
            description: finalResponse.discription || finalResponse.description || "",
            contentType: finalResponse.contentType,
            aiConfidence: finalResponse.aiConfidence,
            evidenceCID: finalResponse.evidenceCID,
            status: finalResponse.status,
            evidenceCount: finalResponse.evidenceCount,
            evidenceURL: finalResponse.evidenceURL,
            reportCID: finalResponse.reportCID,
            txHash: finalResponse.txHash,
        });

        return res.json(savedReport);

    } catch (error) {
        console.error("Full Flow Error:", error);
        return res.status(500).json({ error: "Report processing failed" });
    } finally {
        // 🧹 Cleanup files always, even on error
        if (req.files) {
            req.files.forEach((file) => {
                try {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                } catch (err) {
                    console.error("File delete error:", err);
                }
            });
        }
    }
};