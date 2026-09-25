// Lightweight validators for extension inputs.
const Validators = {
  isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
  },
  isUrl(v) {
    return /^https?:\/\//i.test(String(v || "").trim());
  },
  isPhone(v) {
    return /[\d][\d\s\-().+]{6,}/.test(String(v || ""));
  },
  nonEmpty(v) {
    return String(v || "").trim().length > 0;
  },
};

if (typeof window !== "undefined") window.JA_Validators = Validators;
