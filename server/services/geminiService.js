// AI service layer (mock, deterministic). Swap the internals of these functions
// with real Gemini API calls later without changing controllers/routes.
// e.g. call GEMINI_API_KEY-backed endpoint inside analyzeJobDescription().
const { extractSkills, SKILL_DICTIONARY } = require("../utils/skills");

const AI_PROVIDER = process.env.AI_PROVIDER || "mock";

function firstLine(text) {
  const lines = String(text || "").split(/\n+/).map((l) => l.trim()).filter(Boolean);
  return lines[0] || "";
}

function guessTitle(text) {
  const m = String(text || "").match(/\b(?:job title|role|position)\s*[:\-]\s*(.+)/i);
  if (m) return m[1].split("\n")[0].trim().slice(0, 80);
  const fl = firstLine(text);
  return fl ? fl.slice(0, 80) : "Job Position";
}

function guessCompany(text) {
  const m = String(text || "").match(/\b(?:company|organization|employer)\s*[:\-]\s*(.+)/i);
  if (m) return m[1].split("\n")[0].trim().slice(0, 80);
  const m2 = String(text || "").match(/\bat\s+([A-Z][A-Za-z0-9&.\- ]{2,40})/);
  return m2 ? m2[1].trim() : "";
}

function extractEducationRequirement(text) {
  const t = String(text || "").toLowerCase();
  if (/ph\.?d|doctorate/.test(t)) return "PhD preferred";
  if (/master'?s|m\.?tech|m\.?s\b|mba/.test(t)) return "Master's degree";
  if (/bachelor'?s|b\.?tech|b\.?e\b|b\.?s\b|degree in/.test(t)) return "Bachelor's degree";
  return "Not clearly specified";
}

function extractExperienceRequirement(text) {
  const m = String(text || "").match(/(\d+)\+?\s*(?:-\s*\d+\s*)?years?/i);
  if (m) return `${m[1]}+ years`;
  if (/intern|entry level|fresher|new grad/i.test(text || "")) return "Entry level / Internship";
  return "Not clearly specified";
}

function splitPreferred(text, skills) {
  // Skills appearing after a "preferred/nice to have/plus" marker are preferred; rest required.
  const lower = String(text || "").toLowerCase();
  const markers = ["preferred", "nice to have", "nice-to-have", "bonus", "a plus", "good to have"];
  let idx = -1;
  for (const mk of markers) {
    const i = lower.indexOf(mk);
    if (i !== -1 && (idx === -1 || i < idx)) idx = i;
  }
  if (idx === -1) return { required: skills, preferred: [] };
  const requiredText = lower.slice(0, idx);
  const preferredText = lower.slice(idx);
  const required = skills.filter((s) => requiredText.includes(s.toLowerCase().split("/")[0]));
  const preferred = skills.filter((s) => !required.includes(s) && preferredText.includes(s.toLowerCase().split("/")[0]));
  const leftover = skills.filter((s) => !required.includes(s) && !preferred.includes(s));
  return { required: [...required, ...leftover], preferred };
}

function extractResponsibilities(text) {
  const lines = String(text || "").split(/\n+/).map((l) => l.trim());
  return lines
    .filter((l) => /^[-*•]/.test(l) || /responsib|develop|design|build|maintain|collaborate|implement/i.test(l))
    .map((l) => l.replace(/^[-*•]\s*/, ""))
    .filter((l) => l.length > 8)
    .slice(0, 8);
}

function guessLocation(text) {
  const m = String(text || "").match(/\b(?:location|based in)\s*[:\-]\s*(.+)/i);
  if (m) return m[1].split("\n")[0].trim().slice(0, 60);
  if (/remote/i.test(text || "")) return "Remote";
  return "";
}

// ---- Public AI interface ---------------------------------------------------

async function analyzeJobDescription({ description, title, company }) {
  const skills = extractSkills(description);
  const { required, preferred } = splitPreferred(description, skills);
  const keywords = Array.from(
    new Set(
      String(description || "")
        .toLowerCase()
        .split(/[^a-z0-9+#.]+/)
        .filter((w) => w.length > 4)
    )
  ).slice(0, 25);

  return {
    provider: AI_PROVIDER,
    title: title || guessTitle(description),
    company: company || guessCompany(description),
    requiredSkills: required,
    preferredSkills: preferred,
    allSkills: skills,
    education: extractEducationRequirement(description),
    experience: extractExperienceRequirement(description),
    responsibilities: extractResponsibilities(description),
    location: guessLocation(description),
    keywords,
    technologies: skills,
  };
}

async function analyzeResume(text) {
  return require("./resumeService").parseResume(text);
}

// Field mapping suggestion (semantic, ambiguity-aware).
async function mapFormField(descriptor) {
  return require("./formMappingService").mapField(descriptor);
}

module.exports = { analyzeJobDescription, analyzeResume, mapFormField, AI_PROVIDER };
