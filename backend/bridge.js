const express = require('express');
const { WebSocketServer, WebSocket } = require('ws');

// 1. Setup Express and WebSocket Server on Port 3000
const app = express();
const server = app.listen(3000, () => {
  console.log("🚀 Webhook-to-WebSocket Bridge running on port 3000");
  console.log("Waiting for Chrome Extensions to connect...");
});
const wss = new WebSocketServer({ server });

// 2. Keep track of all connected Chrome Extensions
const extensionClients = new Set();

wss.on('connection', (ws) => {
  console.log("✅ New Chrome Extension connected!");
  extensionClients.add(ws);

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

  // Fast-Push the array of new URLs to all connected Chrome extensions
  let count = 0;
  for (const client of extensionClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ 
        action: 'UPDATE_BLACKLIST', 
        urls: newUrls 
      }));
      count++;
    }
  }

  console.log(`📡 Broadcasted new rules to ${count} active extensions.`);
  res.status(200).send(`Update broadcasted to ${count} extensions`);
});
