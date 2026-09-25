const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { analyzeJob, matchJob, saveJob, listJobs, deleteJob } = require("../controllers/jobController");

router.use(authMiddleware);
router.post("/analyze", analyzeJob);
router.post("/match", matchJob);
router.post("/save", saveJob);
router.get("/", listJobs);
router.delete("/:id", deleteJob);

module.exports = router;
