const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
const { analyzeContent } = require('../services/report.service');

/**
 * POST /api/report
 * Accepts: description (text), url (text), image (optional file)
 * Sends text + image to FastAPI /classify as multipart/form-data.
 * Returns the AI result + reportId to the caller.
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

    // --- Step 1: Generate numeric reportId ---
    const reportId = Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    // --- Step 2: Read image buffer from multer (req.files) if provided ---
    let firstImageBuffer = null;
    let firstImageOriginalName = null;

    if (req.files && req.files.length > 0) {
      firstImageBuffer = req.files[0].buffer;
      firstImageOriginalName = req.files[0].originalname;
      console.log(`🖼️ Images attached: ${req.files.length} files`);
    }

    // --- Step 3: Build text payload (description + optional url) ---
    const textPayload = [description.trim(), url].filter(Boolean).join('\n');

    // --- Step 4: Send to FastAPI /classify as multipart/form-data ---
    console.log(`🤖 Sending to FastAPI → text (${textPayload.length} chars), image: ${firstImageOriginalName || 'none'}`);
    const aiResult = await analyzeContent(textPayload, firstImageBuffer, firstImageOriginalName);
    console.log('✅ FastAPI AI result:', JSON.stringify(aiResult, null, 2));

    // --- Step 5: Build enriched response object ---
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

    const fileBuffer = aiResult.file;
    delete aiResult.file;

    console.log(`📝 Report ${reportId} enriched:`, JSON.stringify(enrichedBody, null, 2));

    // --- Step 6: Automatically Feed to the Blockchain Evidence Route ---
    const form = new FormData();
    form.append('reportId', reportId);
    form.append('severity', aiResult.severity || 'LOW');
    if (url) form.append('referenceURL', url);
    form.append('description', aiResult.description || description.trim());
    form.append('contentType', aiResult.contentType || '');
    form.append('aiConfidence', String(aiResult.aiConfidence || '0.0'));

    if (fileBuffer && req.files && req.files.length > 0) {
      // The AI process may have generated bounding boxes or altered the first image
      req.files[0].buffer = fileBuffer;
    }

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        form.append('evidence', file.buffer, {
          filename: file.originalname || 'evidence.jpg',
          contentType: file.mimetype || 'application/octet-stream'
        });
      });
    }

    try {
      const port = process.env.PORT || 5000;
      console.log(`🚀 Directly feeding form data to Next Step (/api/upload/evidence)`);

      const response = await axios.post(`http://localhost:5000/api/upload/evidence`, form, {
        headers: {
          ...form.getHeaders()
        }
      });

      // Return the final result containing IPFS/Blockchain hashes back to caller
      return res.status(200).json(response.data);
    } catch (apiError) {
      console.error("Failed to directly feed to next feature:", apiError.message);
      if (apiError.response) {
        return res.status(apiError.response.status).json(apiError.response.data);
      }
      return res.status(500).json({ error: "Failed to send data to blockchain endpoint", details: apiError.message });
    }
  } catch (err) {
    next(err);
  } finally {
    // Always clean up the uploaded files from disk
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          try { fs.unlinkSync(file.path); } catch (_) { }
        }
      });
    }
  }
};

module.exports = {
  createReport,
};
