const Complaint = require("../models/Complaint");
const User = require("../models/User");
const cron = require("node-cron");

/**
 * Escalate complaint to higher level staff based on SLA breach
 */
async function escalateToHigherLevel(complaint) {
  try {
    // Get current assigned staff
    const currentStaff = await User.findById(complaint.assignedTo);
    
    if (!currentStaff) {
      console.log("No staff assigned to complaint:", complaint._id);
      return;
    }

    const currentLevel = currentStaff.staffLevel;
    let nextLevel = null;

    // Determine next level
    if (currentLevel === "junior") {
      nextLevel = "mid";
    } else if (currentLevel === "mid") {
      nextLevel = "senior";
    } else {
      // Already at senior level, can't escalate further
      console.log("Complaint already at senior level:", complaint._id);
      return;
    }

    // Find higher level staff in same department AND locality
    const higherStaff = await User.findOne({
      role: "staff",
      department: complaint.department,
      locality: complaint.locality, // Match locality
      staffLevel: nextLevel,
    });

    if (!higherStaff) {
      console.log(`No ${nextLevel} staff found for department: ${complaint.department} in locality: ${complaint.locality}`);
      return;
    }

    // Update complaint assignment
    complaint.assignedTo = higherStaff._id;
    complaint.escalationLevel = (complaint.escalationLevel || 0) + 1;
    
    // Add to escalation history
    if (!complaint.escalationHistory) {
      complaint.escalationHistory = [];
    }
    
    complaint.escalationHistory.push({
      level: complaint.escalationLevel,
      escalatedAt: new Date(),
      reason: `SLA breach - escalated from ${currentLevel} to ${nextLevel} staff`,
    });

    await complaint.save();

    console.log(
      `✅ Complaint ${complaint._id} escalated from ${currentStaff.name} (${currentLevel}) to ${higherStaff.name} (${nextLevel})`
    );
  } catch (error) {
    console.error("Escalation error:", error);
  }
}

/**
 * Check and escalate overdue complaints
 */
async function checkAndEscalate() {
  try {
    console.log("[" + new Date().toISOString() + "] Running escalation check...");

    const now = new Date();

    // Find complaints that have breached SLA and are not resolved
    const overdueComplaints = await Complaint.find({
      status: { $nin: ["resolved", "closed"] },
      slaDeadline: { $lt: now },
      assignedTo: { $ne: null },
    }).populate("assignedTo", "name email staffLevel");

    if (overdueComplaints.length === 0) {
      console.log("✅ No complaints to escalate");
      return;
    }

    console.log(`Found ${overdueComplaints.length} overdue complaints`);

    for (const complaint of overdueComplaints) {
      // Check if already escalated recently (within last hour)
      const lastEscalation = complaint.escalationHistory?.[complaint.escalationHistory.length - 1];
      
      if (lastEscalation) {
        const hoursSinceLastEscalation = (now - new Date(lastEscalation.escalatedAt)) / (1000 * 60 * 60);
        
        if (hoursSinceLastEscalation < 1) {
          console.log(`Skipping ${complaint._id} - escalated recently`);
          continue;
        }
      }

      await escalateToHigherLevel(complaint);
    }

    console.log("✅ Escalation check completed");
  } catch (error) {
    console.error("Escalation job error:", error);
  }
}

/**
 * Start escalation cron job - runs every hour
 */
function startEscalationJob() {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    await checkAndEscalate();
  });

  console.log("🕐 Escalation cron job started (runs every hour)");
  
  // Run immediately on startup
  setTimeout(checkAndEscalate, 5000);
}

module.exports = { startEscalationJob, escalateToHigherLevel, checkAndEscalate };
