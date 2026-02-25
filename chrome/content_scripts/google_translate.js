// Path B handler — only runs when the extension stored a clipboardImage.
// For Path A (Google Lens URL), no content script is needed at all.
(async () => {
  let imageData;
  try {
    const result = await chrome.storage.local.get("clipboardImage");
    imageData = result.clipboardImage;
    if (!imageData) return;
    // Remove immediately so a refresh doesn't re-trigger.
    await chrome.storage.local.remove("clipboardImage");
  } catch (err) {
    console.error("[Translate Image] Storage error:", err);
    return;
  }

  // Reconstruct blob from the stored data URI and write it to the clipboard.
  // Extensions with the clipboardWrite permission can do this without a user
  // gesture. The image is in the clipboard before the user sees the banner.
  try {
    const response = await fetch(imageData.data);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob }),
    ]);
  } catch (err) {
    console.error("[Translate Image] Clipboard write failed:", err);
    showBanner("Could not copy image — try copying it manually, then press Ctrl+V.", true);
    return;
  }

  showBanner("Image ready \u2014 press Ctrl+V to paste");
})();

function showBanner(message, isError = false) {
  const banner = document.createElement("div");
  banner.textContent = message;

  Object.assign(banner.style, {
    position: "fixed",
    top: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    background: isError ? "#c5221f" : "#1a73e8",
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    fontFamily: "'Google Sans', Roboto, sans-serif",
    fontSize: "14px",
    fontWeight: "500",
    zIndex: "2147483647",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
  });

  banner.title = "Click to dismiss";
  banner.addEventListener("click", () => banner.remove());
  document.body.appendChild(banner);

  // Auto-dismiss after 30 seconds.
  setTimeout(() => banner.remove(), 30_000);
}
