const pdfParse = require("pdf-parse");
const Resume = require("../models/Resume");
const { parseResume } = require("../services/resumeService");

async function uploadResume(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: "No resume file uploaded" });
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF resumes are supported" });
    }

    let text = "";
    try {
      const data = await pdfParse(req.file.buffer);
      text = data.text || "";
    } catch (e) {
      return res.status(422).json({ error: "Could not read text from this PDF. Try another file." });
    }

    const parsed = parseResume(text);
    const label = req.body?.label || "General Resume";

    // Deactivate previous active resume with the same label (versions).
    await Resume.updateMany({ userId: req.userId, label }, { $set: { isActive: false } });

    const resume = await Resume.create({
      userId: req.userId,
      label,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      dataBase64: req.file.buffer.toString("base64"),
      text,
      parsed,
      isActive: true,
    });

    res.status(201).json({ resume: sanitize(resume) });
  } catch (err) {
    next(err);
  }
}

function sanitize(r) {
  const o = r.toObject();
  delete o.dataBase64; // keep list responses light
  return o;
}

async function listResumes(req, res, next) {
  try {
    const resumes = await Resume.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ resumes: resumes.map(sanitize) });
  } catch (err) {
    next(err);
  }
}

async function getResumeFile(req, res, next) {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });
    if (!resume) return res.status(404).json({ error: "Resume not found" });
    const buffer = Buffer.from(resume.dataBase64, "base64");
    res.setHeader("Content-Type", resume.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${resume.fileName}"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

async function updateParsed(req, res, next) {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { parsed: req.body.parsed, label: req.body.label } },
      { new: true }
    );
    if (!resume) return res.status(404).json({ error: "Resume not found" });
    res.json({ resume: sanitize(resume) });
  } catch (err) {
    next(err);
  }
}

async function deleteResume(req, res, next) {
  try {
    const r = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!r) return res.status(404).json({ error: "Resume not found" });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadResume, listResumes, getResumeFile, updateParsed, deleteResume };
