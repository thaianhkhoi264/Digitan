(async () => {
  // The hash #ext-translate is appended by our background script and survives
  // Google's uploadbyurl → /search HTTP redirect natively. No storage API,
  // no race conditions.
  if (!window.location.hash.includes("ext-translate")) return;

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
      clearInterval(clickerInterval);

      // Wait for React/jsaction to finish hydrating the button.
      setTimeout(() => {
        // Full pointer + mouse event sequence to satisfy Google's jsaction listeners.
        const eventOpts = { bubbles: true, cancelable: true, view: window };
        translateBtn.dispatchEvent(new PointerEvent("pointerdown", eventOpts));
        translateBtn.dispatchEvent(new MouseEvent("mousedown", eventOpts));
        translateBtn.dispatchEvent(new PointerEvent("pointerup", eventOpts));
        translateBtn.dispatchEvent(new MouseEvent("mouseup", eventOpts));
        translateBtn.click();

        // Wipe the hash so a manual refresh doesn't re-trigger the auto-click.
        window.location.hash = "";
      }, 400);

    } else if (attempts >= 20) {
      clearInterval(clickerInterval);
      window.location.hash = "";
    }
  }, 500);
})();
