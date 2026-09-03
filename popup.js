let allTabs = [];
let selectedTabIds = new Set();

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    allTabs = tabs || [];
    selectedTabIds = new Set(allTabs.map((t) => t.id));

    renderTabs(allTabs);
    updateStats();

    // Search filter
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allTabs.filter(
          (t) =>
            (t.title && t.title.toLowerCase().includes(query)) ||
            (t.url && t.url.toLowerCase().includes(query))
        );
        renderTabs(filtered);
      });
    }

    // Select all checkbox
    const selectAllCb = document.getElementById("selectAllCheckbox");
    if (selectAllCb) {
      selectAllCb.addEventListener("change", (e) => {
        if (e.target.checked) {
          allTabs.forEach((t) => selectedTabIds.add(t.id));
        } else {
          selectedTabIds.clear();
        }
        renderTabs(getCurrentFilteredTabs());
        updateStats();
      });
    }

    // Action buttons
    document.getElementById("exportDocBtn")?.addEventListener("click", exportAsDoc);
    document.getElementById("exportCsvBtn")?.addEventListener("click", exportAsCsv);
    document.getElementById("copyMdBtn")?.addEventListener("click", copyAsMarkdown);
  } catch (err) {
    console.error("Initialization error:", err);
  }
});

function getCurrentFilteredTabs() {
  const searchInput = document.getElementById("searchInput");
  const query = searchInput ? searchInput.value.toLowerCase() : "";
  return allTabs.filter(
    (t) =>
      (t.title && t.title.toLowerCase().includes(query)) ||
      (t.url && t.url.toLowerCase().includes(query))
  );
}

function renderTabs(tabs) {
  const list = document.getElementById("tabList");
  if (!list) return;

  list.innerHTML = "";

  if (!tabs || tabs.length === 0) {
    list.innerHTML = `<li style="padding: 16px; text-align: center; color: #94a3b8; font-size: 12px;">No matching tabs</li>`;
    return;
  }

  const defaultFavicon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E";

  tabs.forEach((tab) => {
    const isChecked = selectedTabIds.has(tab.id);
    const li = document.createElement("li");
    li.className = "tab-item";

    const title = escapeHtml(tab.title || "Untitled");
    const url = escapeHtml(cleanUrl(tab.url || ""));

    li.innerHTML = `
      <input type="checkbox" class="tab-select" ${isChecked ? "checked" : ""}>
      <img class="tab-fav" src="${tab.favIconUrl || defaultFavicon}">
      <div class="tab-info">
        <div class="tab-title" title="${title}">${title}</div>
        <div class="tab-url" title="${url}">${url}</div>
      </div>
      <button class="close-btn" title="Close Tab">×</button>
    `;

    // Safe favicon fallback without inline HTML handlers
    const favImg = li.querySelector(".tab-fav");
    favImg.addEventListener("error", () => {
      favImg.src = defaultFavicon;
    });

    // Checkbox handler
    li.querySelector(".tab-select").addEventListener("change", (e) => {
      if (e.target.checked) selectedTabIds.add(tab.id);
      else selectedTabIds.delete(tab.id);
      updateStats();
    });

    // Close button handler
    li.querySelector(".close-btn").addEventListener("click", async (e) => {
      e.stopPropagation();
      if (tab.id) {
        await chrome.tabs.remove(tab.id);
        allTabs = allTabs.filter((t) => t.id !== tab.id);
        selectedTabIds.delete(tab.id);
        renderTabs(getCurrentFilteredTabs());
        updateStats();
      }
    });

    list.appendChild(li);
  });
}

function updateStats() {
  const badge = document.getElementById("tabCountBadge");
  const countText = document.getElementById("selectedCountText");
  const selectAll = document.getElementById("selectAllCheckbox");

  if (badge) badge.textContent = `${allTabs.length} Tabs`;
  if (countText) countText.textContent = `${selectedTabIds.size} selected`;
  if (selectAll) {
    selectAll.checked = selectedTabIds.size === allTabs.length && allTabs.length > 0;
  }
}

function getSelectedTabs() {
  return allTabs.filter((t) => selectedTabIds.has(t.id));
}

function exportAsDoc() {
  const selected = getSelectedTabs();
  if (selected.length === 0) return showToast("No tabs selected");

  const dateStr = new Date().toLocaleString();
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Exported Tabs</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px auto; max-width: 800px; padding: 0 20px; color: #1e293b; }
    h1 { font-size: 22px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 6px; }
    p.meta { font-size: 13px; color: #64748b; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8fafc; text-align: left; padding: 10px; border: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; }
    td { padding: 10px; border: 1px solid #e2e8f0; font-size: 13px; }
    tr:nth-child(even) { background: #fdfdfd; }
    a { color: #2563eb; text-decoration: none; word-break: break-all; }
    a:hover { text-decoration: underline; }
    .idx { width: 35px; text-align: center; color: #94a3b8; }
  </style>
</head>
<body>
  <h1>Tab Export</h1>
  <p class="meta">Exported <strong>${selected.length} tabs</strong> on ${dateStr}</p>
  <table>
    <thead><tr><th class="idx">#</th><th>Page Title</th><th>Link</th></tr></thead>
    <tbody>
  `;

  selected.forEach((tab, i) => {
    html += `<tr><td class="idx">${i + 1}</td><td><strong>${escapeHtml(tab.title || 'Untitled')}</strong></td><td><a href="${tab.url}" target="_blank">${escapeHtml(tab.url)}</a></td></tr>`;
  });

  html += `</tbody></table></body></html>`;
  downloadFile(html, `tabs-export-${Date.now()}.html`, "text/html;charset=utf-8");
  showToast("Document downloaded!");
}

function exportAsCsv() {
  const selected = getSelectedTabs();
  if (selected.length === 0) return showToast("No tabs selected");

  const rows = [["Index", "Title", "URL"]];
  selected.forEach((t, i) => {
    rows.push([i + 1, `"${(t.title || '').replace(/"/g, '""')}"`, `"${(t.url || '').replace(/"/g, '""')}"`]);
  });

  const csv = "\ufeff" + rows.map((r) => r.join(",")).join("\n");
  downloadFile(csv, `tabs-export-${Date.now()}.csv`, "text/csv;charset=utf-8;");
  showToast("CSV exported!");
}

function copyAsMarkdown() {
  const selected = getSelectedTabs();
  if (selected.length === 0) return showToast("No tabs selected");

  const md = selected.map((t) => `- [${t.title || "Untitled"}](${t.url})`).join("\n");
  navigator.clipboard.writeText(md).then(() => showToast("Copied to clipboard!"));
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function cleanUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname + (u.pathname.length > 1 ? u.pathname : "");
  } catch {
    return url;
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}