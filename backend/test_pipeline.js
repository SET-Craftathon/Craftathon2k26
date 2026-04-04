require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

// 1. Connect to your actual MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🟢 Connected to MongoDB!"))
  .catch(err => console.error(err));

// Replace the inline dummy schema with your actual Mongoose Model
const BannedUrl = require('./src/models/bannedUrl');

async function testPipeline(newUrlToBan) {
  try {
    console.log(`\n================================`);
    console.log(`🛡️  ADDING URL TO BLOCKLIST: ${newUrlToBan}`);

    // Auto-extract exact clean domain even if they paste a weird URL
    let extractedDomain = newUrlToBan;
    try {
      const parsed = new URL(newUrlToBan.startsWith('http') ? newUrlToBan : `http://${newUrlToBan}`);
      extractedDomain = parsed.hostname;
    } catch (e) { }

    // Step A: Save to Database!
    try {
      await BannedUrl.create({
        url: newUrlToBan,
        domain: extractedDomain,
        description: "Flagged successfully by SafeGuard Test Pipeline",
        reportCount: 1
      });
      console.log(`✅ Saved NEW URL to Mongoose (domain: ${extractedDomain})`);
    } catch (e) {
      if (e.code === 11000) {
        console.log(`⚠️ URL already exists in database (Skipping duplicate)`);
      } else {
        throw e;
      }
    }

    // Step B: Fetch ALL urls from your actual collection
    const allDocs = await BannedUrl.find({});
    // Extract objects with government flags for the Demo Pipeline
    const bannedDomainsArray = allDocs.map(doc => ({
      domain: doc.domain,
      govApproved: false,     // Simulate the Dashboard button press
      honeypotActive: false   // Simulate the Dashboard button press
    }));

    console.log(`📊 Current DB Count: ${bannedDomainsArray.length} Banned Domains`);

    // Step C: Trigger the Webhook manually to simulate Chrome Extension bridge
    console.log(`\n🚀 Triggering Webhook to Bridge Server...`);

    const response = await axios.post('http://localhost:3000/webhook', {
      urls: bannedDomainsArray
    });

    console.log(`⚡ Bridge Response: ${response.data}`);
    console.log(`================================\n`);

  } catch (error) {
    console.error("❌ Pipeline Failed:", error.message);
  }
}

// Pass an unlimited number of custom URLs from CLI
const urlsToBan = process.argv.slice(2);
if (urlsToBan.length === 0) {
  urlsToBan.push("super-dangerous-hacker-site.com"); // default
}

async function runBulkTest() {
  console.log(`\n================================`);
  console.log(`🛡️  ADDING ${urlsToBan.length} URL(S) TO BLOCKLIST`);

  for (const url of urlsToBan) {
    await testPipeline(url);
  }

  // Close connection AFTER all loops are done
  mongoose.connection.close();
}

runBulkTest();
