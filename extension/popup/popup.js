const S = window.JA_Storage;
const ApiClient = window.JA_Api;

const content =
  document.getElementById("content");


async function init() {
  const token =
    await S.getToken();

  const backend =
    await S.getBackendUrl();


  if (token && backend) {
    try {
      const { user } =
        await ApiClient.me();

      renderDashboard(user);

      return;

    } catch (e) {
      await S.clearAuth();
    }
  }


  renderLogin();
}


/* ---------------------------------
   LOGIN
--------------------------------- */

function renderLogin() {

  const tpl =
    document
      .getElementById("tpl-login")
      .content
      .cloneNode(true);


  content.innerHTML = "";

  content.appendChild(tpl);


  S.getBackendUrl().then((url) => {

    const backendInput =
      document.getElementById("backend");

    if (backendInput && url) {
      backendInput.value = url;
    }

  });


  const msg =
    document.getElementById("msg");

  const btn =
    document.getElementById("login-btn");


  btn.addEventListener(
    "click",
    async () => {

      const backendUrl =
        document
          .getElementById("backend")
          .value
          .trim();


      const email =
        document
          .getElementById("email")
          .value
          .trim();


      const password =
        document
          .getElementById("password")
          .value;


      msg.className = "msg";
      msg.textContent = "";


      if (
        !backendUrl ||
        !email ||
        !password
      ) {

        msg.className =
          "msg error";

        msg.textContent =
          "All fields are required.";

        return;
      }


      btn.disabled = true;

      btn.innerHTML =
        `
          <span class="spinner"></span>
          <span>Signing in…</span>
        `;


      try {

        await S.set({
          backendUrl
        });


        const {
          token,
          user
        } =
          await ApiClient.login(
            email,
            password
          );


        await S.setAuth(
          backendUrl,
          token,
          user
        );


        renderDashboard(user);

      } catch (e) {

        msg.className =
          "msg error";

        msg.textContent =
          e.message ||
          "Sign in failed.";


        btn.disabled = false;

        btn.innerHTML =
          `
            <span>Sign in</span>
            <span class="btn-arrow">→</span>
          `;
      }
    }
  );


  /*
   * Allow Enter key to submit login.
   */
  const inputs =
    [
      "backend",
      "email",
      "password"
    ];


  inputs.forEach((id) => {

    const input =
      document.getElementById(id);

    if (!input) {
      return;
    }


    input.addEventListener(
      "keydown",
      (event) => {

        if (event.key === "Enter") {
          btn.click();
        }

      }
    );

  });
}


/* ---------------------------------
   DASHBOARD
--------------------------------- */

