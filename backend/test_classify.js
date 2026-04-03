// test_classify.js
// Quick script to hit POST /classify on the local FastAPI server.
// Run with: node test_classify.js
// No dependencies beyond Node's built-in fetch (Node 18+).
// If you are on Node 16 or below, run: npm install node-fetch
// and add: import fetch from "node-fetch"; at the top.

const BASE_URL = "http://localhost:8000";

const TEST_CASES = [
  {
    label: "Normal message",
    text: "Hey can we meet at the park tomorrow at 3pm?",
  },
  {
    label: "Message with URLs",
    text: "Check this out https://suspicious-link.com and also www.another.com — meet me alone.",
  },
  {
    label: "Threatening message",
    text: "If you tell anyone about this I will make sure you regret it.",
  },
  {
    label: "Empty after URL removal (needs_review trigger)",
    text: "https://example.com",
  },
  {
    label: "Grooming-style message",
    text: "You are so mature for your age. Let us keep this between us, okay? Don't tell your parents.",
  },
];

async function runTest(label, text) {
  console.log(`\n--- ${label} ---`);
  console.log(`Input: "${text}"`);

  try {
    const response = await fetch(`${BASE_URL}/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error(`HTTP ${response.status}:`, err.detail ?? err);
      return;
    }

    const result = await response.json();

    console.log(`Cleaned text : "${result.cleaned_text}"`);
    console.log(`Extracted URLs: ${JSON.stringify(result.extracted_urls)}`);
    console.log(`Top label    : ${result.top_label}`);
    console.log(`Confidence   : ${result.confidence}`);
    console.log(`Risk score   : ${result.risk_score}`);
    console.log("All labels   :", result.all_labels);
  } catch (err) {
    // Network error — server probably not running
    console.error("Request failed:", err.message);
    console.error("Is the FastAPI server running? -> uvicorn api:app --reload");
  }
}

async function main() {
  console.log(`Hitting ${BASE_URL}/classify with ${TEST_CASES.length} test cases...\n`);

  for (const { label, text } of TEST_CASES) {
    await runTest(label, text);
  }
}

main();