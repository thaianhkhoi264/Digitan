console.log("[Lens Auto-Clicker] Script injected into:", window.location.href);

(async () => {
  // The hash #ext-translate is appended by our background script and survives
  // Google's uploadbyurl → /search HTTP redirect natively. No storage API,
  // no race conditions.
  if (!window.location.hash.includes("ext-translate")) {
    console.log("[Lens Auto-Clicker] Not triggered by extension. Halting.");
    return;
  }

  console.log("[Lens Auto-Clicker] Extension hash verified! Starting sequence.");
  let attempts = 0;

  const clickerInterval = setInterval(() => {
    attempts++;

    // Primary: exact accessibility label.
    let translateBtn = document.querySelector('button[aria-label="Translate image"]');

    // Fallback: button whose visible text is exactly "Translate".
    if (!translateBtn) {
      translateBtn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.textContent && b.textContent.trim() === "Translate"
      );
    }

    if (translateBtn) {
      console.log(`[Lens Auto-Clicker] Button found at attempt ${attempts}!`);
      clearInterval(clickerInterval);

      // Wait for React/jsaction to finish hydrating the button.
      setTimeout(() => {
        console.log("[Lens Auto-Clicker] Executing click sequence...");

        // Full pointer + mouse event sequence to satisfy Google's jsaction listeners.
        const eventOpts = { bubbles: true, cancelable: true, view: window };
        translateBtn.dispatchEvent(new PointerEvent("pointerdown", eventOpts));
        translateBtn.dispatchEvent(new MouseEvent("mousedown", eventOpts));
        translateBtn.dispatchEvent(new PointerEvent("pointerup", eventOpts));
        translateBtn.dispatchEvent(new MouseEvent("mouseup", eventOpts));
        translateBtn.click();

        // Wipe the hash so a manual refresh doesn't re-trigger the auto-click.
        window.location.hash = "";
        console.log("[Lens Auto-Clicker] Job done.");
      }, 400);

    } else if (attempts >= 20) {
      console.warn("[Lens Auto-Clicker] Button not found after 10s. Giving up.");
      clearInterval(clickerInterval);
      window.location.hash = "";
    } else {
      console.log(`[Lens Auto-Clicker] Searching for button... (Attempt ${attempts})`);
    }
  }, 500);
})();
