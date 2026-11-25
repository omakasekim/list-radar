(() => {
  const BADGE_ID = "aether-list-radar-hud";
  function renderHud(enabled) {
    const existing = document.getElementById(BADGE_ID);
    if (!enabled) { existing?.remove(); return; }
    if (existing) return;
    const links = Array.from(document.querySelectorAll("article.markdown-body a[href^='https://github.com/']"));
    const bar = document.createElement("div");
    bar.id = BADGE_ID;
    bar.style.cssText = "position:fixed;bottom:16px;right:16px;z-index:99999;background:#070B14;color:#e2e8f0;border:1px solid #1E293B;border-radius:12px;padding:10px 14px;font:600 12px ui-monospace,monospace;box-shadow:0 16px 40px rgba(0,0,0,0.6)";
    bar.textContent = "list-radar active · " + links.length + " repo links indexed";
    document.body.appendChild(bar);
  }
  chrome.storage.local.get("enabled").then(({ enabled = true }) => renderHud(enabled));
  chrome.runtime.onMessage.addListener((msg) => { if (msg?.type === "TOGGLE_OVERLAY") renderHud(Boolean(msg.enabled)); });
})();
