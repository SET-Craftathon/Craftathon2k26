const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const { requireAdmin } = require("../middlewares/auth");

const reportRagController = require("../controllers/reportRag.controller");

// All chat routes protected by admin
router.get("/threads", requireAdmin, chatController.getThreads);
router.get("/threads/:threadId/messages", requireAdmin, chatController.getThreadMessages);
router.post("/ask", requireAdmin, chatController.askInThread);
router.post("/embed", requireAdmin, reportRagController.embedReports);

module.exports = router;
