const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const auth = require("../middleware/auth");

// Middleware to restrict access to admins only
function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
}

// Comprehensive Analytics Dashboard
router.get("/dashboard", auth, adminOnly, async (req, res) => {
  try {
    const { locality } = req.query;
    const filter = locality ? { locality } : {};

    // Overview Stats
    const total = await Complaint.countDocuments(filter);
    const resolved = await Complaint.countDocuments({ ...filter, status: "resolved" });
    const inProgress = await Complaint.countDocuments({ ...filter, status: "in-progress" });
    const pending = await Complaint.countDocuments({ ...filter, status: { $in: ["submitted", "triaged", "assigned"] } });
    const escalated = await Complaint.countDocuments({ ...filter, escalationLevel: { $gt: 0 } });

    // By Department
    const byDepartment = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // By Locality
    const byLocality = await Complaint.aggregate([
      { $group: { _id: "$locality", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // By Priority
    const byPriority = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    // By Status
    const byStatus = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Average Resolution Time
    const resolutionStats = await Complaint.aggregate([
      { $match: { ...filter, status: "resolved", resolvedAt: { $exists: true } } },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ["$resolvedAt", "$createdAt"] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: "$resolutionTime" },
          minDays: { $min: "$resolutionTime" },
          maxDays: { $max: "$resolutionTime" }
        }
      }
    ]);

    // Staff Performance
    const staffPerformance = await Complaint.aggregate([
      { $match: { ...filter, status: "resolved", assignedTo: { $exists: true } } },
      { $group: { _id: "$assignedTo", resolvedCount: { $sum: 1 } } },
      { $sort: { resolvedCount: -1 } },
      { $limit: 10 }
    ]);

    // Populate staff names
    for (let perf of staffPerformance) {
      const staff = await User.findById(perf._id).select("name");
      perf.staffName = staff ? staff.name : "Unknown";
    }

    // Citizen Satisfaction (from ratings)
    const ratings = await Complaint.aggregate([
      { $match: { ...filter, citizenRating: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$citizenRating" },
          totalRated: { $sum: 1 }
        }
      }
    ]);

    // Recent Activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentComplaints = await Complaint.countDocuments({
      ...filter,
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      overview: {
        total,
        resolved,
        inProgress,
        pending,
        escalated,
        resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) : 0
      },
      byDepartment,
      byLocality,
      byPriority,
      byStatus,
      resolutionStats: resolutionStats[0] || { avgDays: 0, minDays: 0, maxDays: 0 },
      staffPerformance,
      citizenSatisfaction: ratings[0] || { avgRating: 0, totalRated: 0 },
      recentActivity: {
        last7Days: recentComplaints
      }
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Overview analytics
router.get("/overview", auth, adminOnly, async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: "resolved" });
    const pending = await Complaint.countDocuments({ status: { $ne: "resolved" } });

    res.json({ total, resolved, pending });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complaints by department
router.get("/by-department", auth, adminOnly, async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complaints by status
router.get("/by-status", auth, adminOnly, async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
