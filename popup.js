const box = document.getElementById("on");

chrome.storage.sync.get({ enabled: true }, (v) => {
  box.checked = v.enabled;
});

box.addEventListener("change", () => {
  chrome.storage.sync.set({ enabled: box.checked });
});