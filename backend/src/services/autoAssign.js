const User = require("../models/User");
const mongoose = require("mongoose");

async function autoAssignComplaint(complaint) {
  // Priority to staff level mapping
  const priorityToLevel = {
    high: "senior",    // Only senior staff can handle high priority
    medium: "mid",     // Mid-level can handle medium
    low: "junior",     // Junior can handle low
  };

  const requiredLevel = priorityToLevel[complaint.priority] || "junior";

  // Find staff of same department AND locality who can handle this priority
  const staffList = await User.find({
    role: "staff",
    department: complaint.department,
    locality: complaint.locality, // Filter by locality
  }).sort({ staffLevel: -1 }); // Sort by level (senior first)

  if (!staffList.length) {
    console.log(`No staff found for department: ${complaint.department} in locality: ${complaint.locality}`);
    return;
  }

  // Find staff with appropriate level
  let assignedStaff = null;
  
  if (complaint.priority === "high") {
    // Only senior staff
    assignedStaff = staffList.find(s => s.staffLevel === "senior");
  } else if (complaint.priority === "medium") {
    // Mid or senior staff
    assignedStaff = staffList.find(s => s.staffLevel === "mid" || s.staffLevel === "senior");
  } else {
    // Any level can handle low priority
    assignedStaff = staffList[0];
  }

  // Fallback to any available staff
  if (!assignedStaff) {
    assignedStaff = staffList[0];
  }

  complaint.assignedTo = new mongoose.Types.ObjectId(assignedStaff._id);
  complaint.status = "assigned";
  complaint.assignedAt = new Date();
  await complaint.save();

  console.log(
    `Complaint ${complaint._id} (${complaint.priority}) in ${complaint.locality} auto-assigned to ${assignedStaff.email} (${assignedStaff.staffLevel})`
  );
}

module.exports = autoAssignComplaint;
