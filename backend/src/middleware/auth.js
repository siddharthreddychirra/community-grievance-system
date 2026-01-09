const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // No Authorization header
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    // Wrong format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach user to request with both _id and id for consistency
    req.user = user;
    req.user.id = user._id.toString(); // Add id property for easier access

    next();
  } catch (err) {
    console.error("AUTH MIDDLEWARE ERROR:", err.message);
    return res.status(401).json({ error: "Unauthorized", message: err.message });
  }
};
