const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, completion } = require("../controllers/profileController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.use(authMiddleware);
router.get("/", getProfile);
router.put("/", updateProfile);
router.get("/completion", completion);

module.exports = router;
