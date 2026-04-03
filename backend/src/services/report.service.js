const axios = require('axios');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';
const USE_MOCK_NLP = process.env.USE_MOCK_NLP === 'true';

/**
 * Returns a mock NLP response for local testing without FastAPI.
 */
const getMockResponse = (text) => ({
  cleaned_text: text,
  extracted_urls: [],
  top_label: 'phishing',
  confidence: 0.87,
  all_labels: {
    phishing: 0.87,
    scam: 0.65,
    identity_theft: 0.23,
    fraud: 0.12,
  },
  risk_score: 'HIGH',
});

/**
 * Sends only the text to the FastAPI NLP service for classification.
 * - If USE_MOCK_NLP=true → uses mock directly (skip network call).
 * - If FastAPI is unreachable → auto-falls back to mock with a warning.
 * - If FastAPI is available → uses real AI response.
 * @param {string} text - The user's description text
 * @returns {Promise<object>} AI classification result
 */
const analyzeText = async (text) => {
  // Explicit mock mode
  if (USE_MOCK_NLP) {
    console.log('🧪 Using mock NLP response (USE_MOCK_NLP=true)');
    return getMockResponse(text);
  }

  // Try real FastAPI, fallback to mock if unavailable
  try {
    const response = await axios.post(`${FASTAPI_URL}/analyze`, {
      text,
    });
    return response.data;
  } catch (err) {
    console.warn(`⚠️ FastAPI unavailable (${err.message}) — using mock NLP response`);
    return getMockResponse(text);
  }
};

module.exports = {
  analyzeText,
};

