const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { formMapping, resumeAnalysis, jobAnalysis } = require("../controllers/aiController");

// Form mapping is used by the extension during autofill; keep it authenticated too.
router.use(authMiddleware);
router.post("/form-mapping", formMapping);
router.post("/resume-analysis", resumeAnalysis);
router.post("/job-analysis", jobAnalysis);

module.exports = router;
