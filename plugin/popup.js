document.getElementById("toggle")?.addEventListener("click", async () => {
  const { enabled = true } = await chrome.storage.local.get("enabled");
  await chrome.storage.local.set({ enabled: !enabled });
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_OVERLAY", enabled: !enabled }).catch(() => {});
});
