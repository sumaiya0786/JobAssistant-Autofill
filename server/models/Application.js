const mongoose = require("mongoose");

const STATUSES = ["Saved", "Applying", "Applied", "Interview", "Rejected", "Offer"];

const ApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    company: { type: String, required: true },
    role: { type: String, default: "" },
    jobUrl: { type: String, default: "" },
    dateApplied: { type: String, default: "" },
    matchScore: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    status: { type: String, enum: STATUSES, default: "Saved" },
  },
  { timestamps: true }
);

ApplicationSchema.statics.STATUSES = STATUSES;
module.exports = mongoose.model("Application", ApplicationSchema);
