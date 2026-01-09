// backend/src/controllers/adminController.js

const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Department = require("../models/Department");
const { sendEmail } = require("../utils/mailer");

exports.listComplaints = async (req, res) => {
  try {
    const { status, department, assignedTo, search, page = 1, limit = 50 } = req.query;
    const q = {};
    if (status) q.status = status;
    if (department) q.department = department;
    if (assignedTo) q.assignedTo = assignedTo;
    if (search) {
      q.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { textNormalized: { $regex: search.toLowerCase(), $options: "i" } },
      ];
    }
    const docs = await Complaint.find(q)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("createdBy", "name email phone")
      .populate("assignedTo", "name email");
    const total = await Complaint.countDocuments(q);
    res.json({ total, page: Number(page), limit: Number(limit), data: docs });
  } catch (err) {
    console.error("admin.listComplaints error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getComplaint = async (req, res) => {
  try {
    const c = await Complaint.findById(req.params.id)
      .populate("createdBy", "name email phone")
      .populate("assignedTo", "name email");
    if (!c) return res.status(404).json({ error: "Not found" });
    res.json(c);
  } catch (err) {
    console.error("admin.getComplaint error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.assignComplaint = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });
    if (assignedTo) {
      const user = await User.findById(assignedTo);
      if (!user) return res.status(400).json({ error: "Assigned user not found" });
      complaint.assignedTo = user._id;
      complaint.status = complaint.status === "submitted" ? "assigned" : complaint.status;
    } else {
      complaint.assignedTo = null;
    }
    await complaint.save();

    // --- notify complaint creator about assignment (non-blocking)
    (async () => {
      try {
        const updated = complaint;
        const creatorId = updated.createdBy;
        if (creatorId) {
          const creator = await User.findById(creatorId).lean();
          if (creator && creator.email) {
            const subject = `Your complaint "${updated.title || 'Complaint'}" was assigned`;
            const html = `
              <p>Hello ${creator.name || ""},</p>
              <p>Your complaint "<strong>${updated.title || ''}</strong>" was assigned to a staff member.</p>
              <p><strong>Status:</strong> ${updated.status}</p>
              <p>You can view details on your dashboard.</p>
            `;
            sendEmail({ to: creator.email, subject, html }).catch(e => console.error("Auto-notify error (assign):", e));
          }
        }
      } catch (e) {
        console.error("Auto-notify (assign) failure:", e);
      }
    })();

    res.json({ message: "Assigned updated", complaint });
  } catch (err) {
    console.error("admin.assignComplaint error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["submitted", "triaged", "assigned", "in-progress", "resolved", "closed"];
    if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });
    complaint.status = status;
    await complaint.save();

    // --- notify complaint creator about status change (non-blocking)
    (async () => {
      try {
        const updated = complaint;
        const creatorId = updated.createdBy;
        if (creatorId) {
          const creator = await User.findById(creatorId).lean();
          if (creator && creator.email) {
            const subject = `Update: your complaint "${updated.title || 'Complaint'}" status is now ${updated.status}`;
            const html = `
              <p>Hello ${creator.name || ""},</p>
              <p>The status of your complaint "<strong>${updated.title || ''}</strong>" has been updated.</p>
              <p><strong>New status:</strong> ${updated.status}</p>
              ${updated.assignedTo ? `<p>Assigned to: ${typeof updated.assignedTo === 'object' ? (updated.assignedTo.name || '') : updated.assignedTo}</p>` : ''}
              <p>You can view more details on your dashboard.</p>
            `;
            sendEmail({ to: creator.email, subject, html }).catch(e => console.error("Auto-notify error (status):", e));
          }
        }
      } catch (e) {
        console.error("Auto-notify (status) failure:", e);
      }
    })();

    res.json({ message: "Status updated", complaint });
  } catch (err) {
    console.error("admin.updateStatus error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.listDepartments = async (req, res) => {
  try {
    const depts = await Department.find({}).sort({ priority: 1 });
    res.json(depts);
  } catch (err) {
    console.error("admin.listDepartments error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// list staff users (admin only)
exports.listStaff = async (req, res) => {
  try {
    const users = await User.find({ role: "staff" }).select("_id name email phone");
    res.json({ data: users });
  } catch (err) {
    console.error("admin.listStaff error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Create staff (calls same logic as register but enforces role=staff)
exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "name,email,password required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "User already exists" });

    const bcrypt = require("bcryptjs");
    const passwordHash = await bcrypt.hash(password, 10);

    const u = await User.create({
      name,
      email,
      phone,
      role: "staff",
      passwordHash,
      active: true
    });

    res.json({ message: "Staff created", user: { _id: u._id, name: u.name, email: u.email, phone: u.phone } });
  } catch (err) {
    console.error("admin.createStaff error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["admin","staff","citizen"].includes(role)) return res.status(400).json({ error: "Invalid role" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.role = role;
    await user.save();
    res.json({ message: "Role updated", user: { _id: user._id, role: user.role } });
  } catch (err) {
    console.error("admin.updateUserRole error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.active = false;
    await user.save();
    res.json({ message: "User deactivated" });
  } catch (err) {
    console.error("admin.deactivateUser error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, keywords = [], priority = 5, contactInfo = "" } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });
    const exists = await Department.findOne({ name });
    if (exists) return res.status(400).json({ error: "Department already exists" });
    const d = await Department.create({ name, keywords, priority, contactInfo });
    res.json({ message: "Department created", department: d });
  } catch (err) {
    console.error("admin.createDepartment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get escalation analytics for transparency
 */
exports.getEscalationAnalytics = async (req, res) => {
  try {
    // Get all complaints with escalations
    const escalatedComplaints = await Complaint.find({
      escalationLevel: { $gt: 0 }
    })
      .populate("createdBy", "name locality")
      .populate("assignedTo", "name staffLevel department")
      .sort({ createdAt: -1 });

    // Calculate escalation statistics
    const totalEscalated = escalatedComplaints.length;
    const byLevel = {
      level1: escalatedComplaints.filter(c => c.escalationLevel === 1).length,
      level2: escalatedComplaints.filter(c => c.escalationLevel === 2).length,
      level3: escalatedComplaints.filter(c => c.escalationLevel >= 3).length,
    };

    const byDepartment = {};
    const byLocality = {};
    
    escalatedComplaints.forEach(complaint => {
      // Count by department
      byDepartment[complaint.department] = (byDepartment[complaint.department] || 0) + 1;
      
      // Count by locality
      byLocality[complaint.locality] = (byLocality[complaint.locality] || 0) + 1;
    });

    // Get complaints escalated in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentEscalations = escalatedComplaints.filter(c => 
      c.escalationHistory && 
      c.escalationHistory.some(e => new Date(e.escalatedAt) > sevenDaysAgo)
    );

    res.json({
      totalEscalated,
      byLevel,
      byDepartment,
      byLocality,
      recentEscalations: recentEscalations.length,
      complaints: escalatedComplaints.map(c => ({
        _id: c._id,
        title: c.title,
        status: c.status,
        priority: c.priority,
        department: c.department,
        locality: c.locality,
        escalationLevel: c.escalationLevel,
        escalationHistory: c.escalationHistory,
        createdBy: c.createdBy,
        assignedTo: c.assignedTo,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    console.error("admin.getEscalationAnalytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
