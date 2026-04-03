const crypto = require('crypto');
const { analyzeText } = require('../services/report.service');

/**
 * POST /api/report
 * Receives user input, sends text to FastAPI NLP, builds enriched object.
 * Returns only a minimal acknowledgment to the frontend.
 */
const createReport = async (req, res, next) => {
  try {
    const { description, url } = req.body;

    // --- Validation ---
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'description is required and must be a non-empty string.',
      });
    }

    // --- Step 2: Generate reportId ---
    const reportId = 'rep_' + crypto.randomUUID();

    // --- Step 3 & 4: Send ONLY text to FastAPI, receive AI response ---
    const aiResult = await analyzeText(description.trim());

    // --- Step 5: Build enriched object (request-scoped, not persisted) ---
    const enrichedBody = {
      meta: {
        reportId,
        processedAt: Date.now(),
      },
      data: {
        description: description.trim(),
        ...(url && { url }),
        aiResult,
      },
    };

    // Log for development visibility (remove in production)
    console.log(`📝 Report ${reportId} enriched:`, JSON.stringify(enrichedBody, null, 2));

    // --- Step 7: Return minimal acknowledgment ---
    return res.status(200).json({
      status: 'received',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReport,
};
