
const { GoogleGenAI } = require("@google/genai");
const { extractSkills } = require("../utils/skills");

const AI_PROVIDER = process.env.AI_PROVIDER || "mock";

let geminiClient;

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in server/.env");
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return geminiClient;
}

function firstLine(text) {
  const lines = String(text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines[0] || "";
}

function guessTitle(text) {
  const match = String(text || "").match(
    /\b(?:job title|role|position)\s*[:\-]\s*(.+)/i
  );

  if (match) return match[1].split("\n")[0].trim().slice(0, 80);

  return firstLine(text).slice(0, 80) || "Job Position";
}

function guessCompany(text) {
  const match = String(text || "").match(
    /\b(?:company|organization|employer)\s*[:\-]\s*(.+)/i
  );

  if (match) return match[1].split("\n")[0].trim().slice(0, 80);

  const match2 = String(text || "").match(
    /\bat\s+([A-Z][A-Za-z0-9&.\- ]{2,40})/
  );

  return match2 ? match2[1].trim() : "";
}

function extractEducationRequirement(text) {
  const t = String(text || "").toLowerCase();

  if (/ph\.?d|doctorate/.test(t)) return "PhD preferred";
  if (/master'?s|m\.?tech|m\.?s\b|mba/.test(t)) return "Master's degree";
  if (/bachelor'?s|b\.?tech|b\.?e\b|b\.?s\b|degree in/.test(t)) {
    return "Bachelor's degree";
  }

  return "Not clearly specified";
}

function extractExperienceRequirement(text) {
  const match = String(text || "").match(
    /(\d+)\+?\s*(?:-\s*\d+\s*)?years?/i
  );

  if (match) return `${match[1]}+ years`;

  if (/intern|entry level|fresher|new grad/i.test(text || "")) {
    return "Entry level / Internship";
  }

  return "Not clearly specified";
}

function splitPreferred(text, skills) {
  const lower = String(text || "").toLowerCase();

  const markers = [
    "preferred",
    "nice to have",
    "nice-to-have",
    "bonus",
    "a plus",
    "good to have",
  ];

  let index = -1;

  for (const marker of markers) {
    const i = lower.indexOf(marker);
    if (i !== -1 && (index === -1 || i < index)) index = i;
  }

  if (index === -1) {
    return { required: skills, preferred: [] };
  }

  const requiredText = lower.slice(0, index);
  const preferredText = lower.slice(index);

  const required = skills.filter((skill) =>
    requiredText.includes(skill.toLowerCase().split("/")[0])
  );

  const preferred = skills.filter(
    (skill) =>
      !required.includes(skill) &&
      preferredText.includes(skill.toLowerCase().split("/")[0])
  );

  const leftover = skills.filter(
    (skill) => !required.includes(skill) && !preferred.includes(skill)
  );

  return {
    required: [...required, ...leftover],
    preferred,
  };
}

function extractResponsibilities(text) {
  return String(text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        /^[-*•]/.test(line) ||
        /responsib|develop|design|build|maintain|collaborate|implement/i.test(line)
    )
    .map((line) => line.replace(/^[-*•]\s*/, ""))
    .filter((line) => line.length > 8)
    .slice(0, 8);
}

function guessLocation(text) {
  const match = String(text || "").match(
    /\b(?:location|based in)\s*[:\-]\s*(.+)/i
  );

  if (match) return match[1].split("\n")[0].trim().slice(0, 60);
  if (/remote/i.test(text || "")) return "Remote";

  return "";
}

// Gemini-powered job description analysis
async function analyzeWithGemini({ description, title, company }) {
  const ai = getGeminiClient();

  const prompt = `
You are an expert job description analyzer.

Analyze the following job description and return accurate structured information.

Rules:
- Use only information supported by the job description.
- Do not invent skills, qualifications, experience or responsibilities.
- Separate mandatory skills from preferred skills.
- If information is missing, use "Not clearly specified".
- Return concise and relevant keywords.
- Return valid JSON matching the requested schema.

Job title provided: ${title || "Not provided"}
Company provided: ${company || "Not provided"}

Job description:
${description}
`;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          company: { type: "STRING" },
          requiredSkills: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
          preferredSkills: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
          allSkills: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
          education: { type: "STRING" },
          experience: { type: "STRING" },
          responsibilities: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
          location: { type: "STRING" },
          keywords: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
          technologies: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
        },
        required: [
          "title",
          "company",
          "requiredSkills",
          "preferredSkills",
          "allSkills",
          "education",
          "experience",
          "responsibilities",
          "location",
          "keywords",
          "technologies",
        ],
      },
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response");
  }

  const result = JSON.parse(response.text);

  return {
    provider: "gemini",
    title: title || result.title || "Job Position",
    company: company || result.company || "",
    requiredSkills: result.requiredSkills || [],
    preferredSkills: result.preferredSkills || [],
    allSkills: result.allSkills || [],
    education: result.education || "Not clearly specified",
    experience: result.experience || "Not clearly specified",
    responsibilities: result.responsibilities || [],
    location: result.location || "",
    keywords: result.keywords || [],
    technologies: result.technologies || [],
  };
}

// Existing local/mock analysis
async function analyzeWithMock({ description, title, company }) {
  const skills = extractSkills(description);
  const { required, preferred } = splitPreferred(description, skills);

  const keywords = Array.from(
    new Set(
      String(description || "")
        .toLowerCase()
        .split(/[^a-z0-9+#.]+/)
        .filter((word) => word.length > 4)
    )
  ).slice(0, 25);

  return {
    provider: "mock",
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

// Public AI interface
async function analyzeJobDescription({ description, title, company }) {
  if (!description || !String(description).trim()) {
    throw new Error("Job description is required");
  }

  if (AI_PROVIDER === "gemini") {
    return analyzeWithGemini({ description, title, company });
  }

  return analyzeWithMock({ description, title, company });
}

async function analyzeResume(text) {
  return require("./resumeService").parseResume(text);
}

async function mapFormField(descriptor) {
  return require("./formMappingService").mapField(descriptor);
}

module.exports = {
  analyzeJobDescription,
  analyzeResume,
  mapFormField,
  AI_PROVIDER,
};
