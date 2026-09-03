# Tab Link Exporter

Chrome extension for managing open tabs and exporting their links.

## Features

- View all tabs in the current Chrome window
- Search tabs by title or URL
- Select individual tabs or select all
- Close tabs from the extension
- Export selected tabs as HTML
- Export selected tabs as CSV
- Copy selected tabs as Markdown links
- Show tab favicons when available

## Tech

- HTML
- CSS
- JavaScript
- Chrome Extensions API
- Manifest V3

## Installation

This extension is not currently published on the Chrome Web Store, so it needs to be loaded manually.

### 1. Download the repository

Clone the repo:

```bash
git clone <your-repository-url>
```

Or download the repository as a ZIP from GitHub and extract it.

### 2. Open Chrome Extensions

Go to:

```text
chrome://extensions
```

### 3. Enable Developer Mode

Turn on **Developer mode** in the top-right corner.

### 4. Load the extension

Click **Load unpacked** and select the project folder.

Make sure the folder you select contains `manifest.json` directly:

```text
tab-list-extension/
├── manifest.json
├── popup.html
├── popup.js
└── icon-16.png
```

The extension should now appear in Chrome.

### 5. Pin it

Open the Extensions menu in Chrome and pin **Tab Link Exporter** so it is easy to access.

## Usage

Click the extension icon while you have tabs open.

The popup shows the tabs in your current Chrome window.

### Search

Use the search box to filter tabs by their title or URL.

### Select tabs

Use the checkbox next to a tab to select it.

You can also use **Select All** to select all currently displayed tabs.

### Close a tab

Click the `×` button next to a tab to close it.

### Export

After selecting the tabs you want, you can:

- **Export Doc** — creates an HTML file containing the selected links.
- **Export CSV** — creates a CSV file with the tab title and URL.
- **Copy MD** — copies the selected tabs as Markdown links.

Example:

```markdown
- [Google](https://www.google.com)
```

## How it works

The extension uses the Chrome Tabs API to get the tabs from the current window.

The main logic is in `popup.js`:

1. Get the current window's tabs.
2. Render them in the popup.
3. Keep track of selected tab IDs.
4. Filter the list when the user searches.
5. Perform the requested action on the selected tabs.

Exports are generated locally in the browser using JavaScript. No backend or external service is required.

## Permissions

The extension uses the `tabs` permission.

It is required to read information about the tabs, such as:

- Tab title
- URL
- Favicon

It is also used to close tabs when requested.

## Project Structure

```text
tab-list-extension/
├── manifest.json    # Extension configuration
├── popup.html       # Popup UI
├── popup.js         # Extension logic
└── icon-16.png      # Extension icon
```

## Development

There is no build step or package installation required.

Edit the source files directly and then reload the extension from:

```text
chrome://extensions
```

For example, after changing `popup.js`:

1. Open `chrome://extensions`
2. Find the extension
3. Click **Reload**
4. Open the extension again

## Limitations

- Currently works with tabs in the current Chrome window.
- Requires a Chromium-based browser with Manifest V3 support.
- Must be loaded as an unpacked extension unless published through a browser extension store.

## Possible Improvements

- Support tabs across multiple Chrome windows
- Add JSON export
- Add TXT export
- Save tab lists for later
- Add keyboard shortcuts
- Add tab grouping
- Add dark mode
- Publish to the Chrome Web Store

## License

Add a license here if you plan to distribute the project publicly.
