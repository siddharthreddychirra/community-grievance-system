// backend/src/routes/admin.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const mongoose = require("mongoose");

// ===============================
// GET ALL COMPLAINTS (ADMIN)
// ===============================
router.get("/complaints", auth, requireRole("admin"), async (req, res) => {
  try {
    // Get admin's locality
    const admin = await User.findById(req.user.id || req.user._id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Super admin can see all complaints, regular admins see only their locality
    const filter = admin.locality === "all" ? {} : { locality: admin.locality };
    
    const complaints = await Complaint.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email department")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// ===============================
// UPDATE COMPLAINT DEPARTMENT (ADMIN)
// ===============================
router.put("/complaints/:id/department", auth, requireRole("admin"), async (req, res) => {
  try {
    const { department } = req.body;
    
    if (!department) {
      return res.status(400).json({ error: "Department is required" });
    }
    
    const validDepartments = ["roads", "water", "sanitation", "electricity", "municipal", "others"];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({ error: `Invalid department. Must be one of: ${validDepartments.join(", ")}` });
    }
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    
    const oldDepartment = complaint.department;
    complaint.department = department;
    
    // If complaint was assigned to staff from old department, unassign it
    if (complaint.assignedTo) {
      const assignedStaff = await User.findById(complaint.assignedTo);
      if (assignedStaff && assignedStaff.department !== department) {
        complaint.assignedTo = null;
        complaint.status = "triaged"; // Reset to triaged for reassignment
      }
    }
    
    await complaint.save();
    
    res.json({ 
      message: `Department changed from ${oldDepartment} to ${department}`,
      complaint 
    });
  } catch (err) {
    console.error("Change department error:", err);
    res.status(500).json({ error: "Failed to change department" });
  }
});

// ===============================
// GET STAFF BY DEPARTMENT
// ===============================
router.get("/staff/:department", auth, requireRole("admin"), async (req, res) => {
  try {
    // Get admin's locality
    const admin = await User.findById(req.user.id || req.user._id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Super admin can see all staff, regular admins see only their locality
    const filter = {
      role: "staff",
      department: req.params.department,
      ...(admin.locality !== "all" && { locality: admin.locality })
    };

    const staff = await User.find(filter).select("name email department staffLevel locality");

    res.json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

// ===============================
// ASSIGN COMPLAINT TO STAFF (POST)
// ===============================
router.post("/assign", auth, requireRole("admin"), async (req, res) => {
  try {
    const { complaintId, staffId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(complaintId) ||
      !mongoose.Types.ObjectId.isValid(staffId)
    ) {
      return res.status(400).json({ error: "Invalid IDs" });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    complaint.assignedTo = staffId;
    complaint.status = "assigned";
    complaint.assignedAt = new Date();
    await complaint.save();

    res.json({ message: "Complaint assigned successfully" });
  } catch (err) {
    console.error("Assignment error:", err);
    res.status(500).json({ error: "Assignment failed" });
  }
});

// ===============================
// ASSIGN COMPLAINT TO STAFF (PUT)
// ===============================
router.put("/complaints/:id/assign", auth, requireRole("admin"), async (req, res) => {
  try {
    const { staffId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ error: "Invalid IDs" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    complaint.assignedTo = staffId;
    complaint.status = "assigned";
    complaint.assignedAt = new Date();
    await complaint.save();

    res.json({ message: "Complaint assigned successfully" });
  } catch (err) {
    console.error("Assign error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// UPDATE PRIORITY (ADMIN)
// ===============================
router.put("/complaints/:id/priority", auth, requireRole("admin"), async (req, res) => {
  try {
    const { priority } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    complaint.priority = priority;
    complaint.prioritySetBy = req.user.id || req.user._id;

    // Update SLA based on priority
    const slaHours = {
      high: 24,    // 1 day
      medium: 72,  // 3 days
      low: 168,    // 7 days
    };

    complaint.slaDeadline = new Date(
      Date.now() + slaHours[priority] * 60 * 60 * 1000
    );

    await complaint.save();
    res.json({ message: "Priority updated", complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update priority" });
  }
});

// ===============================
// ANALYTICS DASHBOARD
// ===============================
router.get("/analytics", auth, requireRole("admin"), async (req, res) => {
  try {
    // Get admin's locality
    const admin = await User.findById(req.user.id || req.user._id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Super admin sees all, regular admins see only their locality
    const localityFilter = admin.locality === "all" ? {} : { locality: admin.locality };

    // Total counts
    const totalComplaints = await Complaint.countDocuments(localityFilter);
    const pendingComplaints = await Complaint.countDocuments({
      ...localityFilter,
      status: { $nin: ["resolved", "closed"] },
    });
    const resolvedComplaints = await Complaint.countDocuments({
      ...localityFilter,
      status: { $in: ["resolved", "closed"] },
    });
    const escalatedComplaints = await Complaint.countDocuments({
      ...localityFilter,
      status: "escalated",
    });

    // Department-wise breakdown
    const departmentStats = await Complaint.aggregate([
      { $match: localityFilter },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $in: ["$status", ["resolved", "closed"]] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Status-wise breakdown (locality-specific)
    const statusStats = await Complaint.aggregate([
      { $match: localityFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Priority breakdown (locality-specific)
    const priorityStats = await Complaint.aggregate([
      { $match: localityFilter },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent escalated complaints
    const recentEscalated = await Complaint.find({
      escalationLevel: { $gt: 0 },
    })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name department")
      .sort({ escalationLevel: -1, createdAt: -1 })
      .limit(10);

    res.json({
      total: totalComplaints,
      pending: pendingComplaints,
      resolved: resolvedComplaints,
      escalated: escalatedComplaints,
      departmentStats,
      statusStats,
      priorityStats,
      recentEscalated,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// ===============================
// STAFF PERFORMANCE METRICS
// ===============================
router.get("/staff-performance", auth, requireRole("admin"), async (req, res) => {
  try {
    const staffPerformance = await Complaint.aggregate([
      {
        $match: {
          assignedTo: { $ne: null },
          status: { $in: ["resolved", "closed"] }
        }
      },
      {
        $group: {
          _id: "$assignedTo",
          resolvedCount: { $sum: 1 },
          complaints: { $push: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "staffInfo"
        }
      },
      {
        $unwind: "$staffInfo"
      },
      {
        $project: {
          staffId: "$_id",
          name: "$staffInfo.name",
          email: "$staffInfo.email",
          department: "$staffInfo.department",
          staffLevel: "$staffInfo.staffLevel",
          resolvedCount: 1,
          complaints: 1
        }
      },
      {
        $sort: { resolvedCount: -1 }
      }
    ]);

    // Calculate average resolution time for each staff
    for (const staff of staffPerformance) {
      let totalResolutionTime = 0;
      let validComplaints = 0;

      for (const complaint of staff.complaints) {
        if (complaint.resolvedAt && complaint.createdAt) {
          const resolutionTime = new Date(complaint.resolvedAt) - new Date(complaint.createdAt);
          totalResolutionTime += resolutionTime;
          validComplaints++;
        }
      }

      staff.avgResolutionTimeHours = validComplaints > 0 
        ? Math.round(totalResolutionTime / validComplaints / (1000 * 60 * 60))
        : 0;

      // Don't send full complaint data, just summary
      staff.recentResolutions = staff.complaints.slice(0, 5).map(c => ({
        _id: c._id,
        title: c.title,
        priority: c.priority,
        resolvedAt: c.resolvedAt,
        staffRemark: c.staffRemark
      }));

      delete staff.complaints;
    }

    res.json(staffPerformance);
  } catch (err) {
    console.error("Staff performance error:", err);
    res.status(500).json({ error: "Failed to fetch staff performance" });
  }
});

// ===============================
// DELETE COMPLAINT (ADMIN ONLY)
// ===============================
router.delete("/complaints/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: "Complaint deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete complaint" });
  }
});

// ===============================
// GET ESCALATION ANALYTICS (ADMIN)
// ===============================
const { getEscalationAnalytics } = require("../controllers/adminController");
router.get("/escalations", auth, requireRole("admin"), getEscalationAnalytics);

module.exports = router;
