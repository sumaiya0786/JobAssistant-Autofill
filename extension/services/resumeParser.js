// Client-side resume text helper. Heavy parsing (PDF -> structured data) happens
// on the secure backend (services/resumeService.js). This stub exists so resume
// text can be normalized before upload if ever needed client-side.
const ResumeParser = {
  normalizeText(text) {
    return String(text || "").replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
  },
};

if (typeof window !== "undefined") window.JA_ResumeParser = ResumeParser;
