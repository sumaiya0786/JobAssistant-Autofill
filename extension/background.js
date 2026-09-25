// Background service worker (MV3).
// Handles extension installation and application autofill.
// IMPORTANT: This script NEVER submits application forms.

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.storage.local.get("onboarded", ({ onboarded }) => {
      if (!onboarded) {
        chrome.storage.local.set({ onboarded: true });
      }
    });
  }
});

// ------------------------------------------------------------
// OPEN APPLICATION + AUTO-FILL
// ------------------------------------------------------------

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (!message || message.type !== "OPEN_APPLICATION") {
      return;
    }

    const url = String(message.url || "").trim();

    if (!url) {
      sendResponse({
        ok: false,
        error: "Application URL is required."
      });
      return;
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(url);

      if (
        !["http:", "https:"].includes(
          parsedUrl.protocol
        )
      ) {
        throw new Error("Invalid protocol");
      }
    } catch (error) {
      sendResponse({
        ok: false,
        error: "Please enter a valid application URL."
      });
      return;
    }

    chrome.tabs.create(
      {
        url: parsedUrl.href
      },
      (tab) => {
        if (chrome.runtime.lastError) {
          sendResponse({
            ok: false,
            error:
              chrome.runtime.lastError.message
          });
          return;
        }

        if (!tab || !Number.isInteger(tab.id)) {
          sendResponse({
            ok: false,
            error: "Could not create application tab."
          });
          return;
        }

        const tabId = tab.id;

        sendResponse({
          ok: true,
          tabId
        });

        waitForApplicationPage(tabId);
      }
    );

    return true;
  }
);

// ------------------------------------------------------------
// WAIT FOR APPLICATION PAGE
// ------------------------------------------------------------

function waitForApplicationPage(tabId) {
  let autofillSent = false;
  let timeoutId = null;

  const sendAutofillMessage = () => {
    if (autofillSent) {
      return;
    }

    autofillSent = true;

    chrome.tabs.onUpdated.removeListener(
      handleTabUpdate
    );

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    chrome.tabs.sendMessage(
      tabId,
      {
        type: "AUTO_FILL_APPLICATION"
      },
      () => {
        // Ignore pages where the content script
        // cannot receive messages.
        void chrome.runtime.lastError;
      }
    );
  };

  const handleTabUpdate = (
    updatedTabId,
    changeInfo
  ) => {
    if (updatedTabId !== tabId) {
      return;
    }

    if (changeInfo.status !== "complete") {
      return;
    }

    // Give content.js time to initialize.
    setTimeout(
      sendAutofillMessage,
      700
    );
  };

  chrome.tabs.onUpdated.addListener(
    handleTabUpdate
  );

  // Safety check in case the page finished loading
  // before the listener was attached.
  chrome.tabs.get(
    tabId,
    (tab) => {
      if (chrome.runtime.lastError) {
        chrome.tabs.onUpdated.removeListener(
          handleTabUpdate
        );
        return;
      }

      if (tab && tab.status === "complete") {
        timeoutId = setTimeout(
          sendAutofillMessage,
          700
        );
      }
    }
  );

  // Final fallback for slow/dynamic pages.
  timeoutId = setTimeout(
    sendAutofillMessage,
    5000
  );
}

// ------------------------------------------------------------
// CLEAN UP CLOSED TABS
// ------------------------------------------------------------

chrome.tabs.onRemoved.addListener((tabId) => {
  // No persistent state is required.
  // The page closing simply ends the autofill flow.
  void tabId;
});