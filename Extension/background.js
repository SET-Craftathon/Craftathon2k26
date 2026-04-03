// background.js — POCSO SafeGuard Extension
// Loads the local blocklist.json and builds declarativeNetRequest redirect rules
// pointing flagged domains at the blocked.html warning page.

const BLOCKED_PAGE = chrome.runtime.getURL('blocked.html');

async function buildRules() {
  try {
    const res = await fetch(chrome.runtime.getURL('blocklist.json'));
    const domains = await res.json();

    // Build redirect rules — one per domain, redirecting to blocked.html?url=<domain>
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

    // Remove all old dynamic rules then apply new ones
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    const existingIds = existing.map(r => r.id);

    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingIds,
      addRules: rules
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Rule update failed:', chrome.runtime.lastError.message);
      } else {
        console.log(`[SafeGuard] ${rules.length} blocking rules loaded.`);
      }
    });

  } catch (err) {
    console.error('[SafeGuard] Failed to load blocklist:', err);
  }
}

// Run on install / update
chrome.runtime.onInstalled.addListener(() => {
  console.log('[SafeGuard] Extension installed. Loading blocklist...');
  buildRules();
});

// Refresh every 60 minutes (for live API integration later)
chrome.alarms.create('refreshBlocklist', { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'refreshBlocklist') buildRules();
});
