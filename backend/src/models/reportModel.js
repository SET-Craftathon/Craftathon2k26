const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ["PROBABLY PRANK", "LOW", "MEDIUM", "HIGH", "HIGHEST"],
    },
    referenceURL: {
      type: String,
      required: false,
      default: "",
    },
    description: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    aiConfidence: {
      type: String,
      required: true,
    },
    evidenceCID: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"],
      default: "PENDING",
    },
    evidenceCount: {
      type: Number,
      required: true,
    },
    evidenceURL: {
      type: [String],
      required: true,
    },
    reportCID: {
      type: String,
      required: true,
    },
    txHash: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
