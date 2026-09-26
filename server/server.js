require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { connectDB } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health / root
app.get("/api", (req, res) => res.json({ message: "AI Job Assistant API", status: "ok", ai: process.env.AI_PROVIDER || "mock" }));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/resume", require("./routes/resumeRoutes"));
app.use("/api/job", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.NODE_PORT || 5001;

connectDB()
  .then(() => {
   app.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] Node backend listening on port ${PORT}`);
});
  })
  .catch((err) => {
    console.error("[server] failed to start:", err.message);
    process.exit(1);
  });
