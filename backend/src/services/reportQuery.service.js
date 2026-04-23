const { QdrantVectorStore } = require("@langchain/qdrant");
const { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { RunnableSequence } = require("@langchain/core/runnables");
const reportPromptService = require("./reportPrompt.service");
const Report = require("../models/reportModel");

// Shared instances
const getEmbeddings = () => {
    return new GoogleGenerativeAIEmbeddings({
        model: "gemini-embedding-001",
        apiKey: process.env.GEMINI_API_KEY
    });
};

const getModel = () => {
    return new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        temperature: 0.2, // Low temperature for factual analysis
        apiKey: process.env.GEMINI_API_KEY
    });
};

const reportQueryService = {
  /**
   * Ask questions related to the embedded cybercrime incident reports.
   * @param {string} question - current user query
   * @param {string} chatHistory - formatted string of previous messages
   */
  askReportQuestion: async (question, chatHistory = "") => {
    try {
      console.log(`[RAG] Querying report insights for: "${question}"`);
      
      const embeddings = getEmbeddings();
      
      // Assumes the collection already exists
      const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
          url: process.env.QDRANT_URL || "http://localhost:6333",
          collectionName: "report_entities",
        }
      );

      // Search Qdrant for top 50 matches (to ensure aggregate queries like 'how many' catch all matches)
      const searchResults = await vectorStore.similaritySearch(question, 50);
      
      if (!searchResults || searchResults.length === 0) {
         return {
            answer: "Not enough report data available",
            sources: []
         };
      }

      console.log(`[RAG] Found ${searchResults.length} relevant vector matches.`);
      
      // Fetch corresponding MongoDB reports based on matches
      const sourceReportIds = searchResults.map(res => res.metadata.reportId).filter(Boolean);
      // Deduplicate report IDs
      const uniqueReportIds = [...new Set(sourceReportIds)];

      // Fetch fresh data from mongo
      const mongoReports = await Report.find({ reportId: { $in: uniqueReportIds } });
      
      // Build structured context
      let contextStr = mongoReports.map(report => `
Report ID: ${report.reportId || 'N/A'}
Severity: ${report.severity || 'N/A'}
Status: ${report.status || 'N/A'}
Content Type: ${report.contentType || 'N/A'}
Description: ${report.description || 'N/A'}
Evidence Count: ${report.evidenceCount || 0}
`).join("\n---\n");

      // Use the structured prompt
      const prompt = reportPromptService.createPrompt();
      const llm = getModel();
      const outputParser = new StringOutputParser();

      // Create Langchain runnable sequence
      const chain = RunnableSequence.from([
        prompt,
        llm,
        outputParser
      ]);

      const answer = await chain.invoke({
        question: question,
        chat_history: chatHistory || "No previous history.",
        context: contextStr
      });

      console.log(`[RAG] Successfully generated answer.`);
      
      return {
        answer,
        sources: uniqueReportIds.slice(0, 5) // Return only top 5 for UI references
      };
      
    } catch (error) {
      console.error(`[RAG - Query Error]:`, error);
      throw error;
    }
  }
};

module.exports = reportQueryService;
