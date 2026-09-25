// Chrome Storage helpers.
// All persistent extension data lives in chrome.storage.local.

const Storage = {

  // --------------------------------------------------
  // GET
  // --------------------------------------------------

  async get(keys) {
    return new Promise((resolve, reject) => {

      chrome.storage.local.get(
        keys,
        (result) => {

          if (chrome.runtime.lastError) {
            reject(
              new Error(
                chrome.runtime.lastError.message
              )
            );
            return;
          }

          resolve(result || {});
        }
      );

    });
  },


  // --------------------------------------------------
  // SET
  // --------------------------------------------------

  async set(obj) {
    return new Promise((resolve, reject) => {

      chrome.storage.local.set(
        obj,
        () => {

          if (chrome.runtime.lastError) {
            reject(
              new Error(
                chrome.runtime.lastError.message
              )
            );
            return;
          }

          resolve();
        }
      );

    });
  },


  // --------------------------------------------------
  // REMOVE
  // --------------------------------------------------

  async remove(keys) {
    return new Promise((resolve, reject) => {

      chrome.storage.local.remove(
        keys,
        () => {

          if (chrome.runtime.lastError) {
            reject(
              new Error(
                chrome.runtime.lastError.message
              )
            );
            return;
          }

          resolve();
        }
      );

    });
  },


  // --------------------------------------------------
  // BACKEND URL
  // --------------------------------------------------

  async getBackendUrl() {

    const {
      backendUrl
    } = await this.get(
      "backendUrl"
    );

    return backendUrl || "";
  },


  // --------------------------------------------------
  // AUTH TOKEN
  // --------------------------------------------------

  async getToken() {

    const {
      token
    } = await this.get(
      "token"
    );

    return token || "";
  },


  // --------------------------------------------------
  // AUTH
  // --------------------------------------------------

  async setAuth(
    backendUrl,
    token,
    user
  ) {

    await this.set({
      backendUrl,
      token,
      user
    });
  },


  async clearAuth() {

    await this.remove([
      "token",
      "user"
    ]);
  },


  // --------------------------------------------------
  // PROFILE CACHE
  // --------------------------------------------------

  async getProfileCache() {

    const {
      profileCache
    } = await this.get(
      "profileCache"
    );

    return profileCache || null;
  },


  async setProfileCache(
    profile
  ) {

    await this.set({

      profileCache:
        profile,

      profileCachedAt:
        Date.now()

    });
  },


  // --------------------------------------------------
  // GET SAVED USER
  // --------------------------------------------------

  async getUser() {

    const {
      user
    } = await this.get(
      "user"
    );

    return user || null;
  },


  // --------------------------------------------------
  // CHECK AUTH
  // --------------------------------------------------

  async isAuthenticated() {

    const token =
      await this.getToken();

    const backend =
      await this.getBackendUrl();

    return Boolean(
      token &&
      backend
    );
  }

};


// --------------------------------------------------
// GLOBAL EXPORT
// --------------------------------------------------

if (
  typeof window !== "undefined"
) {
  window.JA_Storage =
    Storage;
}

if (
  typeof self !== "undefined"
) {
  self.JA_Storage =
    Storage;
}