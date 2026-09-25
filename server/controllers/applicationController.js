const Application = require("../models/Application");

async function listApplications(req, res, next) {
  try {
    const apps = await Application.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json({ applications: apps, statuses: Application.STATUSES });
  } catch (err) {
    next(err);
  }
}

async function createApplication(req, res, next) {
  try {
    const { company, role, jobUrl, dateApplied, matchScore, notes, status } = req.body || {};
    if (!company) return res.status(400).json({ error: "Company is required" });
    const app = await Application.create({
      userId: req.userId,
      company,
      role: role || "",
      jobUrl: jobUrl || "",
      dateApplied: dateApplied || "",
      matchScore: matchScore || 0,
      notes: notes || "",
      status: status || "Saved",
    });
    res.status(201).json({ application: app });
  } catch (err) {
    next(err);
  }
}

async function updateApplication(req, res, next) {
  try {
    const allowed = ["company", "role", "jobUrl", "dateApplied", "matchScore", "notes", "status"];
    const update = {};
    for (const k of allowed) if (k in (req.body || {})) update[k] = req.body[k];
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: update },
      { new: true }
    );
    if (!app) return res.status(404).json({ error: "Application not found" });
    res.json({ application: app });
  } catch (err) {
    next(err);
  }
}

async function deleteApplication(req, res, next) {
  try {
    const app = await Application.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!app) return res.status(404).json({ error: "Application not found" });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/applications/analytics
async function analytics(req, res, next) {
  try {
    const apps = await Application.find({ userId: req.userId });
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 864e5);
    const monthAgo = new Date(now.getTime() - 30 * 864e5);

    const thisWeek = apps.filter((a) => new Date(a.createdAt) >= weekAgo).length;
    const thisMonth = apps.filter((a) => new Date(a.createdAt) >= monthAgo).length;
    const scores = apps.filter((a) => a.matchScore > 0).map((a) => a.matchScore);
    const avgMatch = scores.length ? Math.round(scores.reduce((x, y) => x + y, 0) / scores.length) : 0;

    const byStatus = {};
    for (const s of Application.STATUSES) byStatus[s] = 0;
    apps.forEach((a) => (byStatus[a.status] = (byStatus[a.status] || 0) + 1));

    const applied = apps.filter((a) => ["Applied", "Interview", "Rejected", "Offer"].includes(a.status)).length;
    const interviews = byStatus["Interview"] + byStatus["Offer"];
    const interviewRate = applied ? Math.round((interviews / applied) * 100) : 0;

    res.json({
      total: apps.length,
      thisWeek,
      thisMonth,
      avgMatch,
      interviews,
      interviewRate,
      byStatus,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listApplications, createApplication, updateApplication, deleteApplication, analytics };
