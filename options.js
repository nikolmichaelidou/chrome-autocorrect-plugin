const enabledBox  = document.getElementById("enabled");
const announceBox = document.getElementById("announce");
const list        = document.getElementById("ignored");

// --- load -----------------------------------------------------------------
chrome.storage.sync.get(
  { enabled: true, announce: true, ignored: [] },
  (v) => {
    enabledBox.checked  = v.enabled;
    announceBox.checked = v.announce;
    renderIgnored(v.ignored);
  }
);

// --- save toggles ---------------------------------------------------------
enabledBox.addEventListener("change", () => {
  chrome.storage.sync.set({ enabled: enabledBox.checked });
});
announceBox.addEventListener("change", () => {
  chrome.storage.sync.set({ announce: announceBox.checked });
});

// --- ignored words list ---------------------------------------------------
function renderIgnored(words) {
  list.textContent = ""; // clear

  if (!words.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No ignored words yet.";
    list.appendChild(li);
    return;
  }

  for (const word of [...words].sort()) {
    const li = document.createElement("li");

    const label = document.createElement("span");
    label.textContent = word;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Remove";
    // Label the button for screen readers, so "Remove" alone isn't ambiguous.
    btn.setAttribute("aria-label", `Remove ${word} from ignored words`);
    btn.addEventListener("click", () => removeWord(word));

    li.append(label, btn);
    list.appendChild(li);
  }
}

function removeWord(word) {
  chrome.storage.sync.get({ ignored: [] }, (v) => {
    const next = v.ignored.filter((w) => w !== word);
    chrome.storage.sync.set({ ignored: next }, () => {
      renderIgnored(next);
      // Move focus somewhere sensible so keyboard users aren't stranded.
      list.focus?.();
      announceToScreenReader(`Removed ${word}`);
    });
  });
}

// --- tiny live region for the options page itself -------------------------
function announceToScreenReader(message) {
  let region = document.getElementById("options-live");
  if (!region) {
    region = document.createElement("div");
    region.id = "options-live";
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-atomic", "true");
    region.style.cssText =
      "position:absolute;width:1px;height:1px;padding:0;margin:-1px;" +
      "overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;";
    document.body.appendChild(region);
  }
  region.textContent = "";
  requestAnimationFrame(() => { region.textContent = message; });
}