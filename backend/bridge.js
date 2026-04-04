const express = require('express');
const { WebSocketServer, WebSocket } = require('ws');
const mongoose = require('mongoose');
require('dotenv').config();
const BannedUrl = require('./src/models/bannedUrl');

// 1. Setup Express and WebSocket Server on Port 3000
const app = express();
const server = app.listen(3000, () => {
  console.log("🚀 Webhook-to-WebSocket Bridge running on port 3000");
  console.log("Waiting for Chrome Extensions to connect...");
});
const wss = new WebSocketServer({ server });

// 2. Load from MongoDB on startup so cache is always ready
async function prefillCache() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const allDocs = await BannedUrl.find({});
    lastKnownPayload = allDocs.map(doc => ({
      domain: doc.domain,
      govApproved: true,
      honeypotActive: true
    }));
    console.log(`🗃️  Loaded ${lastKnownPayload.length} domains from MongoDB into bridge cache.`);
    mongoose.connection.close();
  } catch(err) {
    console.error('⚠️  Could not prefill from MongoDB:', err.message);
  }
}

// 2. Keep track of all connected Chrome Extensions
const extensionClients = new Set();

// Cache the last known blacklist to send to newly connected extensions
let lastKnownPayload = null;

wss.on('connection', (ws) => {
  console.log("✅ New Chrome Extension connected!");
  extensionClients.add(ws);

  // Send the last known state immediately as a "Welcome Package"
  if (lastKnownPayload) {
    ws.send(JSON.stringify({ action: 'UPDATE_BLACKLIST', items: lastKnownPayload }));
    console.log(`📦 Sent cached blacklist (${lastKnownPayload.length} domains) to new extension.`);
  }

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.action === 'PING') return; // stay alive silently
    } catch(e) {}
  });

  ws.on('close', () => {
    console.log("❌ Chrome Extension disconnected.");
    extensionClients.delete(ws);
  });
});

// 3. The Webhook Endpoint for MongoDB Atlas
// Your Atlas Database Trigger should send a POST request to this endpoint
app.post('/webhook', express.json(), (req, res) => {
  console.log("🔔 Received Webhook Update from MongoDB Atlas!");
  
  // Extract the "urls" from the payload. 
  // (You may need to change req.body.urls depending on how you format the Atlas payload)
  const newUrls = req.body.urls; 

  if (!Array.isArray(newUrls)) {
    console.log("⚠️ Invalid payload received. Expected an array of URLs.");
    return res.status(400).send("Invalid payload: expected 'urls' array");
  }

  // Cache it so new connections get it immediately
  lastKnownPayload = newUrls;
  let count = 0;
  for (const client of extensionClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ 
        action: 'UPDATE_BLACKLIST', 
        items: newUrls 
      }));
      count++;
    }
  }

  console.log(`📡 Broadcasted new rules to ${count} active extensions.`);
  res.status(200).send(`Update broadcasted to ${count} extensions`);
});

// 4. The Stealth Honeypot Tracker Endpoint
app.post('/log-hacker', express.json(), (req, res) => {
  const meta = req.body;
  console.log(`\n==============================================`);
  console.log(`🚨 HONEYPOT TRIGGERED!`);
  console.log(`   [Date]: ${meta.timestamp}`);
  console.log(`   [Target]: ${meta.target_url}`);
  console.log(`   [IP Address]: ${meta.ip}`);
  console.log(`   [Browser]: ${meta.browser}`);
  console.log(`   [OS]: ${meta.os} | [Screen]: ${meta.screen}`);
  console.log(`==============================================\n`);
  res.status(200).send("Logged");
});

// Boot: Load MongoDB into cache immediately so extensions get data on first connect
prefillCache();
