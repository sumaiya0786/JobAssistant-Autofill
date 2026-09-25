const User = require("../models/User");
const Resume = require("../models/Resume");
const Job = require("../models/Job");
const gemini = require("../services/geminiService");
const { computeMatch } = require("../services/jobMatchingService");

async function loadContext(userId) {
  const user = await User.findById(userId).select("profile");
  const resume = await Resume.findOne({ userId, isActive: true }).sort({ createdAt: -1 });
  return { profile: user?.profile, resumeParsed: resume?.parsed };
}

// POST /api/job/analyze  { description, title, company, url }
async function analyzeJob(req, res, next) {
  try {
    const { description, title, company } = req.body || {};
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ error: "Please provide a job description to analyze." });
    }
    const analysis = await gemini.analyzeJobDescription({ description, title, company });
    res.json({ analysis });
  } catch (err) {
    next(err);
  }
}

// POST /api/job/match  { description, title, company }
async function matchJob(req, res, next) {
  try {
    const { description, title, company } = req.body || {};
    if (!description) return res.status(400).json({ error: "Job description is required" });
    const analysis = await gemini.analyzeJobDescription({ description, title, company });
    const ctx = await loadContext(req.userId);
    const match = computeMatch({ profile: ctx.profile, resumeParsed: ctx.resumeParsed, jobAnalysis: analysis });
    res.json({ analysis, match });
  } catch (err) {
    next(err);
  }
}

// POST /api/job/save  { title, company, url, description }
async function saveJob(req, res, next) {
  try {
    const { title, company, url, description } = req.body || {};
    const analysis = description ? await gemini.analyzeJobDescription({ description, title, company }) : {};
    const ctx = await loadContext(req.userId);
    const match = description
      ? computeMatch({ profile: ctx.profile, resumeParsed: ctx.resumeParsed, jobAnalysis: analysis })
      : { score: 0 };
    const job = await Job.create({
      userId: req.userId,
      title: title || analysis.title || "",
      company: company || analysis.company || "",
      url: url || "",
      description: description || "",
      analysis,
      matchScore: match.score || 0,
    });
    res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
}

async function listJobs(req, res, next) {
  try {
    const jobs = await Job.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (err) {
    next(err);
  }
}

async function deleteJob(req, res, next) {
  try {
    const j = await Job.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!j) return res.status(404).json({ error: "Job not found" });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyzeJob, matchJob, saveJob, listJobs, deleteJob };
