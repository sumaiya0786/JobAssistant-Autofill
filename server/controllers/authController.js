const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

function publicUser(user) {
  return { id: user._id, email: user.email, name: user.name };
}

async function register(req, res, next) {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: "Valid email is required" });
    if (!password || password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const normalized = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalized });
    if (existing) return res.status(409).json({ error: "An account with this email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: normalized,
      passwordHash,
      name: name || "",
      profile: { personal: { email: normalized, fullName: name || "" } },
    });

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const normalized = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalized });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

module.exports = { register, login, me };
