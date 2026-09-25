(() => {
  // Dictionary of typos -> corrections (from corrections.js)
  const DICT = window.CORRECTIONS || {};

  // Matches a full word followed by a space/punctuation at the end of the text.
  // This is how we avoid firing mid-word.
  const TRAILING = /([A-Za-z][A-Za-z']*)([^A-Za-z0-9']+)$/;

  // Input types that are safe to edit. Password, number, date etc. are excluded.
  const SAFE_TYPES = new Set(["text", "search", "url", "email", "tel"]);

  let enabled = true;    // is the extension on?
  let busy = false;      // true while we're the ones editing the field
  let composing = false; // true while an IME is mid-composition

  // Load the on/off setting, and keep it in sync when the popup changes it.
  chrome.storage.sync.get({ enabled: true }, (v) => { enabled = v.enabled; });
  chrome.storage.onChanged.addListener((c, area) => {
    if (area === "sync" && c.enabled) enabled = c.enabled.newValue;
  });

  // IME guard: stop correcting while Korean/Japanese/Chinese/Vietnamese
  // input is mid-composition. Otherwise we corrupt what the user is typing.
  document.addEventListener("compositionstart", () => { composing = true; }, true);
  document.addEventListener("compositionend",   () => { composing = false; }, true);

  // --- Announcement -------------------------------------------------------
  // A hidden live region. Screen readers watch this element and speak any text
  // we put in it. Sighted users never see it. Created once per page.
  let liveRegion = null;

  function getLiveRegion() {
    if (liveRegion && liveRegion.isConnected) return liveRegion;
    liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-live", "polite"); // wait for a pause before speaking
    liveRegion.setAttribute("aria-atomic", "true"); // read the whole thing, not just the diff
    // Visually hidden, but still in the accessibility tree.
    liveRegion.style.cssText =
      "position:absolute;width:1px;height:1px;padding:0;margin:-1px;" +
      "overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;";
    document.body.appendChild(liveRegion);
    return liveRegion;
  }

  // Say something to assistive tech. Screen readers only; sighted users see nothing.
    let announceEnabled = true;
  chrome.storage.sync.get({ announce: true }, (v) => { announceEnabled = v.announce; });
  chrome.storage.onChanged.addListener((c, area) => {
    if (area === "sync" && c.announce) announceEnabled = c.announce.newValue;
  });

  function announce(message) {
    if (!announceEnabled) return; // user turned announcements off
    const region = getLiveRegion();
    region.textContent = "";
    requestAnimationFrame(() => { region.textContent = message; });
  }

  // Only textareas and safe input types may be corrected.
  function isSafeField(el) {
    if (el instanceof HTMLTextAreaElement) return true;
    if (el instanceof HTMLInputElement) {
      return SAFE_TYPES.has((el.type || "text").toLowerCase());
    }
    return false;
  }

  // All the conditions that must be true before we're allowed to edit.
  function canCorrect(el) {
    if (busy || !enabled || composing) return false;      // not now
    if (!isSafeField(el)) return false;                   // wrong kind of field
    if (el.readOnly || el.disabled) return false;         // can't write to it
    if (el.spellcheck === false) return false;            // site said hands off
    if (el.getRootNode().activeElement !== el) return false; // not focused
    const pos = el.selectionStart;
    if (pos == null || pos !== el.selectionEnd) return false; // text is selected
    return true;
  }

  // Copy the capitalization of the original word onto the correction.
  // "Teh" -> "The", "TEH" -> "THE", "teh" -> "the".
  function matchCase(sample, replacement) {
    if (sample.length > 1 && sample === sample.toUpperCase()) {
      return replacement.toUpperCase();
    }
    if (sample[0] === sample[0].toUpperCase()) {
      return replacement[0].toUpperCase() + replacement.slice(1);
    }
    return replacement;
  }

  // Fallback writer for when execCommand fails. Uses the prototype setter so
  // React and Vue notice the change, then fires a real input event.
  function replaceValue(el, value) {
    const proto = el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // The main correction routine.
  function correct(el) {
    const pos = el.selectionStart;

    // Look at the text before the caret for a finished word + delimiter.
    const m = el.value.slice(0, pos).match(TRAILING);
    if (!m) return;

    const word = m[1];
    const replacement = DICT[word.toLowerCase()];
    if (!replacement) return; // not a known typo

    const fixed = matchCase(word, replacement);
    if (fixed === word) return; // nothing to change

    const start = pos - m[0].length;              // where the word begins
    const end   = start + word.length;            // where the word ends
    const caret = pos + (fixed.length - word.length); // where the caret goes after

    busy = true;
    try {
      el.setSelectionRange(start, end); // select just the typo
      // execCommand inserts text like the user typed it, so Ctrl+Z still works.
      const ok = document.execCommand("insertText", false, fixed);
      if (!ok) {
        // Fallback if execCommand is unavailable.
        replaceValue(el, el.value.slice(0, start) + fixed + el.value.slice(end));
      }
      el.setSelectionRange(caret, caret); // put the caret back where it belongs

      // Tell screen readers what happened. Silent for everyone else.
      announce(`Corrected ${word} to ${fixed}. Press Control Shift Z to undo.`);
    } finally {
      busy = false;
    }
  }

  // Listen for input on the whole page (capture phase, so we run first).
  document.addEventListener("input", (e) => {
    if (e.isComposing) return; // IME is still working, ignore
    const el = e.composedPath ? e.composedPath()[0] : e.target;
    if (el && canCorrect(el)) correct(el);
  }, true);
})();