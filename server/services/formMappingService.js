// Semantic form-field mapping. Given a field descriptor extracted from a web form,
// determine which profile field it most likely corresponds to. Returns the best
// canonical key, a confidence score, and alternatives when the field is ambiguous.
//
// This mirrors the extension's local fieldMapper.js so ambiguous/unknown fields
// can also be resolved server-side (the "AI" fallback). Deterministic + transparent.

const RULES = [
  { key: "fullName", any: ["full name", "your name", "name of applicant", "candidate name", "applicant name"], name: ["fullname", "full_name", "name"], autocomplete: ["name"] },
  { key: "firstName", any: ["first name", "given name", "forename"], name: ["firstname", "first_name", "fname", "givenname"], autocomplete: ["given-name"] },
  { key: "lastName", any: ["last name", "surname", "family name"], name: ["lastname", "last_name", "lname", "surname", "familyname"], autocomplete: ["family-name"] },
  { key: "email", any: ["email", "e-mail", "mail address", "professional email"], name: ["email", "e_mail", "mail"], type: ["email"], autocomplete: ["email"] },
  { key: "phone", any: ["phone", "mobile", "contact number", "cell", "telephone", "phone number"], name: ["phone", "mobile", "tel", "contact"], type: ["tel"], autocomplete: ["tel"] },
  { key: "dateOfBirth", any: ["date of birth", "dob", "birth date", "birthday"], name: ["dob", "birth", "dateofbirth"], autocomplete: ["bday"] },
  { key: "linkedin", any: ["linkedin", "linked in profile"], name: ["linkedin"], strongTokens: ["linkedin"] },
  { key: "github", any: ["github", "git hub"], name: ["github"], strongTokens: ["github"] },
  { key: "portfolio", any: ["portfolio", "personal website", "website", "professional profile url", "profile url"], name: ["portfolio", "website", "url"] },
  { key: "university", any: ["university", "college", "school", "institution", "alma mater"], name: ["university", "college", "school", "institution"] },
  { key: "degree", any: ["degree", "qualification", "course"], name: ["degree", "qualification"] },
  { key: "branch", any: ["branch", "major", "specialization", "field of study", "stream"], name: ["branch", "major", "specialization"] },
  { key: "graduationYear", any: ["graduation year", "year of passing", "passing year", "grad year", "expected graduation"], name: ["gradyear", "graduation", "passingyear"] },
  { key: "cgpa", any: ["cgpa", "gpa", "grade point", "percentage", "marks"], name: ["cgpa", "gpa"] },
  { key: "experienceYears", any: ["years of experience", "total experience", "work experience", "experience (years)", "yrs of exp"], name: ["experience", "yoe", "totalexp"] },
  { key: "currentRole", any: ["current role", "current title", "current position", "current designation", "job title"], name: ["currentrole", "currenttitle", "designation"] },
  { key: "targetRole", any: ["desired role", "target role", "position applying", "role applying for", "desired position"], name: ["targetrole", "desiredrole"] },
  { key: "location", any: ["location", "current location", "where are you based", "city you live"], name: ["location"] },
  { key: "address", any: ["address", "street address", "residential address"], name: ["address", "street"], autocomplete: ["street-address"] },
  { key: "city", any: ["city", "town"], name: ["city", "town"], autocomplete: ["address-level2"] },
  { key: "state", any: ["state", "province", "region"], name: ["state", "province"], autocomplete: ["address-level1"] },
  { key: "country", any: ["country", "nation"], name: ["country"], autocomplete: ["country", "country-name"] },
  { key: "pincode", any: ["pincode", "pin code", "zip", "zip code", "postal code", "postcode"], name: ["pincode", "zip", "postal", "postcode"], autocomplete: ["postal-code"] },
  { key: "noticePeriod", any: ["notice period", "availability to join", "when can you start", "notice"], name: ["notice", "noticeperiod"] },
  { key: "workAuthorization", any: ["work authorization", "authorized to work", "visa status", "right to work", "sponsorship", "work permit"], name: ["authorization", "visa", "workauth"] },
  { key: "willingToRelocate", any: ["willing to relocate", "open to relocation", "relocate"], name: ["relocate", "relocation"] },
  { key: "skills", any: ["skills", "key skills", "technical skills", "core competencies"], name: ["skills"] },
  { key: "coverLetter", any: ["cover letter", "why do you want", "tell us about yourself", "message", "additional information", "anything else"], name: ["coverletter", "message", "about"] },
];

// Fields we must NOT auto-guess without user confirmation.
const SENSITIVE_KEYS = new Set(["workAuthorization", "willingToRelocate"]);

// Fields that commonly collide -> present as choices when ambiguous.
const AMBIGUOUS_GROUPS = [
  ["linkedin", "portfolio", "github"],
  ["fullName", "firstName", "lastName"],
];

function normalize(str) {
  return String(str || "").toLowerCase().replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim();
}

function scoreRule(rule, ctx) {
  let score = 0;
  const hay = ctx.text;
  const nameId = ctx.nameId;

  for (const phrase of rule.any || []) {
    if (hay.includes(phrase)) score += phrase.includes(" ") ? 55 : 40;
  }
  for (const n of rule.name || []) {
    if (nameId.includes(n)) score += 35;
  }
  for (const t of rule.strongTokens || []) {
    if (hay.includes(t) || nameId.includes(t)) score += 60;
  }
  if (rule.type && ctx.type && rule.type.includes(ctx.type)) score += 45;
  if (rule.autocomplete && ctx.autocomplete && rule.autocomplete.includes(ctx.autocomplete)) score += 70;
  return score;
}

function mapField(descriptor = {}) {
  const label = normalize(descriptor.label);
  const placeholder = normalize(descriptor.placeholder);
  const ariaLabel = normalize(descriptor.ariaLabel);
  const nearby = normalize(descriptor.nearbyText);
  const name = normalize(descriptor.name);
  const id = normalize(descriptor.id);
  const autocomplete = normalize(descriptor.autocomplete);
  const type = normalize(descriptor.type);

  const ctx = {
    text: [label, placeholder, ariaLabel, nearby].filter(Boolean).join(" | "),
    nameId: (name + " " + id).replace(/\s+/g, ""),
    autocomplete,
    type,
  };

  const scored = RULES.map((r) => ({ key: r.key, score: scoreRule(r, ctx) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) {
    return { fieldKey: null, confidence: 0, ambiguous: false, alternatives: [], sensitive: false };
  }

  const best = scored[0];
  const second = scored[1];
  const confidence = Math.min(0.99, best.score / 100);

  // Ambiguity: top-2 close in score AND belong to a known ambiguous group.
  let ambiguous = false;
  let alternatives = [];
  if (second && best.score - second.score <= 20) {
    for (const group of AMBIGUOUS_GROUPS) {
      if (group.includes(best.key) && group.includes(second.key)) {
        ambiguous = true;
        alternatives = scored.filter((s) => group.includes(s.key)).map((s) => s.key);
        break;
      }
    }
  }

  const sensitive = SENSITIVE_KEYS.has(best.key);

  return {
    fieldKey: best.key,
    confidence: Math.round(confidence * 100) / 100,
    ambiguous: ambiguous || confidence < 0.35,
    alternatives,
    sensitive,
    candidates: scored.slice(0, 4),
  };
}

module.exports = { mapField, SENSITIVE_KEYS: Array.from(SENSITIVE_KEYS) };
