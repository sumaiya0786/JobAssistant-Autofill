const express = require("express");
const multer = require("multer");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  uploadResume,
  listResumes,
  getResumeFile,
  updateParsed,
  deleteResume,
} = require("../controllers/resumeController");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

router.use(authMiddleware);
router.post("/upload", upload.single("resume"), uploadResume);
router.get("/", listResumes);
router.get("/:id/file", getResumeFile);
router.put("/:id", updateParsed);
router.delete("/:id", deleteResume);

module.exports = router;
