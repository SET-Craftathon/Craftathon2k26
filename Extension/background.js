// background.js — POCSO SafeGuard Extension

const BLOCKED_PAGE = chrome.runtime.getURL('blocked.html');

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

async function buildRules() {
  try {
    const res = await fetch(chrome.runtime.getURL('blocklist.json'));
    const allDomains = await res.json();

    // Double-filter with runtime whitelist as safety net
    const domains = allDomains.filter(d => !isWhitelisted(d));

    const rules = domains.map((domain, i) => ({
      id: i + 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          url: `${BLOCKED_PAGE}?url=${encodeURIComponent(domain)}`
        }
      },
      condition: {
        urlFilter: `||${domain}^`,
        resourceTypes: ['main_frame']
      }
    }));

    // Remove ALL existing dynamic rules first
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    const existingIds = existing.map(r => r.id);

    chrome.declarativeNetRequest.updateDynamicRules(
      { removeRuleIds: existingIds, addRules: rules },
      () => {
        if (chrome.runtime.lastError) {
          console.error('[SafeGuard] Rule error:', chrome.runtime.lastError.message);
        } else {
          console.log(`[SafeGuard] ${rules.length} rules active. Whitelist: ${allDomains.length - domains.length} skipped.`);
        }
      }
    );

  } catch (err) {
    console.error('[SafeGuard] Failed to load blocklist:', err);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('[SafeGuard] Extension installed. Loading blocklist...');
  buildRules();
});

// Refresh every 60 minutes
chrome.alarms.create('refreshBlocklist', { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'refreshBlocklist') buildRules();
});
