// background.js — POCSO SafeGuard Extension

const BLOCKED_PAGE = chrome.runtime.getURL('alert.html');

// Runtime whitelist — these domains will NEVER be blocked regardless of blocklist content
const WHITELIST_SUFFIXES = [
  'google.com', 'googleapis.com', 'gstatic.com', 'googlevideo.com',
  'youtube.com', 'youtu.be', 'ytimg.com',
  'microsoft.com', 'office.com', 'live.com', 'outlook.com', 'msn.com',
  'bing.com', 'windows.com',
  'github.com', 'githubusercontent.com',
  'wikipedia.org', 'wikimedia.org',
  'apple.com', 'icloud.com',
  'amazon.com', 'amazonaws.com',
  'cloudflare.com', 'cdn.jsdelivr.net',
  'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
  'localhost', '127.0.0.1',
];

function isWhitelisted(domain) {
  const d = domain.toLowerCase().replace(/^www\./, '');
  return WHITELIST_SUFFIXES.some(suffix => d === suffix || d.endsWith('.' + suffix));
}

let pingInterval;

function connectToBridge() {
  const ws = new WebSocket('ws://localhost:3000');
  
  ws.onopen = () => {
    console.log('[SafeGuard] 🔗 Connected to Real-Time Bridge');
    // Keep connection alive with a ping every 20 seconds
    pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'PING' }));
      }
    }, 20000);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.action === 'UPDATE_BLACKLIST' && Array.isArray(data.urls)) {
        console.log(`[SafeGuard] 🚨 Real-time update received! ${data.urls.length} URLs`);
        chrome.storage.local.set({ bannedUrlsMetadata: data.urls });
        applyBlockingRules(data.urls);
      }
    } catch (e) { }
  };

  ws.onclose = () => {
    clearInterval(pingInterval);
    setTimeout(connectToBridge, 5000);
  };
}

let staticBlocklist = [];
let realTimeBlocklist = [];

async function applyBlockingRules() {
  // Merge both lists and remove duplicates automatically
  const mergedDomains = [...new Set([...staticBlocklist, ...realTimeBlocklist])];
  const activeDomains = mergedDomains.filter(d => !isWhitelisted(d));

  const rules = activeDomains.map((domain, i) => ({
    id: i + 1,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: { extensionPath: `/alert.html?url=${encodeURIComponent(domain)}` }
    },
    condition: { urlFilter: `||${domain}^`, resourceTypes: ['main_frame'] }
  }));

  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const existingIds = existing.map(r => r.id);

  chrome.declarativeNetRequest.updateDynamicRules(
    { removeRuleIds: existingIds, addRules: rules },
    () => {
      if (chrome.runtime.lastError) {
        console.error('[SafeGuard] Rule error:', chrome.runtime.lastError.message);
      } else {
        console.log(`[SafeGuard] ${rules.length} total shields active. (Merged Static + Real-Time)`);
      }
    }
  );
}

// Initial function to load static file
async function buildRules() {
  try {
    const res = await fetch(chrome.runtime.getURL('blocklist.json'));
    staticBlocklist = await res.json();
    
    // Also load any saved real-time rules from storage on boot!
    const storage = await chrome.storage.local.get("bannedUrlsMetadata");
    if (storage.bannedUrlsMetadata) {
      realTimeBlocklist = storage.bannedUrlsMetadata;
    }
    
    await applyBlockingRules();
  } catch (err) { }
}

chrome.runtime.onInstalled.addListener(() => {
  buildRules();
});

// Start real-time connection
connectToBridge();
