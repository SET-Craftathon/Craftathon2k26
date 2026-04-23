const reportEmbeddingService = require('../services/reportEmbedding.service');
const reportQueryService = require('../services/reportQuery.service');

const reportRagController = {
    /**
     * POST /embed-reports
     * Triggers embedding of reports to Qdrant Vector Store
     */
    embedReports: async (req, res) => {
        try {
            // Optional: Support filtering passed via body or query params
            // e.g. { severity: "HIGH" }
            const filter = req.body || {};
            
            const result = await reportEmbeddingService.embedReports(filter);
            
            return res.status(200).json({
                success: true,
                message: result.message,
                count: result.count
            });
        } catch (error) {
            console.error('[RAG Controller] Embed Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to embed reports',
                error: error.message
            });
        }
    },

    /**
     * POST /ask-reports
     * Retrieves relevant context and asks AI to analyze
     */
    askReports: async (req, res) => {
        try {
            const { question } = req.body;
            
            if (!question) {
                return res.status(400).json({
                    success: false,
                    message: "A 'question' must be provided in the request body."
                });
            }

            const response = await reportQueryService.askReportQuestion(question);
            
            return res.status(200).json({
                success: true,
                answer: response.answer,
                sources: response.sources
            });
        } catch (error) {
            console.error('[RAG Controller] Query Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to process report question',
                error: error.message
            });
        }
    }
};

module.exports = reportRagController;
