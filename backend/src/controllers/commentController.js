const Comment = require("../models/Comment");
const Complaint = require("../models/Complaint");

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params; // complaint id
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });

    const comment = await Comment.create({
      complaintId: complaint._id,
      userId: req.user?.id || null,
      text,
      attachments: [], // extend to support attachments later
    });

    res.json({ message: "Comment added", comment });
  } catch (err) {
    console.error("comment.addComment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
