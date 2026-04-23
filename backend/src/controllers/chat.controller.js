const { ChatThread, ChatMessage } = require("../models/chatModel");
const reportQueryService = require("../services/reportQuery.service");
const { v4: uuidv4 } = require("uuid");

const chatController = {
  /**
   * GET /api/admin/chat/threads
   */
  getThreads: async (req, res) => {
    try {
      const adminId = req.admin.id;
      const threads = await ChatThread.find({ adminId }).sort({ updatedAt: -1 });
      res.status(200).json({ status: "success", data: threads });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  },

  /**
   * GET /api/admin/chat/threads/:threadId
   */
  getThreadMessages: async (req, res) => {
    try {
      const { threadId } = req.params;
      const messages = await ChatMessage.find({ threadId }).sort({ createdAt: 1 });
      res.status(200).json({ status: "success", data: messages });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  },

  /**
   * POST /api/admin/chat/ask
   */
  askInThread: async (req, res) => {
    try {
      const { question, threadId } = req.body;
      const adminId = req.admin.id;

      let currentThreadId = threadId;

      // 1. If no threadId, create a new one
      if (!currentThreadId) {
        currentThreadId = uuidv4();
        await ChatThread.create({
          threadId: currentThreadId,
          adminId,
          title: question.slice(0, 40) + (question.length > 40 ? "..." : ""),
        });
      }

      // 2. Fetch history for context
      const history = await ChatMessage.find({ threadId: currentThreadId }).sort({ createdAt: 1 });
      const formattedHistory = history
        .map((m) => `${m.role === "user" ? "Human" : "Assistant"}: ${m.content}`)
        .join("\n");

      // 3. Get AI Answer
      const aiResponse = await reportQueryService.askReportQuestion(question, formattedHistory);

      // 4. Save User Message
      await ChatMessage.create({
        threadId: currentThreadId,
        role: "user",
        content: question,
      });

      // 5. Save Assistant Message
      const assistantMsg = await ChatMessage.create({
        threadId: currentThreadId,
        role: "assistant",
        content: aiResponse.answer,
        sources: aiResponse.sources,
      });

      // 6. Update thread timestamp
      await ChatThread.findOneAndUpdate({ threadId: currentThreadId }, { updatedAt: Date.now() });

      res.status(200).json({
        status: "success",
        data: {
          threadId: currentThreadId,
          answer: aiResponse.answer,
          sources: aiResponse.sources,
          messageId: assistantMsg._id
        },
      });
    } catch (err) {
      console.error("[Chat Controller Error]:", err);
      res.status(500).json({ status: "error", message: err.message });
    }
  },
};

module.exports = chatController;
