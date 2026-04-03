// test_classify.js — corrected field paths

const cases = [
  "Hey can we meet at the park tomorrow at 3pm?",
  "Check this out https://suspicious-link.com and also www.another.com — meet me alone.",
  "If you tell anyone about this I will make sure you regret it.",
  "https://example.com",
  "You are so mature for your age. Let us keep this between us, okay? Don't tell your parents.",
];

async function runTest(text, label) {
  const res = await fetch("http://localhost:8000/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const data = await res.json();
  const nlp = data.signals?.nlp ?? {};

  console.log(`--- ${label} ---`);
  console.log(`Input        : ${JSON.stringify(text)}`);
  console.log(`Cleaned text : ${JSON.stringify(data.cleaned_text)}`);
  console.log(`Extracted URLs: ${JSON.stringify(data.extracted_urls)}`);
  console.log(`Top label    : ${nlp.top_label ?? "n/a"}`);
  console.log(`Confidence   : ${nlp.confidence ?? "n/a"}`);
  console.log(`NLP risk     : ${nlp.risk_score ?? "n/a"}`);
  console.log(`Final risk   : ${data.final_risk_score}`);
  console.log(`All labels   :`);
  if (nlp.all_labels) {
    for (const [k, v] of Object.entries(nlp.all_labels)) {
      console.log(`  ${k.padEnd(25)}: ${v}`);
    }
  }
  console.log();
}

async function main() {
  console.log("Hitting http://localhost:8000/classify with 5 test cases...\n");
  const labels = [
    "Normal message",
    "Message with URLs",
    "Threatening message",
    "Empty after URL removal (needs_review trigger)",
    "Grooming-style message",
  ];
  for (let i = 0; i < cases.length; i++) {
    await runTest(cases[i], labels[i]);
  }
}

main().catch(console.error);