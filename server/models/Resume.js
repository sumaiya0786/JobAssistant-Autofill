const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, default: "General Resume" },
    fileName: { type: String, default: "resume.pdf" },
    mimeType: { type: String, default: "application/pdf" },
    dataBase64: { type: String, default: "" },
    text: { type: String, default: "" },
    parsed: {
      skills: { type: [String], default: [] },
      education: { type: [String], default: [] },
      experience: { type: [String], default: [] },
      projects: { type: [String], default: [] },
      certifications: { type: [String], default: [] },
      achievements: { type: [String], default: [] },
      technologies: { type: [String], default: [] },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", ResumeSchema);
