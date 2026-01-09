const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, locality } = req.body;

    console.log("Registration attempt:", { name, email, phone, role, locality });

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
      return res.status(400).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone: phone || "",
      role: role || "citizen",
      locality: normalizedLocality,
      passwordHash,
    });

    res.json({ message: "User registered successfully", user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      locality: user.locality
    }});
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

// ✅ Login an existing user (FIXED bcrypt logic)
exports.login = async (req, res) => {
  try {
    const { email, password, locality } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify locality matches - STRICT CHECK
    const normalizedInputLocality = locality ? locality.toLowerCase().trim() : "";
    const userLocality = user.locality.toLowerCase().trim();
    
    if (normalizedInputLocality && normalizedInputLocality !== userLocality) {
      return res.status(401).json({ 
        error: `Invalid locality. This account is registered in ${user.locality}. Please select the correct locality.` 
      });
    }
    
    // If no locality provided in login, still validate user has a locality
    if (!user.locality) {
      return res.status(401).json({ error: "Account locality not set" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, locality: user.locality },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Respond with token + user info
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || null,
        locality: user.locality,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
