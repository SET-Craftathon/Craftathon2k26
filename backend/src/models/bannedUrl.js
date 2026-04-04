const mongoose = require("mongoose");

const bannedUrlSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    domain: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    reportCount: {
      type: Number,
      default: 1,
    },


  },
  {
    timestamps: true,
  }
);


bannedUrlSchema.index({ domain: 1 });
bannedUrlSchema.index({ url: 1 });

const BannedUrl = mongoose.model("BannedUrl", bannedUrlSchema);

module.exports = BannedUrl;