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
| `popup.html` | The little on/off window |
| `popup.js` | Saves the on/off setting |

## Turning it off

Click the extension icon and uncheck **Enable autocorrect**.

## Adding your own corrections

Open `corrections.js` and add a line:

```js
recieve: "receive",