const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      if (e.name === "TokenExpiredError") return res.status(401).json({ error: "Token expired" });
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authMiddleware };
