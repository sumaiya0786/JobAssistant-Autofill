// ============================================================
// JobAssist - Content Script
// ============================================================
// Responsible for:
// 1. Detecting application forms
// 2. Showing floating JobAssist button
// 3. Showing JobAssist panel
// 4. Checking authentication safely
// 5. Running autofill
// 6. Handling "Extension context invalidated" safely
// ============================================================

(function () {
  "use strict";

  // ------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------

  const state = {
    authed: false,
    profile: null,
    fields: [],
    result: null,
    loading: false,
    destroyed: false,
  };


  // ------------------------------------------------------------
  // EXTENSION CONTEXT SAFETY
  // ------------------------------------------------------------

  function isContextInvalidated(error) {
    if (!error) return false;

    const message = String(
      error.message || error || ""
    ).toLowerCase();

    return (
      message.includes("extension context invalidated") ||
      message.includes("context invalidated") ||
      message.includes("extension context was invalidated")
    );
  }


  function isExtensionAlive() {
    try {
      return Boolean(
        chrome &&
        chrome.runtime &&
        chrome.runtime.id
      );
    } catch (e) {
      return false;
    }
  }


  async function safeAsync(fn) {
    if (state.destroyed) return null;

    if (!isExtensionAlive()) {
      state.destroyed = true;
      return null;
    }

    try {
      return await fn();
    } catch (error) {

      if (isContextInvalidated(error)) {
        state.destroyed = true;
        return null;
      }

      throw error;
    }
  }


  // ------------------------------------------------------------
  // REMOVE OLD UI
  // ------------------------------------------------------------

  function removeExistingUI() {
    try {
      document
        .querySelectorAll(
          "#jobassist-root, #ja-root, .ja-floating-button, .ja-panel"
        )
        .forEach((el) => el.remove());
    } catch (e) {
      // Ignore DOM cleanup errors.
    }
  }


  // ------------------------------------------------------------
  // STYLES
  // ------------------------------------------------------------

  function injectStyles() {
    if (
      document.getElementById(
        "jobassist-inline-style"
      )
    ) {
      return;
    }

    const style = document.createElement("style");

    style.id = "jobassist-inline-style";

    style.textContent = `
      /* ============================================================
         JOBASSIST DARK GLASS THEME
         ============================================================ */

      #jobassist-root {
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 2147483647;

        font-family:
          Inter,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;

        color: #f8fcfb;
      }

      #jobassist-root * {
        box-sizing: border-box;
      }

      /* ------------------------------------------------------------
         FLOATING BUTTON
         ------------------------------------------------------------ */

      .ja-floating-button {
        border: 1px solid rgb(3, 138, 147);
        outline: none;
        cursor: pointer;

        display: flex;
        align-items: center;
        gap: 10px;

        background:
          linear-gradient(
            135deg,
            #013424 0%,
            #07dfbf 100%
          );

        color: #02444f;

        padding: 12px 19px;
        border-radius: 28px;

        font-size: 15px;
        font-weight: 800;

        box-shadow:
          0 10px 35px rgba(6, 182, 212, 0.20),
          0 4px 20px rgba(7, 244, 165, 0.18);

        transition:
          transform .18s ease,
          box-shadow .18s ease;
      }

      .ja-floating-button:hover {
        transform: translateY(-2px);

        box-shadow:
          0 14px 40px rgba(6, 182, 212, 0.28),
          0 6px 24px rgba(16, 185, 129, 0.24);
      }

      .ja-dot {
        width: 9px;
        height: 9px;

        border-radius: 50%;

        background: #00f985;

        box-shadow:
          0 0 0 4px rgba(255, 255, 255, 0.2),
          0 0 14px rgb(3, 53, 40);
      }

      /* ------------------------------------------------------------
         PANEL
         ------------------------------------------------------------ */

      .ja-panel {
        width: 540px;
        max-width: calc(100vw - 30px);

        max-height: 620px;

        background:
          linear-gradient(
            145deg,
            #0b1927 0%,
            #07131f 100%
          );

        border: 1px solid rgba(255,255,255,.09);

        border-radius: 20px;

        box-shadow:
          0 25px 80px rgba(0,0,0,.55),
          0 0 50px rgba(6,182,212,.06);

        overflow: hidden;

        display: none;
        flex-direction: column;

        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }

      .ja-panel.ja-open {
        display: flex;
      }

      /* ------------------------------------------------------------
         HEADER
         ------------------------------------------------------------ */

      .ja-header {
        min-height: 78px;

        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: 17px 20px;

        background:
          linear-gradient(
            135deg,
            rgba(16,185,129,.20),
            rgba(6,182,212,.12)
          );

        border-bottom: 1px solid rgba(255,255,255,.08);

        color: white;
      }

      .ja-title-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .ja-logo {
        width: 38px;
        height: 38px;

        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 11px;

        background:
          linear-gradient(
            135deg,
            #10b981,
            #06b6d4
          );

        color: white;

        font-size: 19px;

        box-shadow:
          0 8px 24px rgba(16,185,129,.18);
      }

      .ja-title {
        font-size: 20px;
        font-weight: 800;
        letter-spacing: -.02em;
      }

      .ja-close {
        width: 34px;
        height: 34px;

        border: 1px solid rgba(255,255,255,.08);

        border-radius: 9px;

        background: rgba(255,255,255,.04);

        color: #94a3b8;

        cursor: pointer;

        font-size: 22px;
        line-height: 1;

        display: flex;
        align-items: center;
        justify-content: center;

        transition:
          background .18s ease,
          color .18s ease;
      }

      .ja-close:hover {
        background: rgba(255,255,255,.09);
        color: white;
      }

      /* ------------------------------------------------------------
         BODY
         ------------------------------------------------------------ */

      .ja-body {
        padding: 20px;

        overflow-y: auto;

        max-height: 542px;

        background:
          linear-gradient(
            180deg,
            #07131f 0%,
            #06111c 100%
          );
      }

      /* ------------------------------------------------------------
         STATUS
         ------------------------------------------------------------ */

      .ja-status {
        padding: 14px 16px;

        border-radius: 12px;

        background: rgba(255,255,255,.035);

        border: 1px solid rgba(255,255,255,.07);

        color: #cbd5e1;

        font-size: 14px;
        line-height: 1.5;

        margin-bottom: 14px;
      }

      .ja-status.success {
        background: rgba(16,185,129,.08);

        border-color: rgba(16,185,129,.20);

        color: #a7f3d0;
      }

      .ja-status.warning {
        background: rgba(245,158,11,.08);

        border-color: rgba(245,158,11,.20);

        color: #fcd34d;
      }

      .ja-status.error {
        background: rgba(239,68,68,.08);

        border-color: rgba(239,68,68,.20);

        color: #fca5a5;
      }

      /* ------------------------------------------------------------
         ACTION BUTTONS
         ------------------------------------------------------------ */

      .ja-action {
        width: 100%;

        border-radius: 11px;

        padding: 13px 16px;

        cursor: pointer;

        font-size: 14px;
        font-weight: 700;

        margin-top: 10px;

        transition:
          transform .18s ease,
          box-shadow .18s ease,
          opacity .18s ease;
      }

      .ja-action:hover {
        transform: translateY(-1px);
      }

      .ja-primary {
        border: none;

        background:
          linear-gradient(
            135deg,
            #10b981,
            #06b6d4
          );

        color: #06101a;

        box-shadow:
          0 8px 25px rgba(16,185,129,.16);
      }

      .ja-primary:hover {
        box-shadow:
          0 10px 30px rgba(16,185,129,.25);
      }

      .ja-secondary {
        border: 1px solid rgba(255,255,255,.09);

        background: rgba(255,255,255,.04);

        color: #e2e8f0;
      }

      .ja-secondary:hover {
        background: rgba(255,255,255,.07);
      }

      .ja-action:disabled {
        opacity: .55;
        cursor: not-allowed;
        transform: none;
      }

      /* ------------------------------------------------------------
         SECTION TITLES
         ------------------------------------------------------------ */

      .ja-section-title {
        margin: 18px 0 10px;

        font-size: 11px;
        font-weight: 800;

        color: #64748b;

        text-transform: uppercase;
        letter-spacing: 1px;
      }

      /* ------------------------------------------------------------
         FIELD ROWS
         ------------------------------------------------------------ */

      .ja-field {
        display: flex;
        align-items: center;
        justify-content: space-between;

        gap: 12px;

        padding: 12px 14px;

        margin-bottom: 8px;

        border-radius: 12px;

        background: rgba(255,255,255,.035);

        border: 1px solid rgba(255,255,255,.055);

        transition:
          background .18s ease,
          border-color .18s ease;
      }

      .ja-field:hover {
        background: rgba(255,255,255,.055);

        border-color: rgba(255,255,255,.09);
      }

      .ja-field-left {
        display: flex;
        align-items: center;
        gap: 10px;

        min-width: 0;
      }

      .ja-check {
        color: #34d399;

        font-weight: 800;

        display: flex;
        align-items: center;
        justify-content: center;

        width: 20px;
        height: 20px;

        border-radius: 50%;

        background: rgba(16,185,129,.10);
      }

      .ja-warning {
        color: #fbbf24;

        font-weight: 800;

        display: flex;
        align-items: center;
        justify-content: center;

        width: 20px;
        height: 20px;

        border-radius: 50%;

        background: rgba(245,158,11,.10);
      }

      .ja-field-name {
        font-size: 13px;
        font-weight: 650;

        color: #e2e8f0;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .ja-field-value {
        max-width: 220px;

        font-size: 11px;

        color: #64748b;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .ja-empty {
        color: #64748b;

        font-size: 14px;

        padding: 18px 0;

        text-align: center;
      }

      /* ------------------------------------------------------------
         SCROLLBAR
         ------------------------------------------------------------ */

      .ja-body::-webkit-scrollbar {
        width: 7px;
      }

      .ja-body::-webkit-scrollbar-track {
        background: transparent;
      }

      .ja-body::-webkit-scrollbar-thumb {
        background: rgba(148,163,184,.20);
        border-radius: 999px;
      }

      .ja-body::-webkit-scrollbar-thumb:hover {
        background: rgba(148,163,184,.35);
      }

      /* ------------------------------------------------------------
         MOBILE
         ------------------------------------------------------------ */

      @media (max-width: 650px) {
        .ja-panel {
          width: calc(100vw - 20px);

          max-height: calc(100vh - 30px);
        }

        .ja-body {
          max-height: calc(100vh - 108px);
        }

        #jobassist-root {
          right: 10px;
          bottom: 10px;
        }

        .ja-field-value {
          max-width: 130px;
        }
      }
    `;

    document.documentElement.appendChild(style);
  }


  // ------------------------------------------------------------
  // CREATE UI
  // ------------------------------------------------------------

  function createUI() {

    if (state.destroyed) return;

    removeExistingUI();
    injectStyles();

    const root = document.createElement("div");

    root.id = "jobassist-root";

    root.innerHTML = `
      <button
        class="ja-floating-button"
        id="ja-floating-button"
        type="button"
      >
        <span class="ja-dot"></span>
        <span>JobAssist</span>
      </button>

      <div
        class="ja-panel"
        id="ja-panel"
      >

        <div class="ja-header">

          <div class="ja-title-wrap">

            <div class="ja-logo">
              ✦
            </div>

            <div class="ja-title">
              JobAssist
            </div>

          </div>

          <button
            class="ja-close"
            id="ja-close"
            type="button"
            aria-label="Close"
          >
            ×
          </button>

        </div>

        <div
          class="ja-body"
          id="ja-body"
        ></div>

      </div>
    `;

    document.documentElement.appendChild(root);

    const floatingButton =
      root.querySelector("#ja-floating-button");

    const panel =
      root.querySelector("#ja-panel");

    const close =
      root.querySelector("#ja-close");

    floatingButton.addEventListener(
      "click",
      () => {

        if (state.destroyed) return;

        panel.classList.toggle("ja-open");

        if (panel.classList.contains("ja-open")) {
          refreshAndRender();
        }
      }
    );

    close.addEventListener(
      "click",
      () => {
        panel.classList.remove("ja-open");
      }
    );
  }


  // ------------------------------------------------------------
  // HTML ESCAPE
  // ------------------------------------------------------------

  function escapeHtml(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  // ------------------------------------------------------------
  // RENDER BODY
  // ------------------------------------------------------------

  function renderBody() {

    if (state.destroyed) return;

    const body =
      document.getElementById("ja-body");

    if (!body) return;

    // ----------------------------------------------------------
    // LOADING
    // ----------------------------------------------------------

    if (state.loading) {

      body.innerHTML = `
        <div class="ja-status">
          Checking your JobAssist profile...
        </div>
      `;

      return;
    }


    // ----------------------------------------------------------
    // NOT AUTHENTICATED
    // ----------------------------------------------------------

    if (!state.authed) {

      body.innerHTML = `
        <div class="ja-status warning">
          Please sign in to JobAssist from the extension popup
          before using autofill.
        </div>

        <button
          class="ja-action ja-secondary"
          id="ja-scan"
          type="button"
        >
          Scan Form
        </button>
      `;

      const scan =
        document.getElementById("ja-scan");

      if (scan) {
        scan.addEventListener(
          "click",
          () => {

            state.fields =
              window.JA_FormDetector
                ? window.JA_FormDetector.detectFields()
                : [];

            renderBody();
          }
        );
      }

      return;
    }


    // ----------------------------------------------------------
    // AUTHENTICATED
    // ----------------------------------------------------------

    const fields = state.fields || [];

    let html = `
      <div class="ja-status success">
        ${
          fields.length
            ? `${fields.length} form fields detected.`
            : "No fillable form fields detected."
        }
      </div>
    `;


    if (fields.length > 0) {

      html += `
        <button
          class="ja-action ja-primary"
          id="ja-autofill"
          type="button"
        >
          Autofill Form
        </button>
      `;

    }


    // ----------------------------------------------------------
    // RESULT
    // ----------------------------------------------------------

    if (state.result) {

      const filled =
        state.result.filled || [];

      const attention =
        state.result.needsAttention || [];


      // FILLED

      if (filled.length) {

        html += `
          <div class="ja-section-title">
            Filled
          </div>
        `;

        for (const item of filled) {

          html += `
            <div class="ja-field">

              <div class="ja-field-left">

                <span class="ja-check">
                  ✓
                </span>

                <span class="ja-field-name">
                  ${escapeHtml(item.label)}
                </span>

              </div>

              <span class="ja-field-value">
                ${escapeHtml(item.value)}
              </span>

            </div>
          `;
        }
      }


      // NEEDS ATTENTION

      if (attention.length) {

        html += `
          <div class="ja-section-title">
            ${attention.length} Need Your Attention
          </div>
        `;

        for (const item of attention) {

          const label =
            item.descriptor?.label ||
            item.mapping?.fieldKey ||
            "Unknown field";

          let reason =
            "Could not confidently identify";

          if (item.reason === "no-data") {
            reason = "No data in your profile";
          }

          if (item.reason === "sensitive") {
            reason = "Needs your confirmation";
          }

          if (item.reason === "ambiguous") {
            reason = "Could not confidently identify";
          }

          if (item.reason === "could-not-set") {
            reason = "Could not fill this field";
          }

          html += `
            <div class="ja-field">

              <div class="ja-field-left">

                <span class="ja-warning">
                  ⚠
                </span>

                <span class="ja-field-name">
                  ${escapeHtml(label)}
                </span>

              </div>

              <span class="ja-field-value">
                ${escapeHtml(reason)}
              </span>

            </div>
          `;
        }
      }
    }


    if (
      state.result &&
      !state.result.filled?.length &&
      !state.result.needsAttention?.length
    ) {

      html += `
        <div class="ja-empty">
          No fields were filled.
        </div>
      `;
    }


    body.innerHTML = html;


    // ----------------------------------------------------------
    // AUTOFILL BUTTON
    // ----------------------------------------------------------

    const autofill =
      document.getElementById("ja-autofill");

    if (autofill) {

      autofill.addEventListener(
        "click",
        () => {
          runAutofill();
        }
      );
    }
  }
  // ------------------------------------------------------------
  // AUTH CHECK
  // ------------------------------------------------------------

  async function checkAuth() {

    return safeAsync(async () => {

      if (!window.JA_Storage) {
        return false;
      }

      if (
        typeof window.JA_Storage.isAuthenticated ===
        "function"
      ) {

        return await window.JA_Storage
          .isAuthenticated();
      }

      const token =
        await window.JA_Storage.getToken();

      const backend =
        await window.JA_Storage.getBackendUrl();

      return Boolean(
        token &&
        backend
      );
    });
  }


  // ------------------------------------------------------------
  // LOAD PROFILE
  // ------------------------------------------------------------

  async function loadProfile() {

    return safeAsync(async () => {

      // First use cached profile.
      if (window.JA_Storage) {

        const cached =
          await window.JA_Storage
            .getProfileCache();

        if (cached) {
          state.profile = cached;
        }
      }


      // Then try fresh profile from backend.
      if (
        window.JA_Api &&
        typeof window.JA_Api.getProfile ===
        "function"
      ) {

        try {

          const profile =
            await window.JA_Api.getProfile();

          if (profile) {

            state.profile =
              profile.profile ||
              profile;

            if (
              window.JA_Storage &&
              typeof window.JA_Storage
                .setProfileCache === "function"
            ) {

              await window.JA_Storage
                .setProfileCache(
                  state.profile
                );
            }
          }

        } catch (error) {

          if (isContextInvalidated(error)) {
            state.destroyed = true;
            return null;
          }

          // Backend may be unavailable.
          // Cached profile can still be used.
        }
      }

      return state.profile;
    });
  }


  // ------------------------------------------------------------
  // DETECT FORM
  // ------------------------------------------------------------

  function detectForm() {

    if (
      !window.JA_FormDetector ||
      typeof window.JA_FormDetector.detectFields !==
        "function"
    ) {

      state.fields = [];

      return [];
    }

    try {

      state.fields =
        window.JA_FormDetector
          .detectFields();

      return state.fields;

    } catch (error) {

      console.error(
        "JobAssist: form detection failed",
        error
      );

      state.fields = [];

      return [];
    }
  }


  // ------------------------------------------------------------
  // RUN AUTOFILL
  // ------------------------------------------------------------

  async function runAutofill() {

    if (state.destroyed) return;

    if (!state.profile) {

      await loadProfile();

      if (state.destroyed) return;
    }


    if (!state.profile) {

      state.result = {
        filled: [],
        needsAttention: [],
        total: state.fields.length,
      };

      renderBody();

      return;
    }


    state.loading = true;

    renderBody();


    try {

      detectForm();


      if (
        !window.JA_Autofill ||
        typeof window.JA_Autofill.run !==
          "function"
      ) {

        throw new Error(
          "Autofill engine is unavailable."
        );
      }


      const result =
        await window.JA_Autofill.run(
          state.fields,
          state.profile,
          {
            useBackendForAmbiguous: true,
          }
        );


      if (state.destroyed) return;

      state.result = result;

    } catch (error) {

      if (isContextInvalidated(error)) {

        state.destroyed = true;

        return;
      }


      console.error(
        "JobAssist: autofill failed",
        error
      );


      state.result = {
        filled: [],
        needsAttention: [],
        total: state.fields.length,
        error:
          error.message ||
          "Autofill failed.",
      };

    } finally {

      state.loading = false;

      if (!state.destroyed) {
        renderBody();
      }
    }
  }


  // ------------------------------------------------------------
  // REFRESH + RENDER
  // ------------------------------------------------------------

  async function refreshAndRender() {

    if (state.destroyed) return;


    state.loading = true;

    renderBody();


    try {

      // Detect fields immediately.
      detectForm();


      // Check authentication.
      const authed =
        await checkAuth();


      // Context was invalidated.
      if (state.destroyed) {
        return;
      }


      state.authed =
        Boolean(authed);


      // If authenticated, load profile.
      if (state.authed) {

        await loadProfile();

        if (state.destroyed) {
          return;
        }
      }


    } catch (error) {

      if (isContextInvalidated(error)) {

        state.destroyed = true;

        return;
      }


      state.authed = false;

      console.error(
        "JobAssist: auth check failed",
        error
      );

    } finally {

      state.loading = false;

      if (!state.destroyed) {
        renderBody();
      }
    }
  }


  // ------------------------------------------------------------
  // WATCH FOR PAGE CHANGES
  // ------------------------------------------------------------

  function setupMutationObserver() {

    try {

      const observer =
        new MutationObserver(() => {

          if (state.destroyed) {
            observer.disconnect();
            return;
          }

          // Only update the field list.
          // Don't continuously call backend.
          detectForm();
        });


      observer.observe(
        document.documentElement,
        {
          childList: true,
          subtree: true,
        }
      );

    } catch (error) {
      // Ignore observer errors.
    }
  }


  // ------------------------------------------------------------
  // INITIALIZE
  // ------------------------------------------------------------

  async function initialize() {

    try {

      if (!isExtensionAlive()) {
        state.destroyed = true;
        return;
      }


      createUI();

      detectForm();

      setupMutationObserver();

      await refreshAndRender();

    } catch (error) {

      if (isContextInvalidated(error)) {
        state.destroyed = true;
        return;
      }

      console.error(
        "JobAssist: initialization failed",
        error
      );
    }
  }


  // ------------------------------------------------------------
  // PAGE LOAD
  // ------------------------------------------------------------

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      {
        once: true,
      }
    );

  } else {

    initialize();

  }


  // ------------------------------------------------------------
  // AUTO-FILL MESSAGE FROM BACKGROUND
  // ------------------------------------------------------------

  if (
    typeof chrome !== "undefined" &&
    chrome.runtime
  ) {

    chrome.runtime.onMessage.addListener(
      (message) => {

        if (
          !message ||
          message.type !== "AUTO_FILL_APPLICATION"
        ) {
          return;
        }

        if (state.destroyed) {
          return;
        }

        runAutofill();
      }
    );
  }

})();