const STORAGE_KEY = "blockedScriptPatterns";

function normalizeLines(text) {
  return text
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith("#"));
}

async function load() {
  const { [STORAGE_KEY]: patterns = [] } = await chrome.storage.local.get(STORAGE_KEY);
  document.getElementById("rules").value = patterns.join("\n");
  document.getElementById("count").textContent = `${patterns.length} Einträge`;
}

async function save() {
  const raw = document.getElementById("rules").value;
  const patterns = normalizeLines(raw);

  await chrome.storage.local.set({ [STORAGE_KEY]: patterns });

  await chrome.runtime.sendMessage({ type: "REBUILD_RULES" });

  document.getElementById("count").textContent = `${patterns.length} Einträge`;
  const status = document.getElementById("status");
  status.textContent = `Gespeichert. Regeln aktualisiert: ${new Date().toLocaleString()}`;
}

document.getElementById("save").addEventListener("click", () => {
  save().catch(err => {
    const status = document.getElementById("status");
    status.textContent = `Fehler: ${String(err)}`;
  });
});

load().catch(console.error);
