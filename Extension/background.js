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
      if (data.action === 'UPDATE_BLACKLIST' && Array.isArray(data.items)) {
        console.log(`[SafeGuard] 🚨 Real-time update received! ${data.items.length} domain objects`);
        chrome.storage.local.set({ bannedUrlsMetadata: data.items });
        realTimeBlocklist = data.items; // instantly apply without rebuilding declarativeNet rules
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
// In-memory strike cache: loaded once from storage, updated synchronously
let strikeCache = null;

async function getAndIncrementStrike(domain) {
  if (strikeCache === null) {
    // First time this SW session — load from storage
    const s = await chrome.storage.local.get('userStrikes');
    strikeCache = s.userStrikes || {};
  }
  // Increment synchronously in memory (no race condition)
  strikeCache[domain] = (strikeCache[domain] || 0) + 1;
  // MUST await the write so it completes before SW can die between visits
  await chrome.storage.local.set({ userStrikes: strikeCache });
  return strikeCache[domain];
}

// Retrieve flags and match domains
function getBannedSiteData(urlStr) {
  try {
    const parsedUrl = new URL(urlStr);
    // Ignore chrome-extension pages to prevent infinite redirect loops
    if (parsedUrl.protocol === 'chrome-extension:') return null;
    
    const domain = parsedUrl.hostname.replace(/^www\./, '');
    if (isWhitelisted(domain)) return null;

    // 1. Check Real-Time (These are Objects with gov flags)
    const rtMatch = realTimeBlocklist.find(item => item.domain === domain);
    if (rtMatch) return rtMatch;

    // 2. Check Static List (These are just raw strings, no flags default)
    if (staticBlocklist.includes(domain)) {
      return { domain, govApproved: false, honeypotActive: false, isStatic: true };
    }
  } catch(e) {}
  return null;
}

// THE BRAIN: webNavigation intercepts the request (async to avoid race condition)
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only analyze main URL bar requests
  
  let domain;
  try {
    const parsedUrl = new URL(details.url);
    if (parsedUrl.protocol === 'chrome-extension:') return;
    domain = parsedUrl.hostname.replace(/^www\./, '');
  } catch(e) { return; }

  if (isWhitelisted(domain)) return;

  // ALWAYS read from storage — memory may not be ready (race condition fix)
  const storage = await chrome.storage.local.get(['bannedUrlsMetadata', 'staticBlocklist', 'userStrikes']);
  const rtList = storage.bannedUrlsMetadata || [];

  // Check Real-Time list first (objects with gov flags)
  let siteData = rtList.find(item => item.domain === domain);

  // Then check Static list (strings)
  if (!siteData && staticBlocklist.includes(domain)) {
    siteData = { domain, govApproved: false, honeypotActive: false };
  }

  if (!siteData) return; // Not banned — let them through

  // Increment with write-through cache (race condition safe)
  const currentStrikes = await getAndIncrementStrike(domain);

  console.log(`[SafeGuard] 🎯 Intercepted: ${domain}. Strike: ${currentStrikes}`);

  // ⛔ 4th STRIKE ALWAYS = Permanent Hard Block (even overrides honeypot)
  if (currentStrikes >= 4) {
    const blockUrl = chrome.runtime.getURL(`alert.html?url=${encodeURIComponent(details.url)}&strike=max`);
    chrome.tabs.update(details.tabId, { url: blockUrl });
  }
  else if (siteData.govApproved && siteData.honeypotActive) {
    // 🚨 GOVERNMENT HONEYPOT: Trap them silently (Strike 1-3)
    const honeypotUrl = chrome.runtime.getURL(`honeypot.html?url=${encodeURIComponent(details.url)}`);
    chrome.tabs.update(details.tabId, { url: honeypotUrl });
  } 
  else {
    // ⚠️ 1st-3rd STRIKE: Gentle Warning (for non-honeypot sites)
    const warnUrl = chrome.runtime.getURL(`warning.html?url=${encodeURIComponent(details.url)}&strikes=${currentStrikes}`);
    chrome.tabs.update(details.tabId, { url: warnUrl });
  }
});

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
    
    console.log(`[SafeGuard] Loaded ${staticBlocklist.length} static and ${realTimeBlocklist.length} real-time domains directly into WebNav Memory Engine.`);
  } catch (err) { console.error(err); }
}

// Wake-up hydration: Always load memory when Service Worker spins up
buildRules();

// Start real-time connection
connectToBridge();
