const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "" },
    company: { type: String, default: "" },
    url: { type: String, default: "" },
    description: { type: String, default: "" },
    analysis: { type: mongoose.Schema.Types.Mixed, default: {} },
    matchScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
