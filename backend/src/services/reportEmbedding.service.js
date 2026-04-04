const { QdrantVectorStore } = require("@langchain/qdrant");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const Report = require("../models/reportModel"); // Ensure this path points to the real Report model

const getEmbeddings = () => {
  return new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
    apiKey: process.env.GEMINI_API_KEY // Ensures it picks up the key
  });
};

const reportEmbeddingService = {
  /**
   * Embed Reports from MongoDB to Qdrant
   * @param {Object} filter - Optional mongoose filter to limit which reports to embed (e.g. { status: "PENDING" })
   */
  embedReports: async (filter = {}) => {
    try {
      console.log(`[RAG] Fetching reports from DB with filter:`, filter);
      const reports = await Report.find(filter);
      
      if (!reports.length) {
        console.log(`[RAG] No reports found to embed.`);
        return { success: true, message: 'No reports to embed', count: 0 };
      }

      console.log(`[RAG] Found ${reports.length} reports. Formatting for embeddings...`);
      
      const documents = reports.map(report => {
        // Format based on the prompt instructions
        const text = `Report ID: ${report.reportId || 'N/A'}
Severity: ${report.severity || 'N/A'}
Status: ${report.status || 'N/A'}
Content Type: ${report.contentType || 'N/A'}

Description:
${report.description || 'N/A'}

Evidence Count: ${report.evidenceCount || 0}
AI Confidence: ${report.aiConfidence || 'N/A'}

Reference URL: ${report.referenceURL || 'N/A'}`;

        return {
          pageContent: text,
          metadata: {
            mongoId: report._id ? report._id.toString() : uuidv4(),
            reportId: report.reportId || '',
            severity: String(report.severity) || '',
            status: String(report.status) || '',
            contentType: String(report.contentType) || '',
            // Generate a unique ID for Qdrant payload to prevent collisions
            vectorId: uuidv4()
          }
        };
      });

      console.log(`[RAG] Initializing Vector Store (Qdrant)...`);
      const embeddings = getEmbeddings();
      
      // Store in Qdrant collection "report_entities"
      await QdrantVectorStore.fromTexts(
        documents.map(d => d.pageContent),
        documents.map(d => d.metadata),
        embeddings,
        {
          url: process.env.QDRANT_URL || "http://localhost:6333",
          collectionName: "report_entities",
        }
      );

      console.log(`[RAG] Successfully embedded ${reports.length} reports.`);
      return { success: true, count: reports.length, message: "Embedding complete" };
    } catch (error) {
      console.error(`[RAG - Embed Error]:`, error);
      throw error;
    }
  }
};

module.exports = reportEmbeddingService;
