const STORAGE_KEY = "blockedScriptPatterns";

const RULE_ID_START = 1000;

function buildRule(id, pattern) {
  const isRegex = pattern.startsWith("re:");
  const rule = {
    id,
    priority: 1,
    action: { type: "block" },
    condition: {
      resourceTypes: ["script"]
    }
  };

  if (isRegex) {
    const regex = pattern.slice(3).trim();
    rule.condition.regexFilter = regex;
  } else {
    rule.condition.urlFilter = pattern;
  }

  return rule;
}

async function rebuildRules() {
  const { [STORAGE_KEY]: patterns = [] } = await chrome.storage.local.get(STORAGE_KEY);

  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const managedIds = existing
    .map(r => r.id)
    .filter(id => id >= RULE_ID_START && id < RULE_ID_START + 100000);

  const newRules = patterns.map((p, idx) => buildRule(RULE_ID_START + idx, p));

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: managedIds,
    addRules: newRules
  });
}

chrome.runtime.onInstalled.addListener(() => {
  rebuildRules().catch(console.error);
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "REBUILD_RULES") {
    rebuildRules()
      .then(() => sendResponse({ ok: true }))
      .catch(err => sendResponse({ ok: false, error: String(err) }));
    return true; 
  }
});
