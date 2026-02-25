chrome.contextMenus.create({
  id: "translate-image",
  title: "Digitranslate!",
  contexts: ["image"],
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== "translate-image") return;

  const srcUrl = info.srcUrl;
  if (!srcUrl) return;

  // Path A — Google Lens URL.
  // Lens fetches the image from Google's servers, so this only works for
  // publicly accessible URLs. It's zero-friction: no content script, no
  // clipboard touch, no DOM injection.
  if (!srcUrl.startsWith("data:")) {
    const encodedUrl = encodeURIComponent(srcUrl);
    // Append a hash tag so lens_clicker.js can identify extension-opened tabs.
    // HTTP redirects carry the hash to the destination, so it survives the
    // uploadbyurl → /search redirect without any storage API involved.
    await chrome.tabs.create({
      url: `https://lens.google.com/uploadbyurl?url=${encodedUrl}#ext-translate`,
    });
    return;
  }

  // Path B — Clipboard-assisted fallback.
  // Triggered for data: URIs (inline images) that Lens can't fetch by URL.
  // We write the image to the clipboard, open Google Translate's image mode,
  // and show a banner prompting the user to press Ctrl+V. The paste event is
  // real (isTrusted: true) so GT accepts it.
  try {
    const mimeMatch = srcUrl.match(/^data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/png";

    await chrome.storage.local.set({
      clipboardImage: { data: srcUrl, mimeType },
    });

    await chrome.tabs.create({
      url: "https://translate.google.com/?sl=auto&tl=en&op=images",
    });
  } catch (err) {
    console.error("[Translate Image] Path B setup failed:", err);
  }
});
