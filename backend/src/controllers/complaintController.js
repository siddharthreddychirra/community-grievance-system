/**
 * Complaint Controller
 * Handles complaint CRUD operations with AI integration
 */

const Complaint = require("../models/Complaint");
const { classifyDepartment, predictPriority, predictEscalationRisk } = require("../services/aiService");
const { findDuplicateBySimilarity } = require("../services/duplicateService");
const { calculateSLADeadline } = require("../jobs/escalationJob");

/**
 * Create a new complaint with AI-powered features
 */
exports.createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      department,
      media = [],
      location,
    } = req.body;

    // Get user's locality
    const user = await require("../models/User").findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // AI: Classify department if not provided or if 'others'
    let finalDepartment = department;
    let departmentSource = "manual";

    if (!department || department === "others" || department === "other") {
      finalDepartment = await classifyDepartment(title, description);
      departmentSource = "auto";
    }

    // AI: Predict priority
    const priority = await predictPriority(title, description);

    // AI: Check for duplicates and hotspots (within same locality)
    const duplicateMatch = await findDuplicateBySimilarity(title, description, location);
    let duplicateOf = null;

    if (duplicateMatch && duplicateMatch.score >= 0.75) {
      duplicateOf = duplicateMatch.id;
      console.log(`Duplicate detected: ${duplicateMatch.score.toFixed(2)} similarity`);
    }

    // Calculate SLA deadline based on priority
    const slaDeadline = calculateSLADeadline(priority, new Date());

    const complaint = await Complaint.create({
      title,
      description,
      department: finalDepartment,
      departmentSource,
      media,
      location,
      locality: user.locality, // Assign complaint to user's locality
      createdBy: req.user.id,
      status: "submitted",
      priority,
      duplicateOf,
      slaDeadline,
      escalationRisk: 0,
      escalationLevel: 0,
    });

    // AI: Predict escalation risk
    const escalationRisk = await predictEscalationRisk(complaint);
    complaint.escalationRisk = escalationRisk;
    await complaint.save();

    res.status(201).json({
      ...complaint.toObject(),
      aiInsights: {
        departmentClassified: departmentSource === "auto",
        priority,
        isDuplicate: !!duplicateOf,
        duplicateSimilarity: duplicateMatch?.score || 0,
        escalationRisk,
      },
    });
  } catch (err) {
    console.error("Create complaint error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all complaints (admin view)
 */
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email department")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error("Get complaints error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get user's own complaints
 */
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user.id })
      .populate("assignedTo", "name department staffLevel")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error("Get my complaints error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all complaints in user's locality (for citizen transparency)
 */
exports.getLocalityComplaints = async (req, res) => {
  try {
    const user = await require("../models/User").findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get all complaints in the user's locality
    const complaints = await Complaint.find({ 
      locality: user.locality,
      status: { $ne: "closed" } // Exclude closed complaints for cleaner map
    })
      .populate("createdBy", "name")
      .populate("assignedTo", "name department")
      .select("title description location status priority department createdAt")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error("Get locality complaints error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get single complaint details
 */
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("createdBy", "name email phone")
      .populate("assignedTo", "name email department staffLevel");

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.json(complaint);
  } catch (err) {
    console.error("Get complaint error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
