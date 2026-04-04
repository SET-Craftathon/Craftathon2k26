const { uploadToIPFS, uploadJSONToIPFS } = require("../services/ipfsService");
const { storeReportOnChain } = require("../services/blockchainService");
const { analyzeContent } = require("../services/report.service");
const Report = require("../models/reportModel");

exports.handleReport = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No evidence files provided" });
        }

        const uploadPromises = req.files.map(async (file) => {
            let aiResult;
            if (req.body.aiConfidence && req.body.severity) {
                // Use already processed AI output
                aiResult = {
                    description: req.body.description || "",
                    contentType: req.body.contentType || "unknown",
                    aiConfidence: req.body.aiConfidence,
                    severity: req.body.severity,
                    file: undefined // rely on file.buffer below
                };
            } else {
                // Run AI analysis
                aiResult = await analyzeContent(
                    req.body.description || "",
                    file.buffer,
                    file.originalname,
                );
            }

            const imageBuffer = aiResult.file;
            delete aiResult.file;

            const { evidenceCID, evidenceURL } = await uploadToIPFS(imageBuffer ?? file.buffer, file.originalname);

            return { evidenceCID, evidenceURL, aiResult };
        });

        const results = await Promise.all(uploadPromises);

        const evidenceCID = results.map((r) => r.evidenceCID);
        const evidenceURL = results.map((r) => r.evidenceURL);

        // take AI result from first file
        const aiResult = results[0].aiResult;

        const reportJSON = {
            ...req.body,
            reportId: req.body.reportId,
            description: aiResult.description,
            contentType: aiResult.contentType,
            aiConfidence: aiResult.aiConfidence,
            severity: aiResult.severity,
            evidenceCID,
            evidenceURL,
            status: "PENDING",
            evidenceCount: evidenceCID.length,
            createdAt: req.body.createdAt || new Date().toISOString(),
        };

        const { reportCID } = await uploadJSONToIPFS(reportJSON);

        const finalData = { ...reportJSON, evidenceURL, reportCID };

        let txHash = null;
        try {
            txHash = await storeReportOnChain(finalData);
        } catch (err) {
            console.error("Blockchain Error:", err);
        }

        const finalResponse = { ...finalData, txHash };

        const savedReport = await Report.create({
            reportId: String(finalResponse.reportId),
            severity: finalResponse.severity,
            referenceURL: finalResponse.referenceURL || "",
            description: finalResponse.description || "",
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
    }
};