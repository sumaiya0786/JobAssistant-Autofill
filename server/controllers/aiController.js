const gemini = require("../services/geminiService");
const { parseResume } = require("../services/resumeService");

// POST /api/ai/form-mapping  { fields: [descriptor, ...] } OR single descriptor
async function formMapping(req, res, next) {
  try {
    const body = req.body || {};
    if (Array.isArray(body.fields)) {
      const results = await Promise.all(body.fields.map((d) => gemini.mapFormField(d)));
      return res.json({ results });
    }
    const result = await gemini.mapFormField(body);
    res.json({ result });
  } catch (err) {
    next(err);
  }
}

// POST /api/ai/resume-analysis  { text }
async function resumeAnalysis(req, res, next) {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: "Resume text is required" });
    res.json({ parsed: parseResume(text) });
  } catch (err) {
    next(err);
  }
}

// POST /api/ai/job-analysis  { description, title, company }
async function jobAnalysis(req, res, next) {
  try {
    const { description, title, company } = req.body || {};
    if (!description) return res.status(400).json({ error: "Job description is required" });
    const analysis = await gemini.analyzeJobDescription({ description, title, company });
    res.json({ analysis });
  } catch (err) {
    next(err);
  }
}

module.exports = { formMapping, resumeAnalysis, jobAnalysis };
