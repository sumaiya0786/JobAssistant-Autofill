const User = require("../models/User");

async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("profile name email");
    res.json({ profile: user.profile, name: user.name, email: user.email });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const incoming = req.body || {};
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Merge section by section so partial updates are safe.
    const sections = ["personal", "professional", "schooling", "other"];
    for (const s of sections) {
      if (incoming[s] && typeof incoming[s] === "object") {
        user.profile[s] = { ...user.profile[s]?.toObject?.() ? user.profile[s].toObject() : user.profile[s], ...incoming[s] };
      }
    }
    if (Array.isArray(incoming.education)) user.profile.education = incoming.education;
    if (Array.isArray(incoming.experience)) user.profile.experience = incoming.experience;
    if (Array.isArray(incoming.projects)) user.profile.projects = incoming.projects;
    if (typeof incoming.name === "string") user.name = incoming.name;

    user.markModified("profile");
    await user.save();
    res.json({ profile: user.profile, name: user.name, email: user.email });
  } catch (err) {
    next(err);
  }
}

// Profile completion percentage for the dashboard.
async function completion(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("profile");
    const p = user.profile || {};
    const checks = [
      p.personal?.fullName,
      p.personal?.email,
      p.personal?.phone,
      p.personal?.location,
      p.professional?.currentRole || p.professional?.targetRole,
      (p.professional?.skills || []).length > 0,
      p.professional?.linkedin || p.professional?.github,
      (p.education || []).length > 0,
      (p.experience || []).length > 0,
      (p.projects || []).length > 0,
    ];
    const filled = checks.filter(Boolean).length;
    res.json({ percent: Math.round((filled / checks.length) * 100) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, completion };