async function renderDashboard(user) {

  const tpl =
    document
      .getElementById("tpl-dashboard")
      .content
      .cloneNode(true);


  content.innerHTML = "";

  content.appendChild(tpl);


  /*
   * User information
   */

  document
    .getElementById("u-name")
    .textContent =
      user?.name || "User";


  document
    .getElementById("u-email")
    .textContent =
      user?.email || "";


  /*
   * User avatar
   */

  const avatar =
    document.getElementById(
      "user-avatar-letter"
    );


  if (avatar) {

    const name =
      String(
        user?.name ||
        user?.email ||
        "U"
      ).trim();


    avatar.textContent =
      name
        .charAt(0)
        .toUpperCase();
  }


  /*
   * Logout
   */

  document
    .getElementById("logout")
    .addEventListener(
      "click",
      async () => {

        await S.clearAuth();

        renderLogin();
      }
    );


  /*
   * Frontend routes
   */

  const frontend =
    "http://localhost:3000";


  const openTab =
    (path) => {

      chrome.tabs.create({
        url:
          frontend + path
      });

    };


  /*
   * Quick actions
   */

  document
    .getElementById("qa-profile")
    .addEventListener(
      "click",
      () => openTab("/profile")
    );


  document
    .getElementById("qa-resume")
    .addEventListener(
      "click",
      () => openTab("/resume")
    );


  document
    .getElementById("qa-analyze")
    .addEventListener(
      "click",
      () => openTab("/analyze")
    );


  document
    .getElementById("qa-apps")
    .addEventListener(
      "click",
      () => openTab("/applications")
    );


  /*
   * Application URL
   */

  const applicationUrlInput =
    document.getElementById(
      "application-url"
    );


  const openApplicationButton =
    document.getElementById(
      "open-application"
    );


  const applicationMsg =
    document.getElementById(
      "application-msg"
    );


  if (
    applicationUrlInput &&
    openApplicationButton &&
    applicationMsg
  ) {

    openApplicationButton.addEventListener(
      "click",
      async () => {

        const url =
          applicationUrlInput
            .value
            .trim();


        applicationMsg.className =
          "msg";

        applicationMsg.textContent =
          "";


        /*
         * Validate empty URL
         */

        if (!url) {

          applicationMsg.className =
            "msg error";

          applicationMsg.textContent =
            "Please enter an application URL.";

          return;
        }


        /*
         * Validate URL
         */

        let parsedUrl;


        try {

          parsedUrl =
            new URL(url);


          if (
            ![
              "http:",
              "https:"
            ].includes(
              parsedUrl.protocol
            )
          ) {

            throw new Error(
              "Invalid protocol"
            );
          }

        } catch (e) {

          applicationMsg.className =
            "msg error";

          applicationMsg.textContent =
            "Please enter a valid HTTP or HTTPS URL.";

          return;
        }


        /*
         * Open application
         */

        openApplicationButton.disabled =
          true;


        openApplicationButton.innerHTML =
          `
            <span class="spinner"></span>
            <span>Opening…</span>
          `;


        try {

          const response =
            await new Promise(
              (resolve, reject) => {

                chrome.runtime.sendMessage(
                  {
                    type:
                      "OPEN_APPLICATION",

                    url:
                      parsedUrl.href
                  },

                  (result) => {

                    if (
                      chrome.runtime.lastError
                    ) {

                      reject(
                        new Error(
                          chrome
                            .runtime
                            .lastError
                            .message
                        )
                      );

                      return;
                    }


                    resolve(result);
                  }
                );

              }
            );


          if (!response?.ok) {

            throw new Error(
              response?.error ||
              "Could not open application."
            );
          }


          applicationMsg.className =
            "msg success";


          applicationMsg.textContent =
            "Application opened. JobAssist will autofill available fields.";


        } catch (error) {

          applicationMsg.className =
            "msg error";


          applicationMsg.textContent =
            error.message ||
            "Could not open application.";

        } finally {

          openApplicationButton.disabled =
            false;


          openApplicationButton.innerHTML =
            `
              <span>Open &amp; Autofill</span>
              <span class="btn-arrow">→</span>
            `;
        }

      }
    );
  }


  /*
   * Load profile completion + resume
   */

  try {

    const [
      completion,
      resumes
    ] =
      await Promise.all([
        ApiClient.completion(),
        ApiClient.listResumes()
      ]);


    /*
     * Profile completion
     */

    const percent =
      Number(
        completion?.percent || 0
      );


    const safePercent =
      Math.max(
        0,
        Math.min(
          100,
          percent
        )
      );


    document
      .getElementById(
        "completion-pct"
      )
      .textContent =
        `${safePercent}%`;


    document
      .getElementById(
        "completion-bar"
      )
      .style.width =
        `${safePercent}%`;


    /*
     * Resume badge
     */

    const badge =
      document.getElementById(
        "resume-badge"
      );


    const resumeList =
      Array.isArray(
        resumes?.resumes
      )
        ? resumes.resumes
        : [];


    if (resumeList.length > 0) {

      badge.className =
        "badge ok";


      badge.textContent =
        `✓ ${resumeList.length} uploaded`;

    } else {

      badge.className =
        "badge no";


      badge.textContent =
        "None uploaded";
    }


    /*
     * Cache profile locally
     */

    try {

      const profile =
        await ApiClient.getProfile();


      await S.setProfileCache(
        profile.profile
      );

    } catch (e) {

      /*
       * Profile caching is optional.
       */

    }

  } catch (e) {

    /*
     * Keep dashboard usable even
     * if analytics/profile calls fail.
     */

  }
}


/* ---------------------------------
   START
--------------------------------- */

init();