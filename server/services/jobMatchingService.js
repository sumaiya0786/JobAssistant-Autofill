// Deterministic, transparent resume-job matching. No skill is ever invented:
// a skill only counts as "matched" if it is present in the user's profile/resume.

function norm(s) {
  return String(s || "").toLowerCase().trim();
}

function collectUserSkills(profile, resumeParsed) {
  const set = new Map(); // normalized -> display
  const add = (arr) => (arr || []).forEach((s) => s && set.set(norm(s), s));
  if (profile && profile.professional) {
    add(profile.professional.skills);
    add(profile.professional.programmingLanguages);
    add(profile.professional.frameworks);
    add(profile.professional.tools);
  }
  if (resumeParsed) {
    add(resumeParsed.skills);
    add(resumeParsed.technologies);
  }
  return set;
}

function meetsEducation(profile, requirement) {
  const req = norm(requirement);
  if (!req || req.includes("not clearly")) return { meets: true, note: "No specific requirement" };
  const degrees = (profile?.education || []).map((e) => norm(e.degree)).join(" ");
  if (req.includes("phd")) return { meets: /ph\.?d|doctor/.test(degrees), note: requirement };
  if (req.includes("master")) return { meets: /master|m\.?tech|m\.?s|mba/.test(degrees), note: requirement };
  if (req.includes("bachelor")) return { meets: /bachelor|b\.?tech|b\.?e|b\.?s|degree/.test(degrees) || degrees.length > 0, note: requirement };
  return { meets: true, note: requirement };
}

function meetsExperience(profile, requirement) {
  const m = norm(requirement).match(/(\d+)/);
  const req = m ? parseInt(m[1], 10) : 0;
  const have = parseInt(String(profile?.professional?.experienceYears || "0").match(/\d+/)?.[0] || "0", 10);
  if (norm(requirement).includes("entry") || norm(requirement).includes("intern")) {
    return { meets: true, note: `${requirement} — you qualify` };
  }
  return { meets: have >= req, note: `Requires ${req}+ yrs, you have ~${have} yrs` };
}

function computeMatch({ profile, resumeParsed, jobAnalysis }) {
  const userSkills = collectUserSkills(profile, resumeParsed);
  const required = jobAnalysis.requiredSkills || [];
  const preferred = jobAnalysis.preferredSkills || [];
  const allJobSkills = Array.from(new Set([...required, ...preferred]));

  const strongMatches = [];
  const missing = [];
  for (const skill of allJobSkills) {
    if (userSkills.has(norm(skill))) strongMatches.push(skill);
    else missing.push(skill);
  }

  // Transparent weighted score.
  const skillWeight = 0.7;
  const eduWeight = 0.15;
  const expWeight = 0.15;

  let skillScore = 0;
  if (allJobSkills.length > 0) {
    // required skills worth more than preferred
    const reqMatched = required.filter((s) => userSkills.has(norm(s))).length;
    const prefMatched = preferred.filter((s) => userSkills.has(norm(s))).length;
    const reqTotal = Math.max(required.length, 1);
    const prefTotal = Math.max(preferred.length, 1);
    const reqRatio = required.length ? reqMatched / reqTotal : 1;
    const prefRatio = preferred.length ? prefMatched / prefTotal : 1;
    skillScore = reqRatio * 0.75 + prefRatio * 0.25;
  } else {
    skillScore = 0.5;
  }

  const edu = meetsEducation(profile, jobAnalysis.education);
  const exp = meetsExperience(profile, jobAnalysis.experience);

  const raw = skillScore * skillWeight + (edu.meets ? 1 : 0.4) * eduWeight + (exp.meets ? 1 : 0.4) * expWeight;
  const score = Math.round(raw * 100);

  let recommendation;
  if (score >= 80) recommendation = "Excellent match — you should definitely apply.";
  else if (score >= 65) recommendation = "Good match — you should consider applying.";
  else if (score >= 45) recommendation = "Partial match — applying is worthwhile if you highlight relevant strengths.";
  else recommendation = "Weak match — consider upskilling in the missing areas before applying.";

  return {
    score,
    strongMatches,
    missing,
    education: edu,
    experience: exp,
    recommendation,
    breakdown: {
      skillScore: Math.round(skillScore * 100),
      requiredTotal: required.length,
      requiredMatched: required.filter((s) => userSkills.has(norm(s))).length,
      preferredTotal: preferred.length,
      preferredMatched: preferred.filter((s) => userSkills.has(norm(s))).length,
    },
    suggestions: buildSuggestions({ userSkills, required, preferred, missing, strongMatches }),
  };
}

function buildSuggestions({ userSkills, missing, strongMatches }) {
  const out = [];
  if (strongMatches.length) {
    out.push({
      type: "strength",
      text: `Your experience with ${strongMatches.slice(0, 3).join(", ")} aligns well with this role — highlight it prominently.`,
    });
  }
  for (const skill of missing.slice(0, 3)) {
    out.push({
      type: "gap",
      text: `"${skill}" is requested but not clearly present in your profile/resume. Add it only if you have genuine experience.`,
    });
  }
  if (!missing.length && strongMatches.length) {
    out.push({ type: "info", text: "You cover all the listed skills — tailor your resume summary to this job's keywords." });
  }
  return out;
}

module.exports = { computeMatch, collectUserSkills };
