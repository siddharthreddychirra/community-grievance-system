const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const upload = require("../middleware/upload");
const Complaint = require("../models/Complaint");

// 🔹 GET complaints assigned to logged-in staff (filtered by locality)
router.get("/complaints", auth, requireRole("staff"), async (req, res) => {
  try {
    const complaints = await Complaint.find({
      assignedTo: req.user.id || req.user._id,
      locality: req.user.locality, // Filter by staff's locality
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error("Staff complaints error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// 🔹 MARK AS RESOLVED
router.put(
  "/complaints/:id/resolve",
  auth,
  requireRole("staff"),
  upload.array("resolutionMedia", 5),
  async (req, res) => {
    try {
      const { staffRemark } = req.body;

      const complaint = await Complaint.findById(req.params.id);

      if (!complaint) {
        return res.status(404).json({ error: "Complaint not found" });
      }

      // Check if complaint is assigned to staff
      if (!complaint.assignedTo) {
        return res.status(400).json({ error: "Complaint is not assigned to any staff" });
      }

      // Fix: Use proper ID comparison - convert both to strings
      const assignedToId = complaint.assignedTo.toString();
      const currentUserId = (req.user.id || req.user._id).toString();

      if (assignedToId !== currentUserId) {
        return res.status(403).json({ 
          error: "Not authorized",
          message: "This complaint is not assigned to you"
        });
      }

      // Update complaint status
      complaint.status = "resolved";
      complaint.resolvedAt = new Date();
      
      if (staffRemark) {
        complaint.staffRemark = staffRemark;
      }

      // Handle resolution media
      if (req.files && req.files.length > 0) {
        const resolutionMedia = req.files.map((file) => {
          const isImage = file.mimetype.startsWith("image/");
          const isVideo = file.mimetype.startsWith("video/");
          
          // Get the subfolder from the file path
          let subfolder = "others";
          if (isImage) subfolder = "images";
          else if (isVideo) subfolder = "videos";
          else if (file.mimetype.startsWith("audio/")) subfolder = "audio";

          return {
            type: isImage ? "image" : isVideo ? "video" : "other",
            url: `/uploads/${subfolder}/${file.filename}`,
            originalName: file.originalname,
            uploadedAt: new Date(),
          };
        });

        complaint.resolutionMedia = resolutionMedia;
      }

      await complaint.save();

      // Populate the response
      await complaint.populate("createdBy", "name email");
      await complaint.populate("assignedTo", "name email department");

      res.json({ 
        message: "Complaint resolved successfully", 
        complaint 
      });
    } catch (err) {
      console.error("Resolve error:", err);
      res.status(500).json({ 
        error: "Server error", 
        message: err.message,
        details: process.env.NODE_ENV === "development" ? err.stack : undefined
      });
    }
  }
);

// 🔹 UPDATE STATUS (in-progress, etc.)
router.put(
  "/complaints/:id/status",
  auth,
  requireRole("staff"),
  async (req, res) => {
    try {
      const { status } = req.body;
      
      // Validate status
      const validStatuses = ["submitted", "triaged", "assigned", "in-progress", "resolved", "closed", "escalated"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const complaint = await Complaint.findById(req.params.id);

      if (!complaint) {
        return res.status(404).json({ error: "Complaint not found" });
      }

      // Check if complaint is assigned
      if (!complaint.assignedTo) {
        return res.status(400).json({ error: "Complaint is not assigned to any staff" });
      }

      // Fix: Use proper ID comparison
      const assignedToId = complaint.assignedTo.toString();
      const currentUserId = (req.user.id || req.user._id).toString();

      if (assignedToId !== currentUserId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      complaint.status = status;
      
      if (status === "in-progress" && !complaint.inProgressAt) {
        complaint.inProgressAt = new Date();
      }

      await complaint.save();
      res.json({ message: "Status updated", complaint });
    } catch (err) {
      console.error("Update status error:", err);
      res.status(500).json({ error: "Failed to update status", message: err.message });
    }
  }
);

// 🔹 UPDATE PRIORITY
router.put(
  "/complaints/:id/priority",
  auth,
  requireRole("staff"),
  async (req, res) => {
    try {
      const { priority } = req.body;
      
      // Validate priority
      if (!["low", "medium", "high"].includes(priority)) {
        return res.status(400).json({ error: "Invalid priority" });
      }

      const complaint = await Complaint.findById(req.params.id);

      if (!complaint) {
        return res.status(404).json({ error: "Complaint not found" });
      }

      // Check if complaint is assigned
      if (!complaint.assignedTo) {
        return res.status(400).json({ error: "Complaint is not assigned to any staff" });
      }

      // Fix: Use proper ID comparison
      const assignedToId = complaint.assignedTo.toString();
      const currentUserId = (req.user.id || req.user._id).toString();

      if (assignedToId !== currentUserId) {
        return res.status(403).json({ error: "Not authorized" });
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
      console.error("Update priority error:", err);
      res.status(500).json({ error: "Failed to update priority", message: err.message });
    }
  }
);

// 🔹 DELETE COMPLETED COMPLAINT
router.delete("/complaints/:id", auth, requireRole("staff"), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    // Check if complaint is assigned
    if (!complaint.assignedTo) {
      return res.status(400).json({ error: "Complaint is not assigned to any staff" });
    }

    // Fix: Use proper ID comparison
    const assignedToId = complaint.assignedTo.toString();
    const currentUserId = (req.user.id || req.user._id).toString();

    if (assignedToId !== currentUserId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (complaint.status !== "resolved" && complaint.status !== "closed") {
      return res.status(400).json({ error: "Can only delete resolved/closed complaints" });
    }

    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: "Complaint deleted successfully" });
  } catch (err) {
    console.error("Delete complaint error:", err);
    res.status(500).json({ error: "Failed to delete complaint", message: err.message });
  }
});

module.exports = router;
