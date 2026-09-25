// Autofill engine.
// Maps detected fields to saved profile values and fills them.
// Never touches submit buttons.

const Autofill = {

  // --------------------------------------------------
  // Set a normal input/textarea value.
  // Uses the native setter so React/Vue/Angular forms
  // detect the change correctly.
  // --------------------------------------------------

  setValue(el, value) {

    if (!el || value == null) {
      return false;
    }

    if (el.tagName === "SELECT") {
      return this.setSelect(el, value);
    }

    const text = String(value);

    if (!text.trim()) {
      return false;
    }

    const proto =
      el.tagName === "TEXTAREA"
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;

    const setter =
      Object.getOwnPropertyDescriptor(
        proto,
        "value"
      )?.set;

    try {

      if (setter) {
        setter.call(el, text);
      } else {
        el.value = text;
      }

    } catch (e) {

      try {
        el.value = text;
      } catch {
        return false;
      }
    }

    // React / Vue / Angular friendly events.
    el.dispatchEvent(
      new Event("input", {
        bubbles: true,
        composed: true
      })
    );

    el.dispatchEvent(
      new Event("change", {
        bubbles: true,
        composed: true
      })
    );

    el.dispatchEvent(
      new Event("blur", {
        bubbles: true,
        composed: true
      })
    );

    return true;
  },


  // --------------------------------------------------
  // Select dropdown handling.
  // --------------------------------------------------

  setSelect(el, value) {

    if (!el || value == null) {
      return false;
    }

    const wanted =
      String(value)
        .toLowerCase()
        .trim();

    if (!wanted) {
      return false;
    }

    const options =
      Array.from(el.options || []);

    if (!options.length) {
      return false;
    }

    // Exact value match.
    let option = options.find(
      (o) =>
        String(o.value)
          .toLowerCase()
          .trim() === wanted
    );

    // Exact visible text match.
    if (!option) {
      option = options.find(
        (o) =>
          String(o.textContent)
            .toLowerCase()
            .trim() === wanted
      );
    }

    // Partial visible text match.
    if (!option) {
      option = options.find(
        (o) =>
          String(o.textContent)
            .toLowerCase()
            .trim()
            .includes(wanted)
      );
    }

    if (!option) {
      return false;
    }

    el.value = option.value;

    el.dispatchEvent(
      new Event("input", {
        bubbles: true,
        composed: true
      })
    );

    el.dispatchEvent(
      new Event("change", {
        bubbles: true,
        composed: true
      })
    );

    return true;
  },


  // --------------------------------------------------
  // Visual feedback.
  // --------------------------------------------------

  highlight(el, ok) {

    if (!el) {
      return;
    }

    el.classList.remove(
      "ja-filled",
      "ja-attention"
    );

    el.classList.add(
      ok
        ? "ja-filled"
        : "ja-attention"
    );

    setTimeout(() => {

      el.classList.remove(
        "ja-filled",
        "ja-attention"
      );

    }, 2500);
  },


  // --------------------------------------------------
  // Check whether this is a field that we should
  // never automatically modify.
  // --------------------------------------------------

  isProtectedField(el) {

    if (!el) {
      return true;
    }

    const tag =
      el.tagName.toLowerCase();

    const type =
      String(el.type || "")
        .toLowerCase();

    if (
      [
        "button",
        "submit",
        "reset",
        "file",
        "password",
        "hidden",
        "checkbox",
        "radio"
      ].includes(type)
    ) {
      return true;
    }

    if (
      [
        "button"
      ].includes(tag)
    ) {
      return true;
    }

    if (
      el.disabled ||
      el.readOnly
    ) {
      return true;
    }

    return false;
  },


  // --------------------------------------------------
  // Main autofill function.
  // --------------------------------------------------

  async run(
    fields,
    profile,
    {
      useBackendForAmbiguous = true
    } = {}
  ) {

    const filled = [];
    const needsAttention = [];

    if (
      !Array.isArray(fields) ||
      !profile
    ) {
      return {
        filled,
        needsAttention,
        total: 0
      };
    }


    // ----------------------------------------------
    // First pass: local field mapping.
    // ----------------------------------------------

    const mapped = fields
      .filter(
        (f) =>
          f &&
          f.el &&
          !this.isProtectedField(f.el)
      )
      .map((f) => {

        let mapping;

        try {
          mapping =
            window.JA_FieldMapper.map(f);
        } catch (e) {

          mapping = {
            fieldKey: null,
            confidence: 0,
            ambiguous: true,
            alternatives: [],
            sensitive: false
          };
        }

        return {
          f,
          m: mapping
        };
      });


    // ----------------------------------------------
    // Backend fallback for fields that local mapper
    // could not identify.
    // ----------------------------------------------

    if (
      useBackendForAmbiguous &&
      window.JA_Api &&
      typeof window.JA_Api.formMapping === "function"
    ) {

      const need =
        mapped.filter(
          (x) =>
            !x.m.fieldKey ||
            x.m.confidence < 0.35
        );

      if (need.length) {

        try {

          const response =
            await window.JA_Api.formMapping(

              need.map((x) => ({

                label:
                  x.f.label || "",

                placeholder:
                  x.f.placeholder || "",

                name:
                  x.f.name || "",

                id:
                  x.f.id || "",

                ariaLabel:
                  x.f.ariaLabel || "",

                autocomplete:
                  x.f.autocomplete || "",

                type:
                  x.f.type || "",

                nearbyText:
                  x.f.nearbyText || "",

                semanticAttributes:
                  x.f.semanticAttributes || ""

              }))
            );


          const results =
            response?.results || [];


          need.forEach(
            (x, index) => {

              const result =
                results[index];

              if (
                result &&
                result.fieldKey
              ) {

                x.m = result;
              }
            }
          );

        } catch (e) {

          // Backend unavailable.
          // Local mapping will still be used.
          console.debug(
            "JobAssist: backend field mapping unavailable",
            e
          );
        }
      }
    }


    // ----------------------------------------------
    // Fill fields.
    // ----------------------------------------------

    for (const { f, m } of mapped) {

      if (!m || !m.fieldKey) {

        needsAttention.push({

          descriptor: f,

          reason:
            "unidentified",

          mapping: m

        });

        this.highlight(
          f.el,
          false
        );

        continue;
      }


      let value = "";

      try {

        value =
          window.JA_FieldMapper.resolveValue(
            profile,
            m.fieldKey
          );

      } catch (e) {

        value = "";
      }


      // --------------------------------------------
      // If profile doesn't contain this information,
      // leave it for manual entry.
      // --------------------------------------------

      if (
        value == null ||
        String(value).trim() === ""
      ) {

        needsAttention.push({

          descriptor: f,

          reason:
            "no-data",

          mapping: m

        });

        this.highlight(
          f.el,
          false
        );

        continue;
      }


      // --------------------------------------------
      // Sensitive fields are not automatically filled.
      // --------------------------------------------

      if (m.sensitive) {

        needsAttention.push({

          descriptor: f,

          reason:
            "sensitive",

          mapping: m,

          suggestedValue:
            value

        });

        this.highlight(
          f.el,
          false
        );

        continue;
      }


      // --------------------------------------------
      // IMPORTANT:
      //
      // Do NOT reject a normal field merely because
      // the mapper marked it ambiguous.
      //
      // If the field has a profile value and its
      // mapping has reasonable confidence, fill it.
      // --------------------------------------------

      const confidence =
        Number(m.confidence || 0);


      if (
        m.ambiguous &&
        confidence < 0.50
      ) {

        needsAttention.push({

          descriptor: f,

          reason:
            "ambiguous",

          mapping: m,

          suggestedValue:
            value

        });

        this.highlight(
          f.el,
          false
        );

        continue;
      }


      // --------------------------------------------
      // Actually write the value.
      // --------------------------------------------

      const ok =
        this.setValue(
          f.el,
          value
        );


      if (ok) {

        filled.push({

          fieldKey:
            m.fieldKey,

          label:
            window.JA_FieldMapper.label(
              m.fieldKey
            ),

          value:
            String(value)
        });

        this.highlight(
          f.el,
          true
        );

      } else {

        needsAttention.push({

          descriptor: f,

          reason:
            "could-not-set",

          mapping: m,

          suggestedValue:
            value

        });

        this.highlight(
          f.el,
          false
        );
      }
    }


    return {

      filled,

      needsAttention,

      total:
        fields.length
    };
  },


  // --------------------------------------------------
  // Manually fill one field after user chooses a key.
  // --------------------------------------------------

  fillOne(
    el,
    profile,
    fieldKey
  ) {

    if (
      !el ||
      !profile ||
      !fieldKey ||
      this.isProtectedField(el)
    ) {
      return false;
    }

    const value =
      window.JA_FieldMapper.resolveValue(
        profile,
        fieldKey
      );

    if (
      value == null ||
      String(value).trim() === ""
    ) {
      return false;
    }

    return this.setValue(
      el,
      value
    );
  }
};


if (typeof window !== "undefined") {
  window.JA_Autofill = Autofill;
}