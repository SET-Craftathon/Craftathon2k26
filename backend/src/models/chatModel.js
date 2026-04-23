const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  threadId: {
    type: String,
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sources: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const chatThreadSchema = new mongoose.Schema({
  threadId: {
    type: String,
    required: true,
    unique: true,
  },
  adminId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: "New Conversation",
  },
}, { timestamps: true });

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
const ChatThread = mongoose.model("ChatThread", chatThreadSchema);

module.exports = { ChatMessage, ChatThread };
