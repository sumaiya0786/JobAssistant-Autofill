// REST client for the JobAssist extension.
// Users do NOT need to enter the backend URL manually.
// Change PRODUCTION_BACKEND_URL to your actual deployed backend URL.

const PRODUCTION_BACKEND_URL = "https://your-backend-domain.com";

const Api = {

  async base() {
    // Use saved backend URL if available.
    // Otherwise automatically use the production backend.
    const savedUrl = await window.JA_Storage.getBackendUrl();

    const url = savedUrl || PRODUCTION_BACKEND_URL;

    return url.replace(/\/$/, "") + "/api";
  },


  async request(path, { method = "GET", body, isForm = false } = {}) {

    const base = await this.base();

    if (!base) {
      throw new Error("Backend URL is not configured");
    }

    const token = await window.JA_Storage.getToken();

    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (!isForm && body) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(base + path, {
      method,
      headers,
      body: isForm
        ? body
        : body
          ? JSON.stringify(body)
          : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.error || `Request failed (${res.status})`
      );
    }

    return data;
  },


  // -----------------------------
  // AUTH
  // -----------------------------

  login(email, password) {
    return this.request("/auth/login", {
      method: "POST",
      body: {
        email,
        password,
      },
    });
  },


  me() {
    return this.request("/auth/me");
  },


  // -----------------------------
  // PROFILE
  // -----------------------------

  getProfile() {
    return this.request("/profile");
  },


  completion() {
    return this.request("/profile/completion");
  },


  // -----------------------------
  // RESUME
  // -----------------------------

  listResumes() {
    return this.request("/resume");
  },


  // -----------------------------
  // JOB
  // -----------------------------

  matchJob(payload) {
    return this.request("/job/match", {
      method: "POST",
      body: payload,
    });
  },


  saveJob(payload) {
    return this.request("/job/save", {
      method: "POST",
      body: payload,
    });
  },


  // -----------------------------
  // FORM MAPPING
  // -----------------------------

  formMapping(fields) {
    return this.request("/ai/form-mapping", {
      method: "POST",
      body: {
        fields,
      },
    });
  },


  // -----------------------------
  // APPLICATION
  // -----------------------------

  addApplication(payload) {
    return this.request("/applications", {
      method: "POST",
      body: payload,
    });
  },

};


// Global export
if (typeof window !== "undefined") {
  window.JA_Api = Api;
}