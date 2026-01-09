const Complaint = require("../models/Complaint");
const User = require("../models/User");
const { sendEmail } = require("../utils/mailer");

exports.notifyComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id).populate("createdBy", "name email");
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });

    const to = complaint.createdBy?.email;
    if (!to) return res.status(400).json({ error: "No recipient email" });

    const subject = `Update on your complaint: ${complaint.title}`;
    const html = `<p>Hello ${complaint.createdBy.name || ''},</p>
      <p>Your complaint titled "<strong>${complaint.title}</strong>" has an update.</p>
      <p><strong>Status:</strong> ${complaint.status}</p>
      <p>Visit the portal for details.</p>`;

    await sendEmail({ to, subject, html });
    res.json({ message: "Notification sent" });
  } catch (err) {
    console.error("notifyComplaint error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
