// test_classify.js

import { FormData, File } from "formdata-node";
import { fileFromPath } from "formdata-node/file-from-path";
import fetch from "node-fetch";
import { parse } from "querystring";

const TEXT_CASES = [
  ["Normal message", "Hey can we meet at the park tomorrow at 3pm?"],
  ["Message with URLs", "Check this out https://suspicious-link.com and also www.another.com — meet me alone."],
  ["Threatening message", "If you tell anyone about this I will make sure you regret it."],
  ["Empty after URL removal (needs_review)", "https://example.com"],
  ["Grooming-style message", "You are so mature for your age. Let us keep this between us, okay? Don't tell your parents."],
];

const TEST_IMAGE_PATH = "../ai_service/test_images/1.jpeg";

// 🧠 Parse multipart/form-data response manually
function parseMultipart(responseText, boundary) {
  const parts = responseText.split(`--${boundary}`);
  const result = {};

  for (const part of parts) {
    if (!part.includes("Content-Disposition")) continue;

    const [headers, body] = part.split("\r\n\r\n");
    const nameMatch = headers.match(/name="([^"]+)"/);

    if (!nameMatch) continue;

    const key = nameMatch[1];
    const value = body.replace(/\r\n$/, "").trim();

    result[key] = value;
  }

  return result;
}

async function runTest(label, text, imagePath = null) {
  const form = new FormData();
  form.set("text", text);

  if (imagePath) {
    const file = await fileFromPath(imagePath);
    form.set("image", file);
  }

  const res = await fetch("http://localhost:8000/classify", {
    method: "POST",
    body: form,
  });

  const contentType = res.headers.get("content-type") || "";

  let data;

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else if (contentType.includes("multipart/form-data")) {
    const boundaryMatch = contentType.match(/boundary=(.*)$/);
    const boundary = boundaryMatch ? boundaryMatch[1] : null;

    const textResponse = await res.text();

    if (!boundary) {
      throw new Error("Boundary not found in response");
    }

    data = parseMultipart(textResponse, boundary);

    // Convert JSON string fields back
    if (data.signals) {
      data.signals = JSON.parse(data.signals);
    }
  } else {
    throw new Error("Unknown response type: " + contentType);
  }

  const nlp = data.signals?.nlp ?? {};

  console.log(`--- ${label}${imagePath ? " [+image]" : ""} ---`);
  console.log(`Input        : ${JSON.stringify(text)}`);
  console.log(`Cleaned text : ${data.description}`);
  console.log(`Top label    : ${nlp.top_label ?? "n/a"}`);
  console.log(`Confidence   : ${nlp.confidence ?? "n/a"}`);
  console.log(`NLP risk     : ${nlp.risk_score ?? "n/a"}`);
  console.log(`Final risk   : ${data.severity}`);
  console.log();
}

async function main() {
  console.log("Running tests...\n");

  for (const [label, text] of TEXT_CASES) {
    await runTest(label, text);
  }

  await runTest("Grooming + Image", TEXT_CASES[4][1], TEST_IMAGE_PATH);
}

main().catch(console.error);