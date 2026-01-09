const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===================== REGISTER =====================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "citizen", phone, locality } = req.body;

    console.log("Registration data received:", { name, email, phone, role, locality });

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    if (!locality || locality.trim() === "") {
      return res.status(400).json({ error: "Locality is required. Please select your locality." });
    }

    const validLocalities = ["jangaon", "warangal", "narapally", "pocharam", "karimnagar"];
    const normalizedLocality = locality.toLowerCase().trim();
    
    if (!validLocalities.includes(normalizedLocality)) {
      return res.status(400).json({ error: `Invalid locality. Must be one of: ${validLocalities.join(", ")}` });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      phone: phone || "",
      locality: normalizedLocality,
    });

    res.json({ 
      message: "Registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        locality: user.locality
      }
    });
  } catch (err) {
    console.error("REGISTER ERROR 👉", err);
    res.status(500).json({ error: err.message });
  }
});

// ===================== LOGIN =====================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN ATTEMPT:", email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR 👉", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
