const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Complaint = require("../models/Complaint");
const upload = require("../middleware/upload");
const { validateUploadedImages } = require("../middleware/imageValidator");
const { createComplaint, getAllComplaints, getMyComplaints, getComplaintById, getLocalityComplaints } = require("../controllers/complaintController");

// ===============================
// UPLOAD MEDIA TO COMPLAINT
// ===============================
router.post(
  "/:id/media",
  auth,
  upload.array("files", 5), // limit to 5 files
  validateUploadedImages, // Validate images are relevant
  async (req, res) => {
    try {
      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) {
        return res.status(404).json({ error: "Complaint not found" });
      }

      // Only creator, admin, or staff can upload
      const currentUserId = (req.user.id || req.user._id).toString();
      if (
        complaint.createdBy.toString() !== currentUserId &&
        req.user.role !== "admin" &&
        req.user.role !== "staff"
      ) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const mediaFiles = req.files.map((file) => {
        let type = "other";
        let subfolder = "others";
        
        if (file.mimetype.startsWith("image")) {
          type = "image";
          subfolder = "images";
        } else if (file.mimetype.startsWith("video")) {
          type = "video";
          subfolder = "videos";
        } else if (file.mimetype.startsWith("audio")) {
          type = "audio";
          subfolder = "audio";
        }

        return {
          type,
          url: `/uploads/${subfolder}/${file.filename}`,
          originalName: file.originalname,
        };
      });

      complaint.media.push(...mediaFiles);
      await complaint.save();

      res.json({
        message: "Media uploaded successfully",
        media: complaint.media,
      });
    } catch (err) {
      console.error("Upload media error:", err);
      res.status(500).json({ error: "Media upload failed" });
    }
  }
);

// ===============================
// CREATE COMPLAINT (with AI)
// ===============================
router.post("/", auth, createComplaint);

// ===============================
// MY COMPLAINTS
// ===============================
router.get("/my", auth, getMyComplaints);

// ===============================
// LOCALITY COMPLAINTS (for map transparency)
// ===============================
router.get("/locality/all", auth, getLocalityComplaints);

// ===============================
// RATE COMPLAINT (citizen only)
// ===============================
router.post("/:id/rate", auth, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    // Only creator can rate, only after resolution
    const currentUserId = (req.user.id || req.user._id).toString();
    if (complaint.createdBy.toString() !== currentUserId) {
      return res.status(403).json({ error: "Only complaint creator can rate" });
    }

    if (complaint.status !== "resolved") {
      return res.status(400).json({ error: "Can only rate resolved complaints" });
    }

    if (complaint.citizenRating) {
      return res.status(400).json({ error: "Complaint already rated" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    complaint.citizenRating = rating;
    complaint.citizenFeedback = feedback || "";
    complaint.ratedAt = new Date();
    await complaint.save();

    res.json({ message: "Rating submitted successfully", complaint });
  } catch (err) {
    console.error("Rating error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// GET SINGLE COMPLAINT
// ===============================
router.get("/:id", auth, getComplaintById);

// ===============================
// GET ESCALATION DATA FOR CITIZEN'S COMPLAINTS
// ===============================
router.get("/my/escalations", auth, async (req, res) => {
  try {
    const complaints = await Complaint.find({ 
      createdBy: req.user.id,
      escalationLevel: { $gt: 0 }
    })
      .populate("assignedTo", "name staffLevel department")
      .select("title status priority department escalationLevel escalationHistory createdAt")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error("Get escalations error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// ALL COMPLAINTS
// ===============================
router.get("/", auth, getAllComplaints);

module.exports = router;
