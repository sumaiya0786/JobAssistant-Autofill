const { extractSkills } = require("../utils/skills");

// Extract structured data from raw resume text (deterministic mock parser).
function grabSection(text, headers) {
  const lines = String(text || "").split(/\n+/);
  const out = [];
  let capture = false;
  const headerRe = new RegExp(`^\\s*(${headers.join("|")})\\b`, "i");
  const stopRe = /^\s*(experience|education|projects?|skills?|certification|achievement|summary|objective|contact)\b/i;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (headerRe.test(line)) {
      capture = true;
      const rest = line.replace(headerRe, "").replace(/^[:\-\s]+/, "").trim();
      if (rest) out.push(rest);
      continue;
    }
    if (capture) {
      if (stopRe.test(line) && !headerRe.test(line)) break;
      out.push(line.replace(/^[-*•]\s*/, ""));
    }
  }
  return out.filter((l) => l.length > 2).slice(0, 12);
}

function parseResume(text) {
  const skills = extractSkills(text);
  return {
    skills,
    technologies: skills,
    education: grabSection(text, ["education", "academic"]),
    experience: grabSection(text, ["experience", "work experience", "employment"]),
    projects: grabSection(text, ["projects", "project"]),
    certifications: grabSection(text, ["certifications?", "certificate"]),
    achievements: grabSection(text, ["achievements?", "awards?", "honors?"]),
  };
}

module.exports = { parseResume };
