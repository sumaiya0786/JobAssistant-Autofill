// JobAssist Form Detector
// Detects normal HTML inputs + Google Forms/custom contenteditable fields.

const FormDetector = {

  // Normal fields + Google Forms/custom widgets
  FILLABLE: [
    'input',
    'textarea',
    'select',
    '[role="textbox"]',
    '[contenteditable="true"]'
  ].join(','),

  isVisible(el) {
    const style = window.getComputedStyle(el);

    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.opacity === "0"
    ) {
      return false;
    }

    const rect = el.getBoundingClientRect();

    return rect.width > 0 && rect.height > 0;
  },

  isFillableType(el) {

    // Google Forms / custom textbox
    if (
      el.getAttribute("role") === "textbox" ||
      el.getAttribute("contenteditable") === "true"
    ) {
      return true;
    }

    if (
      el.tagName === "TEXTAREA" ||
      el.tagName === "SELECT"
    ) {
      return true;
    }

    const type = (el.type || "text").toLowerCase();

    return [
      "text",
      "email",
      "tel",
      "url",
      "number",
      "search",
      ""
    ].includes(type);
  },

  labelFor(el) {

    // ------------------------------------------
    // 1. Normal HTML <label for="">
    // ------------------------------------------

    if (el.id) {

      try {

        const label = document.querySelector(
          `label[for="${CSS.escape(el.id)}"]`
        );

        if (label && label.textContent.trim()) {
          return label.textContent.trim();
        }

      } catch (e) {}
    }


    // ------------------------------------------
    // 2. Wrapped label
    // ------------------------------------------

    const wrapper = el.closest("label");

    if (wrapper) {

      const clone = wrapper.cloneNode(true);

      clone
        .querySelectorAll(
          'input, textarea, select, [role="textbox"], [contenteditable="true"]'
        )
        .forEach(n => n.remove());

      const text = clone.textContent.trim();

      if (text) {
        return text;
      }
    }


    // ------------------------------------------
    // 3. aria-label
    // ------------------------------------------

    const ariaLabel = el.getAttribute("aria-label");

    if (ariaLabel && ariaLabel.trim()) {
      return ariaLabel.trim();
    }


    // ------------------------------------------
    // 4. aria-labelledby
    // ------------------------------------------

    const labelledBy = el.getAttribute("aria-labelledby");

    if (labelledBy) {

      const ids = labelledBy.split(/\s+/);

      const text = ids
        .map(id => document.getElementById(id)?.textContent || "")
        .join(" ")
        .trim();

      if (text) {
        return text;
      }
    }


    // ------------------------------------------
    // 5. Google Forms specific detection
    // ------------------------------------------

    const googleLabel =
      el.closest('[role="listitem"]')
        ?.querySelector(
          '[role="heading"], .M7eMe, .HoXoMd, .z12JJ'
        );

    if (googleLabel && googleLabel.textContent.trim()) {
      return googleLabel.textContent.trim();
    }


    // ------------------------------------------
    // 6. Search nearby text
    // ------------------------------------------

    let parent = el.parentElement;

    for (let i = 0; i < 5 && parent; i++) {

      const text = (parent.innerText || "")
        .replace(/\s+/g, " ")
        .trim();

      if (
        text &&
        text.length < 200 &&
        text !== el.textContent.trim()
      ) {
        return text;
      }

      parent = parent.parentElement;
    }

    return "";
  },


  nearbyText(el) {

    // Previous siblings
    let node = el.previousElementSibling;

    for (let i = 0; node && i < 5; i++) {

      const text = (node.innerText || node.textContent || "")
        .replace(/\s+/g, " ")
        .trim();

      if (text && text.length < 150) {
        return text;
      }

      node = node.previousElementSibling;
    }


    // Parent context
    let parent = el.parentElement;

    for (let i = 0; parent && i < 4; i++) {

      const clone = parent.cloneNode(true);

      clone
        .querySelectorAll(
          'input, textarea, select, [role="textbox"], [contenteditable="true"], button'
        )
        .forEach(n => n.remove());

      const text = (clone.innerText || clone.textContent || "")
        .replace(/\s+/g, " ")
        .trim();

      if (text && text.length < 200) {
        return text;
      }

      parent = parent.parentElement;
    }

    return "";
  },


  descriptor(el) {

    return {

      el,

      label: this.labelFor(el),

      placeholder:
        el.getAttribute("placeholder") || "",

      name:
        el.getAttribute("name") || "",

      id:
        el.id || "",

      ariaLabel:
        el.getAttribute("aria-label") || "",

      ariaLabelledBy:
        el.getAttribute("aria-labelledby") || "",

      autocomplete:
        el.getAttribute("autocomplete") || "",

      role:
        el.getAttribute("role") || "",

      contenteditable:
        el.getAttribute("contenteditable") || "",

      type:
        (el.type || el.tagName || "").toLowerCase(),

      nearbyText:
        this.nearbyText(el),

      tag:
        el.tagName.toLowerCase()
    };
  },


  detectFields() {

    const nodes = Array.from(
      document.querySelectorAll(this.FILLABLE)
    );

    return nodes

      .filter(el => this.isVisible(el))

      .filter(el => this.isFillableType(el))

      .filter(el => !el.disabled)

      .filter(el => !el.readOnly)

      .filter(el => {

        const type =
          (el.type || "").toLowerCase();

        return ![
          "hidden",
          "password",
          "file",
          "submit",
          "button",
          "reset",
          "checkbox",
          "radio"
        ].includes(type);
      })

      // Avoid duplicate detection
      .filter((el, index, arr) => {

        return arr.indexOf(el) === index;
      })

      .map(el => this.descriptor(el));
  },


  hasForm() {
    return this.detectFields().length >= 1;
  }
};


if (typeof window !== "undefined") {
  window.JA_FormDetector = FormDetector;
}