const enabledBox  = document.getElementById("enabled");
const announceBox = document.getElementById("announce");
const manageBtn   = document.getElementById("manage");

// --- load -----------------------------------------------------------------
chrome.storage.sync.get(
  { enabled: true, announce: true },
  (v) => {
    enabledBox.checked  = v.enabled;
    announceBox.checked = v.announce;
  }
);

// --- save on change -------------------------------------------------------
enabledBox.addEventListener("change", () => {
  chrome.storage.sync.set({ enabled: enabledBox.checked });
});
announceBox.addEventListener("change", () => {
  chrome.storage.sync.set({ announce: announceBox.checked });
});

// --- open the options page ------------------------------------------------
manageBtn.addEventListener("click", () => {
  // openOptionsPage works in both Chrome and Firefox; no URL guessing.
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options.html"));
  }
});