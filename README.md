# AutoCorrect

A Chrome extension that fixes common typos as you type.

Type `teh ` and it becomes `the `. Works in any text box on any site.

## Install

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `autocorrect/` folder

## Files

| File | What it does |
|------|--------------|
| `manifest.json` | Tells Chrome what the extension is and what it's allowed to do |
| `corrections.js` | The typo dictionary — edit this to add your own |
| `content.js` | Watches what you type and applies corrections |
| `popup.html` | The little menu that opens when you click the toolbar icon |
| `popup.js` | Saves the popup's settings |
| `options.html` | The full settings page — toggle options and manage ignored words |
| `options.js` | Saves the options page's settings |

## Using it

Click the extension icon in the toolbar. You get three controls:

- **Enable autocorrect** — turn the whole thing on or off.
- **Announce corrections** — speak corrections to screen readers. On by default.
- **Manage ignored words…** — open the options page.

## Options page

Two toggles, and a list of ignored words:

- **Enable autocorrect**
- **Announce corrections to screen readers**
- **Ignored words** — every word you've told it to leave alone. Remove one to start correcting it again.

## Keyboard shortcuts

| Key | What it does |
|-----|--------------|
| **Ctrl+Z** (Cmd+Z) | Undo the last correction. One-time. |
| **Ctrl+Shift+Z** (Cmd+Shift+Z) | Undo the last correction **and** never correct that word again. Must be pressed within 5 seconds of the correction. |

The difference matters: Ctrl+Z is "give me my text back." Ctrl+Shift+Z is "give me my text back and stop correcting this word."

## Adding your own corrections

Open `corrections.js` and add a line:

```js
recieve: "receive",